<?php
namespace App\Core;

class Router {
    public function handleRequest($uri) {
        // Nettoyer l'URI, enlever '/api/' s'il y est, et 'index.php'
        $path = str_replace(['/api/index.php', '/api'], '', $uri);
        $path = trim($path, '/');
        
        $parts = explode('/', $path);
        
        // Default controller & action
        $controllerName = 'Auth';
        $action = 'index';
        $args = [];
        
        if (!empty($parts[0])) {
            $controllerName = ucfirst($parts[0]);
        }
        
        if (isset($parts[1])) {
            $action = $parts[1];
        }
        
        if (count($parts) > 2) {
            $args = array_slice($parts, 2);
        }

        $controllerClass = "App\\Controllers\\{$controllerName}Controller";

        if (class_exists($controllerClass)) {
            $controller = new $controllerClass();
            if (method_exists($controller, $action)) {
                try {
                    // Call the method, pass args and the HTTP method
                    call_user_func_array([$controller, $action], $args);
                } catch (\Exception $e) {
                    $this->sendError(500, "Erreur Serveur: " . $e->getMessage());
                }
            } else {
                $this->sendError(404, "Endpoint '$action' introuvable dans '$controllerName'.");
            }
        } else {
            $this->sendError(404, "Contrôleur '$controllerName' introuvable.");
        }
    }

    private function sendError($code, $message) {
        http_response_code($code);
        echo json_encode(["error" => "true", "message" => $message]);
        exit;
    }
}
