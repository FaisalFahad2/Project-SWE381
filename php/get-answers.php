<?php
// get-answers.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

try {
    include 'db.php';
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Start session to get current user
    session_start();
    $current_user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

    // Fetch all answers with their associated questions
    $stmt = $conn->prepare("
        SELECT 
            a.id as answer_id,
            a.user_id,
            a.content,
            a.question_id,
            q.title as question_title
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        ORDER BY a.created_at DESC
    ");

    $stmt->execute();
    $result = $stmt->get_result();
    $answers = array();
    while ($row = $result->fetch_assoc()) {
        $answers[] = $row;
    }
    
    // Add current user ID to the response
    $response = array(
        'answers' => $answers,
        'user_id' => $current_user_id
    );
    
    echo json_encode($response);
    $stmt->close();
} catch (Exception $e) {
    error_log("Error in get-answers.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred', 'message' => $e->getMessage()]);
}
?> 