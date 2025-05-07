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

    $comment_id = $_POST['id'] ?? '';
    $content = $_POST['content'] ?? '';
    $user_id = $_SESSION['user_id'];

    // Verify the user owns this comment
    $stmt = $conn->prepare("SELECT user_id FROM comments WHERE id = ?");
    $stmt->bind_param("i", $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $comment = $result->fetch_assoc();

    if (!$comment || $comment['user_id'] != $user_id) {
        echo json_encode(['error' => 'Unauthorized to edit this comment']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE comments SET content = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sii", $content, $comment_id, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Comment updated successfully']);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
    $stmt->close();
}
$conn->close();
?>