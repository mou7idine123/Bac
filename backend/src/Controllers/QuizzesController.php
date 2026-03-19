<?php
namespace App\Controllers;

use App\Core\Database;
use App\Utils\JWT;
use PDO;

class QuizzesController {
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

    // GET /quizzes/chapter/{chapterId}
    public function chapter($chapterId = null) {
        if (!$chapterId) $this->jsonResponse(['error' => 'ID chapitre requis'], 400);
        $stmt = $this->db->prepare("SELECT * FROM quizzes WHERE chapter_id = ?");
        $stmt->execute([$chapterId]);
        $this->jsonResponse(['quizzes' => $stmt->fetchAll()]);
    }

    // GET /quizzes/detail/{quizId}
    public function detail($quizId = null) {
        if (!$quizId) $this->jsonResponse(['error' => 'ID quiz requis'], 400);
        
        $stmt = $this->db->prepare("SELECT * FROM quizzes WHERE id = ?");
        $stmt->execute([$quizId]);
        $quiz = $stmt->fetch();
        
        if (!$quiz) $this->jsonResponse(['error' => 'Quiz introuvable'], 404);
        
        $stmtQ = $this->db->prepare("SELECT id, question_text, explanation, points FROM questions WHERE quiz_id = ?");
        $stmtQ->execute([$quizId]);
        $questions = $stmtQ->fetchAll();
        
        foreach ($questions as &$q) {
            $stmtA = $this->db->prepare("SELECT id, answer_text FROM answers WHERE question_id = ?");
            $stmtA->execute([$q['id']]);
            $q['answers'] = $stmtA->fetchAll();
        }
        
        $quiz['questions'] = $questions;
        $this->jsonResponse(['quiz' => $quiz]);
    }

    // POST /quizzes/submit/{quizId}
    public function submit($quizId = null) {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['answers'])) $this->jsonResponse(['error' => 'Réponses requises'], 400);
        
        $score = 0;
        $total = 0;
        $results = [];

        foreach ($input['answers'] as $questionId => $answerId) {
            $stmt = $this->db->prepare("SELECT is_correct, explanation, points FROM answers JOIN questions ON answers.question_id = questions.id WHERE answers.id = ? AND questions.id = ?");
            $stmt->execute([$answerId, $questionId]);
            $ans = $stmt->fetch();
            
            if ($ans) {
                $total += $ans['points'];
                if ($ans['is_correct']) {
                    $score += $ans['points'];
                }
                $results[] = [
                    'question_id' => $questionId,
                    'is_correct' => (bool)$ans['is_correct'],
                    'explanation' => $ans['explanation']
                ];
            }
        }
        
        // Save attempt
        $stmt = $this->db->prepare("INSERT INTO quiz_attempts (user_id, quiz_id, score, total_points) VALUES (?, ?, ?, ?)");
        $stmt->execute([$this->userId, $quizId, $score, $total]);
        
        $this->jsonResponse(['score' => $score, 'total' => $total, 'details' => $results]);
    }
}
