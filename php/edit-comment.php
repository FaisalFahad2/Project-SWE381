<?php
session_start();
require_once 'db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

if (!isset($_POST['id']) || !isset($_POST['content'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$comment_id = $_POST['id'];
$content = trim($_POST['content']);
$user_id = $_SESSION['user_id'];

// Validate content
if (empty($content)) {
    echo json_encode(['success' => false, 'error' => 'Comment cannot be empty']);
    exit;
}

try {
    // First check if the user owns this comment
    $stmt = $conn->prepare("SELECT user_id FROM comments WHERE id = ?");
    $stmt->bind_param("i", $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Comment not found']);
        exit;
    }
    
    $comment = $result->fetch_assoc();
    if ($comment['user_id'] != $user_id) {
        echo json_encode(['success' => false, 'error' => 'Not authorized to edit this comment']);
        exit;
    }
    
    // Update the comment
    $stmt = $conn->prepare("UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->bind_param("si", $content, $comment_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update comment']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error']);
}

$stmt->close();
$conn->close();
?>