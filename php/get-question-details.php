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

$stmt = $conn->prepare("SELECT id, title, description FROM questions WHERE id = ?");
$stmt->bind_param("i", $questionId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $question = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'title' => $question['title'],
        'description' => $question['description']
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Question not found']);
}

$stmt->close();