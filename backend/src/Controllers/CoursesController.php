<?php
namespace App\Controllers;

use App\Models\Subject;
use App\Models\Chapter;
use App\Utils\JWT;

class CoursesController {
    private $subjectModel;
    private $chapterModel;

    public function __construct() {
        // Optionnel : vérifier JWT ici pour toutes les routes
        $this->requireAuth();
        $this->subjectModel = new Subject();
        $this->chapterModel = new Chapter();
    }

    private function requireAuth() {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') return; // Handled nicely by index
        $token = JWT::getBearerToken();
        if (!$token || !JWT::decode($token, JWT_SECRET)) {
            $this->jsonResponse(['error' => 'Non autorisé. Connectez-vous.'], 401);
        }
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    // GET /courses/subjects
    public function subjects() {
        if (isset($_GET['series']) && !empty($_GET['series'])) {
            $subjects = $this->subjectModel->getBySeries($_GET['series']);
        } else {
            $subjects = $this->subjectModel->getAll();
        }
        $this->jsonResponse(['subjects' => $subjects]);
    }

    // GET /courses/chapters/{subject_id}
    public function chapters($subjectId = null) {
        if (!$subjectId) {
            $this->jsonResponse(['error' => 'ID de la matière requis'], 400);
        }
        $series = $_GET['series'] ?? null;
        $chapters = $this->chapterModel->getBySubject($subjectId, $series);
        $this->jsonResponse(['chapters' => $chapters]);
    }

    // GET /courses/lessons/{chapter_id}
    public function lessons($chapterId = null) {
        if (!$chapterId) {
            $this->jsonResponse(['error' => 'ID du chapitre requis'], 400);
        }
        $lessons = $this->chapterModel->getLessonsByChapter($chapterId);
        $this->jsonResponse(['lessons' => $lessons]);
    }
    
    public function lesson($lessonId = null) {
        if (!$lessonId) {
            $this->jsonResponse(['error' => 'ID de la lecon requis'], 400);
        }
        $lesson = $this->chapterModel->getLesson($lessonId);
        if ($lesson) {
            $lesson['reference_links'] = json_decode($lesson['reference_links'] ?? '[]', true) ?: [];
            $this->jsonResponse(['lesson' => $lesson]);
        } else {
            $this->jsonResponse(['error' => 'Lecon introuvable'], 404);
        }
    }

    // GET /courses/library
    public function library() {
        $series = $_GET['series'] ?? 'C'; // Default to C

        $token = JWT::getBearerToken();
        $payload = JWT::decode($token, JWT_SECRET);
        $userId = $payload['user_id'] ?? null;

        // 1. Fetch subjects for the series
        $subjects = $this->subjectModel->getBySeries($series);

        $db = \App\Core\Database::getInstance()->getConnection();

        // 2. Build the nested structure
        foreach ($subjects as &$subject) {
            // Provide fallback styles if missing
            $subject['emoji'] = '📘'; // default
            $subject['color'] = $subject['color_theme'] ?? '#667eea';
            $subject['bg'] = 'rgba(102,126,234,0.1)';
            $subject['gradient'] = 'linear-gradient(135deg,#667eea,#764ba2)';

            // Fetch lessons with progress if user is logged in
            if ($userId) {
                $stmt = $db->prepare("
                    SELECT l.*, lp.progress_percent
                    FROM lessons l
                    LEFT JOIN lesson_progress lp ON (l.id = lp.lesson_id AND lp.user_id = ?)
                    WHERE l.subject_id = ? AND (l.series = ? OR l.series = 'both')
                    ORDER BY l.order_index ASC, l.id DESC
                ");
                $stmt->execute([$userId, $subject['id'], $series]);
            } else {
                $stmt = $db->prepare("
                    SELECT l.*
                    FROM lessons l
                    WHERE l.subject_id = ? AND (l.series = ? OR l.series = 'both')
                    ORDER BY l.order_index ASC, l.id DESC
                ");
                $stmt->execute([$subject['id'], $series]);
            }
            $lessons = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch revision sheets for this subject
            $stmt = $db->prepare("SELECT * FROM revision_sheets WHERE subject_id = ?");
            $stmt->execute([$subject['id']]);
            $sheets = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            $totalProgress = 0;
            $processedLessons = array_map(function($l) use (&$totalProgress) {
                $l['reference_links'] = json_decode($l['reference_links'] ?? '[]', true) ?: [];
                $l['progress'] = (int)($l['progress_percent'] ?? 0);
                $totalProgress += $l['progress'];
                return $l;
            }, $lessons);

            $subjectProgress = count($lessons) > 0 ? round($totalProgress / count($lessons)) : 0;

            $subject['lessons'] = $processedLessons;
            $subject['sheets']  = $sheets;
            $subject['progress'] = $subjectProgress;
        }

        $this->jsonResponse(['subjects' => $subjects]);
    }

    // GET /courses/quizzes?series=C
    public function quizzes() {
        $series = $_GET['series'] ?? 'C';
        $db = \App\Core\Database::getInstance()->getConnection();

        // Get a single quiz with questions+answers
        if (isset($_GET['id'])) {
            $id = (int)$_GET['id'];
            $stmt = $db->prepare("SELECT q.*, s.name as subject FROM quizzes q JOIN subjects s ON q.subject_id = s.id WHERE q.id = ?");
            $stmt->execute([$id]);
            $quiz = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$quiz) { $this->jsonResponse(['error' => 'Introuvable'], 404); }

            $stmtQ = $db->prepare("SELECT * FROM questions WHERE quiz_id = ?");
            $stmtQ->execute([$id]);
            $questions = $stmtQ->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($questions as &$q) {
                $stmtA = $db->prepare("SELECT * FROM answers WHERE question_id = ?");
                $stmtA->execute([$q['id']]);
                $q['answers'] = $stmtA->fetchAll(\PDO::FETCH_ASSOC);
            }
            $quiz['questions'] = $questions;
            $this->jsonResponse(['success' => true, 'quiz' => $quiz]);
            return;
        }

        $token = \App\Utils\JWT::getBearerToken();
        $payload = \App\Utils\JWT::decode($token ?: '', JWT_SECRET);
        $userId = $payload ? $payload['user_id'] : 0;

        $stmt = $db->prepare("
            SELECT q.id, q.title, q.series, q.difficulty, q.time_limit_minutes, s.name as subject,
                   (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as questions_count,
                   (SELECT CASE WHEN status = 'completed' THEN 1 ELSE 0 END FROM quiz_progress WHERE user_id = :user_id AND quiz_id = q.id LIMIT 1) as is_completed
            FROM quizzes q
            JOIN subjects s ON q.subject_id = s.id
            WHERE (q.series = :series OR q.series = 'both')
            ORDER BY q.id DESC
        ");
        $stmt->execute(['series' => $series, 'user_id' => $userId]);
        $quizzes = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Convert to boolean for frontend convenience
        foreach ($quizzes as &$qz) {
            $qz['is_completed'] = (bool)$qz['is_completed'];
        }

        $this->jsonResponse(['success' => true, 'quizzes' => $quizzes]);
    }

    // POST /courses/lesson-progress
    public function lessonProgress() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(['error' => 'POST requis'], 405);
        }

        $token = JWT::getBearerToken();
        $payload = JWT::decode($token, JWT_SECRET);
        $userId = $payload['user_id'] ?? null;

        if (!$userId) {
            $this->jsonResponse(['error' => 'Non autorisé'], 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $lessonId = (int)($input['lesson_id'] ?? 0);
        $progress = min(100, max(0, (int)($input['progress_percent'] ?? 0)));

        if (!$lessonId) {
            $this->jsonResponse(['error' => 'lesson_id requis'], 400);
        }

        $db = \App\Core\Database::getInstance();
        $stmt = $db->prepare("
            INSERT INTO lesson_progress (user_id, lesson_id, progress_percent)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE progress_percent = GREATEST(progress_percent, ?), updated_at = NOW()
        ");
        $stmt->execute([$userId, $lessonId, $progress, $progress]);

        $this->jsonResponse(['success' => true, 'progress' => $progress]);
    }
}
