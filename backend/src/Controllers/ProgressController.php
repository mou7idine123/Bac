<?php
namespace App\Controllers;

use App\Core\Database;
use App\Utils\JWT;

class ProgressController {
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

    // GET /progress/dashboard
    public function dashboard() {
        // Obtenir des stats globales pour l'utilisateur
        
        // 1. Quizzes
        $stmt = $this->db->prepare("SELECT COUNT(*) as attempts, AVG(score/total_points*100) as avg_score FROM quiz_attempts WHERE user_id = ?");
        $stmt->execute([$this->userId]);
        $quizStats = $stmt->fetch();

        $stmt = $this->db->prepare("SELECT COUNT(*) FROM quiz_progress WHERE user_id = ? AND status = 'completed'");
        $stmt->execute([$this->userId]);
        $quizCompleted = $stmt->fetchColumn();
        
        $stmt = $this->db->query("SELECT COUNT(*) FROM quizzes");
        $quizTotal = $stmt->fetchColumn();

        // 2. Exercices terminés
        $stmt = $this->db->prepare("SELECT COUNT(*) as completed FROM exercise_progress WHERE user_id = ? AND status = 'completed'");
        $stmt->execute([$this->userId]);
        $exCompleted = $stmt->fetchColumn();
        
        $stmt = $this->db->query("SELECT COUNT(*) FROM exercises");
        $exTotal = $stmt->fetchColumn();

        // 3. Annales terminées (exams)
        $stmt = $this->db->prepare("SELECT COUNT(*) as completed FROM exam_progress WHERE user_id = ? AND status = 'completed'");
        $stmt->execute([$this->userId]);
        $examCompleted = $stmt->fetchColumn();
        
        $stmt = $this->db->query("SELECT COUNT(*) FROM exams");
        $examTotal = $stmt->fetchColumn();
        
        // Subject breakdown
        // We'll calculate progress points per subject: 1 point per exercise/exam completed, and average quiz score
        // First get all subjects for the user's series
        $stmt = $this->db->prepare("SELECT id, name FROM subjects");
        $stmt->execute();
        $subjects = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Quizzes per subject
        $stmt = $this->db->prepare("SELECT s.name, COUNT(*) as quizzes, AVG(score/total_points*100) as score
                                    FROM quiz_attempts qa
                                    JOIN quizzes q ON qa.quiz_id = q.id
                                    JOIN subjects s ON q.subject_id = s.id
                                    WHERE qa.user_id = ? GROUP BY s.id");
        $stmt->execute([$this->userId]);
        $quizBySubject = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Exercises per subject
        $stmt = $this->db->prepare("SELECT s.name, COUNT(*) as done
                                    FROM exercise_progress ep
                                    JOIN exercises e ON ep.exercise_id = e.id
                                    JOIN subjects s ON e.subject_id = s.id
                                    WHERE ep.user_id = ? AND ep.status = 'completed' GROUP BY s.id");
        $stmt->execute([$this->userId]);
        $exBySubject = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Exams per subject
        $stmt = $this->db->prepare("SELECT s.name, COUNT(*) as done
                                    FROM exam_progress ep
                                    JOIN exams e ON ep.exam_id = e.id
                                    JOIN subjects s ON e.subject_id = s.id
                                    WHERE ep.user_id = ? AND ep.status = 'completed' GROUP BY s.id");
        $stmt->execute([$this->userId]);
        $examBySubject = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Combine
        $subjectStats = [];
        foreach ($subjects as $subj) {
            $name = $subj['name'];
            $subjectStats[$name] = [
                'name' => $name,
                'quizzes' => 0,
                'score' => 0,
                'exercises_done' => 0,
                'exams_done' => 0,
            ];
        }
        foreach ($quizBySubject as $row) {
            $subjectStats[$row['name']]['quizzes'] = (int)$row['quizzes'];
            $subjectStats[$row['name']]['score'] = round((float)$row['score'], 1);
        }
        foreach ($exBySubject as $row) {
            $subjectStats[$row['name']]['exercises_done'] = (int)$row['done'];
        }
        foreach ($examBySubject as $row) {
            $subjectStats[$row['name']]['exams_done'] = (int)$row['done'];
        }

        // Only keep subjects that have at least one thing done, or all if empty
        $filteredStats = array_filter($subjectStats, fn($s) => $s['quizzes'] > 0 || $s['exercises_done'] > 0 || $s['exams_done'] > 0);
        
        $this->jsonResponse([
            'quiz_stats' => [
                'attempts' => (int)$quizStats['attempts'],
                'avg_score' => round((float)$quizStats['avg_score'], 1),
                'completed' => (int)$quizCompleted,
                'total' => (int)$quizTotal
            ],
            'exercise_stats' => [
                'total' => (int)$exTotal,
                'completed' => (int)$exCompleted
            ],
            'exam_stats' => [
                'total' => (int)$examTotal,
                'completed' => (int)$examCompleted
            ],
            'subject_stats' => array_values($filteredStats)
        ]);
    }

    // POST /progress/exercise
    public function exercise() {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['exercise_id'] ?? null;
        $status = $input['status'] ?? 'completed';

        if (!$id) $this->jsonResponse(['error' => 'ID requis'], 400);

        $stmt = $this->db->prepare("INSERT INTO exercise_progress (user_id, exercise_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?");
        $stmt->execute([$this->userId, $id, $status, $status]);
        
        $this->jsonResponse(['success' => true]);
    }

    // POST /progress/quiz
    public function quiz() {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['quiz_id'] ?? null;
        $status = $input['status'] ?? 'completed';

        if (!$id) $this->jsonResponse(['error' => 'ID requis'], 400);

        $stmt = $this->db->prepare("INSERT INTO quiz_progress (user_id, quiz_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?");
        $stmt->execute([$this->userId, $id, $status, $status]);
        
        $this->jsonResponse(['success' => true]);
    }

    // POST /progress/exam
    public function exam() {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['exam_id'] ?? null;
        $status = $input['status'] ?? 'completed';

        if (!$id) $this->jsonResponse(['error' => 'ID requis'], 400);

        $stmt = $this->db->prepare("INSERT INTO exam_progress (user_id, exam_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?");
        $stmt->execute([$this->userId, $id, $status, $status]);
        
        $this->jsonResponse(['success' => true]);
    }
}
