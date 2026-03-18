<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class Subject {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM subjects ORDER BY id ASC");
        return $stmt->fetchAll();
    }

    public function getBySeries($seriesName) {
        $stmt = $this->db->prepare("
            SELECT s.* 
            FROM subjects s
            INNER JOIN series_subjects ss ON s.id = ss.subject_id
            INNER JOIN series sr ON ss.series_id = sr.id
            WHERE sr.name = :name
            ORDER BY s.id ASC
        ");
        $stmt->execute(['name' => $seriesName]);
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM subjects WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
