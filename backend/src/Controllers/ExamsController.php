<?php
namespace App\Controllers;

use App\Core\Database;
use App\Utils\JWT;
use PDO;

class ExamsController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    // GET /exams/list
    public function list() {
        $token = JWT::getBearerToken();
        $payload = JWT::decode($token ?: '', JWT_SECRET);
        $userId = $payload ? $payload['user_id'] : 0;
        
        $series = $_GET['series'] ?? 'C';
        try {
            $stmt = $this->db->prepare("
                SELECT e.*, s.name as subject,
                       (SELECT CASE WHEN status = 'completed' THEN 1 ELSE 0 END FROM exam_progress WHERE user_id = :user_id AND exam_id = e.id LIMIT 1) as is_completed
                FROM exams e 
                JOIN subjects s ON e.subject_id = s.id
                WHERE e.series = :series OR e.series = 'both'
                ORDER BY e.year DESC, e.id DESC
            ");
            $stmt->execute(['series' => $series, 'user_id' => $userId]);
            $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($exams as &$ex) {
                $ex['is_completed'] = (bool)$ex['is_completed'];
            }
            
            $this->jsonResponse(['success' => true, 'exams' => $exams]);
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
