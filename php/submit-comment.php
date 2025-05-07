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
    $user_id = $_SESSION['user_id'];
    $question_id = isset($_POST['question_id']) && $_POST['question_id'] !== '' ? (int)$_POST['question_id'] : 0;
    $answer_id = isset($_POST['answer_id']) && $_POST['answer_id'] !== '' ? (int)$_POST['answer_id'] : 0;

    $stmt = $conn->prepare("INSERT INTO comments (question_id, answer_id, user_id, content) VALUES (NULLIF(?, 0), NULLIF(?, 0), ?, ?)");
    $stmt->bind_param("iiis", $question_id, $answer_id, $user_id, $content);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Comment added successfully']);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
    $stmt->close();
}
$conn->close();
?>