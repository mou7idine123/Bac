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
        
        // 2. Progression des chapitres
        $stmt = $this->db->prepare("SELECT c.subject_id, s.name, COUNT(p.id) as chapters_started, SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as chapters_completed 
                                  FROM user_progress p 
                                  JOIN chapters c ON p.chapter_id = c.id 
                                  JOIN subjects s ON c.subject_id = s.id 
                                  WHERE p.user_id = ? GROUP BY c.subject_id");
        $stmt->execute([$this->userId]);
        $progressStats = $stmt->fetchAll();
        
        // 3. Planning d'étude a venir (Mock if no feature implementation full yet)
        
        $this->jsonResponse([
            'quiz_stats' => [
                'attempts' => (int)$quizStats['attempts'],
                'avg_score' => round((float)$quizStats['avg_score'], 1)
            ],
            'subject_progress' => $progressStats
        ]);
    }
}
