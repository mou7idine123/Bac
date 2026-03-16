<?php
namespace App\Controllers;

use App\Core\Database;
use App\Utils\JWT;
use PDO;

class AdminController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    private function requireAdmin() {
        $token = JWT::getBearerToken();
        if (!$token) {
            $this->jsonResponse(['error' => 'Non autorisé'], 401);
        }
        $payload = JWT::decode($token, JWT_SECRET);
        if (!$payload || ($payload['role'] ?? '') !== 'admin') {
            $this->jsonResponse(['error' => 'Accès réservé aux administrateurs.'], 403);
        }
        return $payload;
    }

    // GET /admin/stats
    public function stats() {
        $this->requireAdmin();

        try {
            $totalUsers = $this->db->query("SELECT COUNT(*) FROM users")->fetchColumn();

            $stmt = $this->db->query("SELECT series, COUNT(*) as count FROM users GROUP BY series");
            $usersBySeries = ['C' => 0, 'D' => 0];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if (isset($row['series']) && isset($usersBySeries[$row['series']])) {
                    $usersBySeries[$row['series']] = $row['count'];
                }
            }

            $totalCourses   = $this->db->query("SELECT COUNT(*) FROM courses")->fetchColumn();
            $totalQuizzes   = $this->db->query("SELECT COUNT(*) FROM quizzes")->fetchColumn();
            $totalExercises = $this->db->query("SELECT COUNT(*) FROM exercises")->fetchColumn();
            $totalAnnales   = $this->db->query("SELECT COUNT(*) FROM annales")->fetchColumn();

            // Activité récente : les 5 derniers inscrits
            $stmt = $this->db->query(
                "SELECT first_name, last_name, email, series, created_at FROM users ORDER BY created_at DESC LIMIT 5"
            );
            $recentUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $recentActivity = array_map(function($u) {
                return [
                    'action' => 'Nouvelle inscription',
                    'target' => $u['first_name'] . ' ' . $u['last_name'],
                    'type'   => 'user',
                    'time'   => $u['created_at'],
                ];
            }, $recentUsers);

            $this->jsonResponse([
                'success' => true,
                'metrics' => [
                    'total_users'    => (int) $totalUsers,
                    'total_courses'  => (int) $totalCourses,
                    'total_quizzes'  => (int) $totalQuizzes,
                    'total_exercises'=> (int) $totalExercises,
                    'total_annales'  => (int) $totalAnnales,
                    'users_by_series'=> $usersBySeries,
                ],
                'recent_activity' => $recentActivity,
            ]);

        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /admin/users
    public function users() {
        $this->requireAdmin();

        $stmt = $this->db->query(
            "SELECT id, first_name, last_name, email, series, role, created_at FROM users ORDER BY created_at DESC"
        );
        $this->jsonResponse(['success' => true, 'users' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
}
