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

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM subjects WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
