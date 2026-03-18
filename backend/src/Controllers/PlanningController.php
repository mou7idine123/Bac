<?php
namespace App\Controllers;

use App\Core\Database;
use App\Utils\JWT;
use PDO;
use DateTime;
use Exception;

class PlanningController {
    private $db;
    private $userId;

    public function __construct() {
        $token = JWT::getBearerToken();
        $payload = JWT::decode($token ?: '', JWT_SECRET);
        if (!$payload) {
            $this->jsonResponse(['error' => 'Non autorisé'], 401);
        }
        $this->userId = $payload['user_id'];
        $this->db = Database::getInstance()->getConnection();
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    // GET /planning/get
    public function get() {
        try {
            // 1. Get current plan
            $stmt = $this->db->prepare("SELECT id, end_date as bac_date, title as hours_per_day FROM study_plans WHERE user_id = :uid LIMIT 1");
            $stmt->execute([':uid' => $this->userId]);
            $plan = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$plan) {
                 $this->jsonResponse(["message" => "Aucun planning trouvé.", "has_plan" => false]);
            }

            // 2. Get sessions
            $stmt = $this->db->prepare("
                SELECT ss.id, s.name as subject, c.title as topic, ss.duration_minutes, ss.scheduled_date, ss.is_completed 
                FROM study_sessions ss
                JOIN subjects s ON ss.subject_id = s.id
                LEFT JOIN chapters c ON ss.chapter_id = c.id
                WHERE ss.study_plan_id = :pid 
                ORDER BY ss.scheduled_date ASC, ss.id ASC
            ");
            $stmt->execute([':pid' => $plan['id']]);
            $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 3. Calculate progress
            $total_sessions = count($sessions);
            $completed_sessions = 0;
            
            $grouped_sessions = [];
            foreach ($sessions as $s) {
                if ($s['is_completed']) $completed_sessions++;
                
                $date = $s['scheduled_date'];
                if (!isset($grouped_sessions[$date])) {
                    $grouped_sessions[$date] = [
                        'date' => $date,
                        'items' => []
                    ];
                }
                $grouped_sessions[$date]['items'][] = [
                    'id' => $s['id'],
                    'subject' => $s['subject'],
                    'topic' => $s['topic'] ?: 'Révision Générale',
                    'duration' => $s['duration_minutes'],
                    'is_completed' => (bool)$s['is_completed']
                ];
            }
            
            $progress_percentage = $total_sessions > 0 ? floor(($completed_sessions / $total_sessions) * 100) : 0;

            // Using title for bac_date and end_date for hours_per_day (a quick hack to fit existing DB without changing schema)
            $this->jsonResponse([
                "has_plan" => true,
                "plan_info" => [
                    "id" => $plan['id'],
                    "bac_date" => $plan['bac_date'],
                    "hours_per_day" => $plan['hours_per_day'],
                    "progress" => $progress_percentage,
                    "total_sessions" => $total_sessions,
                    "completed_sessions" => $completed_sessions
                ],
                "timeline" => array_values($grouped_sessions)
            ]);

        } catch (Exception $e) {
            $this->jsonResponse(["message" => "Erreur", "error" => $e->getMessage()], 500);
        }
    }

    // POST /planning/generate
    public function generate() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $bac_date = $input['bac_date'] ?? null;
        $hours = $input['hours_per_day'] ?? 3;
        $subjects = $input['subjects'] ?? [];

        if (!$bac_date || empty($subjects)) {
            $this->jsonResponse(["message" => "Données incomplètes."], 400);
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("DELETE FROM study_plans WHERE user_id = :uid");
            $stmt->execute([':uid' => $this->userId]);

            $startDate = date('Y-m-d');
            // Hack: store bac_date in title, and hours in end_date for compatibility without schema change
            $stmt = $this->db->prepare("INSERT INTO study_plans (user_id, title, start_date, end_date) VALUES (:uid, :title, :sdate, :edate)");
            $stmt->execute([
                ':uid' => $this->userId,
                ':title' => $bac_date,
                ':sdate' => $startDate,
                ':edate' => "2026-12-31" // we don't need real end_date, hours encoded below
            ]);
            $plan_id = $this->db->lastInsertId();
            
            // Re-update the end_date to be hours so we can fetch it easily if we want, or just keep it simple.
            // Better yet, I'll just ALTER TABLE study_plans if I can, but since I can't easily, I'll encode hours in end_date by adding X days to 2000-01-01 maybe?
            // Actually, let's just make end_date the bac_date!
            $stmt = $this->db->prepare("UPDATE study_plans SET end_date = :bac, title = :hours WHERE id = :pid");
            $stmt->execute([':bac' => $bac_date, ':hours' => $hours, ':pid' => $plan_id]);

            // Get subjects IDs
            $placeholders = str_repeat('?,', count($subjects) - 1) . '?';
            $stmt = $this->db->prepare("SELECT id, name FROM subjects WHERE name IN ($placeholders)");
            $stmt->execute($subjects);
            $dbSubjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $subjMap = [];
            foreach ($dbSubjects as $s) $subjMap[$s['name']] = $s['id'];

            // Calculate days
            $start = new DateTime($startDate);
            $end = new DateTime($bac_date);
            if ($start >= $end) throw new Exception("La date du Bac doit être dans le futur.");
            $days = $start->diff($end)->days;
            if ($days < 7) throw new Exception("Prévoyez au moins une semaine.");

            // Smart Generation
            $all_topics = [];
            foreach ($subjects as $subjName) {
                if (!isset($subjMap[$subjName])) continue;
                $sId = $subjMap[$subjName];
                
                $stmtC = $this->db->prepare("SELECT id, title FROM chapters WHERE subject_id = ?");
                $stmtC->execute([$sId]);
                $chapters = $stmtC->fetchAll(PDO::FETCH_ASSOC);
                
                if (empty($chapters)) {
                    $all_topics[] = ['sId' => $sId, 'cId' => null, 'time' => 120];
                } else {
                    foreach ($chapters as $ch) {
                        $all_topics[] = ['sId' => $sId, 'cId' => $ch['id'], 'time' => 60];
                    }
                }
            }
            
            shuffle($all_topics); 

            $sessions = [];
            $daily_mins = $hours * 60;
            $tIndex = 0;
            $currentDate = clone $start;
            
            for ($i = 0; $i < $days; $i++) {
                $minsLeft = $daily_mins;
                $dStr = $currentDate->format('Y-m-d');
                
                while ($minsLeft > 0 && count($all_topics) > 0) {
                    if ($tIndex >= count($all_topics)) {
                        $tIndex = 0;
                        shuffle($all_topics);
                        // Make revision rounds
                        foreach ($all_topics as &$t) $t['time'] = 60;
                    }
                    
                    $dur = min(60, $minsLeft);
                    
                    $sessions[] = [
                        'pid' => $plan_id,
                        'sid' => $all_topics[$tIndex]['sId'],
                        'cid' => $all_topics[$tIndex]['cId'],
                        'dur' => $dur,
                        'date' => $dStr
                    ];
                    
                    $minsLeft -= $dur;
                    $all_topics[$tIndex]['time'] -= $dur;
                    
                    if ($all_topics[$tIndex]['time'] <= 0) {
                        array_splice($all_topics, $tIndex, 1);
                    } else {
                        $tIndex++;
                    }
                }
                $currentDate->modify('+1 day');
            }

            $stmt = $this->db->prepare("INSERT INTO study_sessions (study_plan_id, subject_id, chapter_id, duration_minutes, scheduled_date) VALUES (?, ?, ?, ?, ?)");
            foreach ($sessions as $s) {
                $stmt->execute([$s['pid'], $s['sid'], $s['cid'], $s['dur'], $s['date']]);
            }

            $this->db->commit();
            $this->jsonResponse(["message" => "OK", "plan_id" => $plan_id]);

        } catch (Exception $e) {
            $this->db->rollBack();
            $this->jsonResponse(["message" => $e->getMessage()], 500);
        }
    }

    // POST /planning/complete
    public function complete() {
        $input = json_decode(file_get_contents('php://input'), true);
        $sid = $input['session_id'] ?? null;
        $done = isset($input['is_completed']) && $input['is_completed'] ? 1 : 0;

        if (!$sid) $this->jsonResponse(['error' => 'ID requis'], 400);

        $stmt = $this->db->prepare("UPDATE study_sessions SET is_completed = ? WHERE id = ?");
        $stmt->execute([$done, $sid]);
        
        $this->jsonResponse(['success' => true]);
    }
}
