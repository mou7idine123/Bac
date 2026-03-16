<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class Chapter {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getBySubject($subjectId) {
        $stmt = $this->db->prepare("SELECT * FROM chapters WHERE subject_id = :subject_id ORDER BY order_index ASC");
        $stmt->execute(['subject_id' => $subjectId]);
        return $stmt->fetchAll();
    }

    public function getLessonsByChapter($chapterId) {
        $stmt = $this->db->prepare("SELECT * FROM lessons WHERE chapter_id = :chapter_id ORDER BY order_index ASC");
        $stmt->execute(['chapter_id' => $chapterId]);
        return $stmt->fetchAll();
    }
    
    public function getLesson($lessonId) {
        $stmt = $this->db->prepare("SELECT * FROM lessons WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $lessonId]);
        return $stmt->fetch();
    }
}
