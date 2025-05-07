<?php
// edit-question.php
error_reporting(0); // Disable error reporting
header('Content-Type: application/json');
session_start();

try {
    include 'db.php';
    $db = Database::getInstance();
    $conn = $db->getConnection();

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'User must be logged in']);
            exit;
        }

        $id = $_POST['id'];
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
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
            echo json_encode(['success' => false, 'message' => 'You can only edit your own questions']);
            exit;
        }

        $stmt = $conn->prepare("UPDATE questions SET title = ?, description = ? WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ssii", $title, $description, $id, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Question updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error updating question']);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request']);
    }
} catch (Exception $e) {
    error_log("Error in edit-question.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
?>
