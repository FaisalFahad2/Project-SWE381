<?php
session_start();
include 'db.php';

header('Content-Type: application/json');

$db = Database::getInstance();
$conn = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'User must be logged in']);
        exit;
    }

    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $user_id = $_SESSION['user_id'];

    if (empty($title) || empty($description)) {
        echo json_encode(['success' => false, 'message' => 'Title and description are required']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO questions (user_id, title, description) VALUES (?, ?, ?)");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param("iss", $user_id, $title, $description);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Question added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>