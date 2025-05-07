<?php
session_start();
include 'db.php';
$db = Database::getInstance();
$conn = $db->getConnection();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'User must be logged in']);
        exit;
    }

    $content = $_POST['content'] ?? '';
    $question_id = $_POST['question_id'] ?? '';
    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $question_id, $user_id, $content);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Answer submitted successfully']);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
    $stmt->close();
}
$conn->close();
?>