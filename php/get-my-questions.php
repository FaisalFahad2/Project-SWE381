<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$db = Database::getInstance();
$conn = $db->getConnection();
$user_id = $_SESSION['user_id'];

$query = "SELECT q.*, 
          (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count,
          (SELECT COUNT(*) FROM comments WHERE question_id = q.id) as comment_count
          FROM questions q 
          WHERE q.user_id = ? 
          ORDER BY q.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$questions = [];
while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}

echo json_encode($questions);

$stmt->close();
$conn->close();
?> 