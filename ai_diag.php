<?php
require_once __DIR__ . '/backend/config/config.php';
require_once __DIR__ . '/backend/src/Core/Database.php';

use App\Core\Database;

echo "--- BAC PREPA AI DIAGNOSTIC ---\n";

// 1. DB Connection
try {
    $db = Database::getInstance()->getConnection();
    echo "[OK] DB Connected.\n";
} catch (Exception $e) {
    echo "[FAIL] DB Connection failed: " . $e->getMessage() . "\n";
    exit;
}

// 2. Main User Check
$stmt = $db->query("SELECT id, email, series FROM users LIMIT 5");
$users = $stmt->fetchAll();
echo "[INFO] Users in DB:\n";
foreach ($users as $u) {
    echo "  - ID: {$u['id']}, Email: {$u['email']}, Series: " . (is_null($u['series']) ? 'NULL' : $u['series']) . "\n";
}

// 3. Exams & Subjects Check
$stmt = $db->query("SELECT e.id, e.year, s.name as subject, e.series FROM exams e JOIN subjects s ON e.subject_id = s.id");
$exams = $stmt->fetchAll();
echo "[INFO] Available Exams in DB:\n";
foreach ($exams as $ex) {
    echo "  - ID: {$ex['id']}, Year: {$ex['year']}, Subject: {$ex['subject']}, Series: {$ex['series']}\n";
}

// 4. Series Table Check
$stmt = $db->query("SELECT id, name FROM series");
$allSeries = $stmt->fetchAll();
echo "[INFO] Series in DB:\n";
foreach ($allSeries as $s) {
    echo "  - ID: {$s['id']}, Name: {$s['name']}\n";
}

// 4. Env & API Check
$envFile = __DIR__ . '/backend/.env';
$convertKey = null;
if (file_exists($envFile)) {
    echo "[OK] .env exists.\n";
    $lines = file($envFile);
    foreach ($lines as $line) {
        if (strpos($line, 'CONVERTAPI_API_KEY=') === 0) {
            $convertKey = trim(explode('=', $line)[1], " \n\r\t'\"");
        }
    }
}

if ($convertKey) {
    echo "[INFO] Testing ConvertAPI connectivity...\n";
    $url = "https://v2.convertapi.com/user?secret=" . $convertKey;
    $res = @file_get_contents($url);
    if ($res) {
        $userData = json_decode($res, true);
        echo "[OK] ConvertAPI reached. Seconds left: " . ($userData['SecondsLeft'] ?? 'UNKNOWN') . "\n";
    } else {
        echo "[FAIL] ConvertAPI request failed. Check key or network.\n";
    }
} else {
    echo "[FAIL] CONVERTAPI_API_KEY missing in .env\n";
}

// 5. Tmp Folder Check
$tmpDir = __DIR__ . '/tmp/';
echo "[INFO] Tmp Dir: $tmpDir\n";
if (is_dir($tmpDir)) {
    echo "[OK] Tmp dir exists. Writable: " . (is_writable($tmpDir) ? 'YES' : 'NO') . "\n";
    $files = scandir($tmpDir);
    echo "[INFO] Files in tmp: " . implode(', ', array_slice($files, 2)) . "\n";
} else {
    echo "[FAIL] Tmp dir NOT FOUND.\n";
}
