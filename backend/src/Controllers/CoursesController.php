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
        $subjects = $this->subjectModel->getAll();
        $this->jsonResponse(['subjects' => $subjects]);
    }

    // GET /courses/chapters/{subject_id}
    public function chapters($subjectId = null) {
        if (!$subjectId) {
            $this->jsonResponse(['error' => 'ID de la matière requis'], 400);
        }
        $chapters = $this->chapterModel->getBySubject($subjectId);
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
    
    // GET /courses/lesson/{lesson_id}
    public function lesson($lessonId = null) {
        if (!$lessonId) {
            $this->jsonResponse(['error' => 'ID de la lecon requis'], 400);
        }
        $lesson = $this->chapterModel->getLesson($lessonId);
        if ($lesson) {
            $this->jsonResponse(['lesson' => $lesson]);
        } else {
            $this->jsonResponse(['error' => 'Lecon introuvable'], 404);
        }
    }
}
