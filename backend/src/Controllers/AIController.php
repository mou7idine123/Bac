<?php
namespace App\Controllers;

use App\Core\Database;
use App\Utils\JWT;

class AIController {
    private $db;
    private $userId;
    private $settingsFile;

    public function __construct() {
        $token = JWT::getBearerToken();
        $payload = JWT::decode($token ?: '', JWT_SECRET);
        if (!$payload) {
            $this->jsonResponse(['error' => 'Non autorisé'], 401);
        }
        $this->userId = $payload['user_id'];
        $this->db = Database::getInstance()->getConnection();
        $this->settingsFile = __DIR__ . '/../../config/settings.json';
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    private function getSettings() {
        if (!file_exists($this->settingsFile)) return [];
        return json_decode(file_get_contents($this->settingsFile), true) ?? [];
    }

    // POST /ai/chat
    public function chat() {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['message'])) $this->jsonResponse(['error' => 'Message requis'], 400);

        $message = trim($input['message']);
        $history = $input['history'] ?? [];

        $settings = $this->getSettings();
        $apiKey = $settings['GEMINI_API_KEY'] ?? '';

        if (empty($apiKey)) {
            $this->jsonResponse(['reply' => "⚠️ L'assistant IA n'est pas encore configuré. Un administrateur doit enregistrer la clé API Google Gemini dans les Paramètres de l'administration."]);
        }

        // System Prompt
        $systemPrompt = "Tu es un tuteur académique expert pour les élèves préparant le Baccalauréat en Mauritanie. "
            . "Tu aides avec les matières suivantes : Mathématiques, Physique-Chimie, Sciences Naturelles, Philosophie. "
            . "Tes réponses sont claires, pédagogiques, structurées avec des étapes quand nécessaire, et adaptées au niveau Bac. "
            . "Réponds toujours en français. Si on te demande un quiz, génère 3-5 questions avec les réponses correctes à la fin. "
            . "Si on te demande une fiche, structure-la avec des points clés, formules importantes et exemples.";

        // Format for Gemini API
        $contents = [];
        foreach ($history as $h) {
            $role = ($h['role'] === 'assistant') ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $h['content']]]
            ];
        }
        // Add current user message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $message]]
        ];

        $payload = [
            'contents' => $contents,
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 2048,
            ]
        ];

        // Call Gemini API
        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;
        
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err || $httpCode !== 200) {
            $this->jsonResponse(['error' => 'Erreur lors de la communication avec Gemini: ' . ($err ?: $response)], 500);
        }

        $data = json_decode($response, true);
        $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? "Je n'ai pas pu générer de réponse.";

        $this->jsonResponse(['reply' => trim($reply)]);
    }
}
