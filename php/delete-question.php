<?php
// delete-question.php
session_start();
include 'db.php';
header('Content-Type: application/json');

$db = Database::getInstance();
$conn = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'User must be logged in']);
        exit;
    }

    $id = $_POST['id'];
    $user_id = $_SESSION['user_id'];

    // First check if the question belongs to the user
    $checkStmt = $conn->prepare("SELECT user_id FROM questions WHERE id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $question = $result->fetch_assoc();
    $checkStmt->close();

    if (!$question) {
        echo json_encode(['success' => false, 'message' => 'Question not found']);
        exit;
    }

    if ($question['user_id'] != $user_id) {
        echo json_encode(['success' => false, 'message' => 'You can only delete your own questions']);
        exit;
    }

    // Proceed with deletion
    $stmt = $conn->prepare("DELETE FROM questions WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Question deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting question']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
}
$conn->close();
?>
