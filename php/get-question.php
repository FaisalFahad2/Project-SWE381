<?php
// get-question.php
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

    // If a POST request with an 'id' is sent, return a single question
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
        $id = $_POST['id'];
        $stmt = $conn->prepare("
            SELECT q.id, q.user_id, q.title, q.description, q.created_at, u.username 
            FROM questions q 
            LEFT JOIN users u ON q.user_id = u.id 
            WHERE q.id = ?
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $question = $result->fetch_assoc();
        $question['current_user_id'] = $current_user_id;
        echo json_encode($question);
        $stmt->close();
        exit;
    }

    // Otherwise, fetch all questions (optionally filtered by a search term)
    $search = '';
    if (isset($_GET['search'])) {
        $search = $_GET['search'];
    }

    if ($search) {
        $searchTerm = "%" . $conn->real_escape_string($search) . "%";
        $stmt = $conn->prepare("
            SELECT q.id, q.user_id, q.title, q.description, q.created_at, u.username 
            FROM questions q 
            LEFT JOIN users u ON q.user_id = u.id 
            WHERE q.title LIKE ? 
            ORDER BY q.created_at DESC
        ");
        $stmt->bind_param("s", $searchTerm);
    } else {
        $stmt = $conn->prepare("
            SELECT q.id, q.user_id, q.title, q.description, q.created_at, u.username 
            FROM questions q 
            LEFT JOIN users u ON q.user_id = u.id 
            ORDER BY q.created_at DESC
        ");
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $questions = array();
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    
    // Add current user ID to the response
    $response = array(
        'questions' => $questions,
        'user_id' => $current_user_id
    );
    
    echo json_encode($response);
    $stmt->close();
} catch (Exception $e) {
    error_log("Error in get-question.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred', 'message' => $e->getMessage()]);
}
?>
