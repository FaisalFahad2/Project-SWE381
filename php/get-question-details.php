<?php
header('Content-Type: application/json');
include 'db.php';

$db = Database::getInstance();
$conn = $db->getConnection();

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing question ID']);
    exit;
}

$questionId = $_GET['id'];

$stmt = $conn->prepare("SELECT id, title, description, user_id FROM questions WHERE id = ?");
$stmt->bind_param("i", $questionId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $question = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'id' => $question['id'],
        'title' => $question['title'],
        'description' => $question['description'],
        'user_id' => $question['user_id']
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Question not found']);
}

$stmt->close();
$conn->close();