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

    $answer_id = $_POST['id'] ?? '';
    $user_id = $_SESSION['user_id'];

    // Verify the user owns this answer
    $stmt = $conn->prepare("SELECT user_id FROM answers WHERE id = ?");
    $stmt->bind_param("i", $answer_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $answer = $result->fetch_assoc();

    if (!$answer || $answer['user_id'] != $user_id) {
        echo json_encode(['error' => 'Unauthorized to delete this answer']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM answers WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $answer_id, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Answer deleted successfully']);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
    $stmt->close();
}
$conn->close();
?>