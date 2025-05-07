<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

$db = Database::getInstance();
$conn = $db->getConnection();

if (!isset($_GET['question_id'])) {
    echo json_encode(['error' => 'Question ID is required']);
    exit;
}

$question_id = $_GET['question_id'];
$current_user_id = $_SESSION['user_id'] ?? null;

// Get answers with user information
$query = "SELECT a.*, u.username, 
          (SELECT COUNT(*) FROM comments c WHERE c.answer_id = a.id) as comment_count
          FROM answers a 
          JOIN users u ON a.user_id = u.id 
          WHERE a.question_id = ? 
          ORDER BY a.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $question_id);
$stmt->execute();
$result = $stmt->get_result();

$answers = [];
while ($answer = $result->fetch_assoc()) {
    // Check if the current user is the owner of the answer
    $answer['is_owner'] = $current_user_id && $answer['user_id'] == $current_user_id;
    
    // Get comments for this answer
    $commentQuery = "SELECT c.*, u.username 
                    FROM comments c 
                    JOIN users u ON c.user_id = u.id 
                    WHERE c.answer_id = ? 
                    ORDER BY c.created_at ASC";
    
    $commentStmt = $conn->prepare($commentQuery);
    $commentStmt->bind_param("i", $answer['id']);
    $commentStmt->execute();
    $commentResult = $commentStmt->get_result();
    
    $answer['comments'] = [];
    while ($comment = $commentResult->fetch_assoc()) {
        $answer['comments'][] = $comment;
    }
    
    $answers[] = $answer;
    $commentStmt->close();
}

echo json_encode($answers);

$stmt->close();
$conn->close();
?> 