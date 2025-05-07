<?php
session_start();
include 'db.php';
$db = Database::getInstance();
$conn = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $question_id = $_GET['question_id'] ?? '';
    $user_id = $_SESSION['user_id'] ?? null;

    $stmt = $conn->prepare("
        SELECT c.*, u.username, 
        CASE WHEN c.user_id = ? THEN 1 ELSE 0 END as is_owner
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.question_id = ? AND c.answer_id IS NULL
        ORDER BY c.created_at ASC
    ");
    $stmt->bind_param("ii", $user_id, $question_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $comments = [];
    while ($row = $result->fetch_assoc()) {
        $comments[] = $row;
    }
    
    echo json_encode($comments);
    $stmt->close();
}
$conn->close();
?> 