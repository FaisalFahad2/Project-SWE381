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
    $rating = 0;

    $stmt = $conn->prepare("INSERT INTO answers (question_id, user_id, content, rating) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iisi", $question_id, $user_id, $content, $rating);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Answer submitted successfully']);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
    $stmt->close();
}
$conn->close();
?>