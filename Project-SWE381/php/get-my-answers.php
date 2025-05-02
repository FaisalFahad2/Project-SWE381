<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$query = "SELECT a.*, q.title as question_title 
          FROM answers a 
          JOIN questions q ON a.question_id = q.id 
          WHERE a.user_id = ? 
          ORDER BY a.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$answers = [];
while ($row = $result->fetch_assoc()) {
    $answers[] = $row;
}

echo json_encode($answers);

$stmt->close();
$conn->close();
?>