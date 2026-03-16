<?php
namespace App\Controllers;

use App\Core\Database;
use App\Utils\JWT;

class AIController {
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

    // POST /ai/chat
    public function chat() {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['message'])) $this->jsonResponse(['error' => 'Message requis'], 400);

        // Simple mock response
        $reply = "D'accord, je comprends votre question sur: '" . htmlspecialchars($input['message']) . "'. Voici une explication simple pour vous aider à mieux comprendre ce concept du baccalauréat.";

        $this->jsonResponse(['reply' => $reply]);
    }
}
