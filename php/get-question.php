<?php
// get-question.php
error_reporting(0); // Disable error reporting
header('Content-Type: application/json');

try {
    include 'db.php';
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // If a POST request with an 'id' is sent, return a single question
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
        $id = $_POST['id'];
        $stmt = $conn->prepare("SELECT id, user_id, title, description, created_at FROM questions WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $question = $result->fetch_assoc();
        // Get answer count
        $stmt2 = $conn->prepare("SELECT COUNT(*) as answer_count FROM answers WHERE question_id = ?");
        $stmt2->bind_param("i", $id);
        $stmt2->execute();
        $answer_count = $stmt2->get_result()->fetch_assoc()["answer_count"] ?? 0;
        $stmt2->close();
        // Get comment count
        $stmt3 = $conn->prepare("SELECT COUNT(*) as comment_count FROM comments WHERE question_id = ?");
        $stmt3->bind_param("i", $id);
        $stmt3->execute();
        $comment_count = $stmt3->get_result()->fetch_assoc()["comment_count"] ?? 0;
        $stmt3->close();
        $question['answer_count'] = $answer_count;
        $question['comment_count'] = $comment_count;
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
        $sql = "SELECT q.id, q.user_id, q.title, q.description, q.created_at,
                COALESCE(a.answer_count, 0) AS answer_count,
                COALESCE(c.comment_count, 0) AS comment_count
            FROM questions q
            LEFT JOIN (
                SELECT question_id, COUNT(*) AS answer_count
                FROM answers
                GROUP BY question_id
            ) a ON q.id = a.question_id
            LEFT JOIN (
                SELECT question_id, COUNT(*) AS comment_count
                FROM comments
                GROUP BY question_id
            ) c ON q.id = c.question_id
            WHERE q.title LIKE ?
            ORDER BY q.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $searchTerm);
    } else {
        $sql = "SELECT q.id, q.user_id, q.title, q.description, q.created_at,
                COALESCE(a.answer_count, 0) AS answer_count,
                COALESCE(c.comment_count, 0) AS comment_count
            FROM questions q
            LEFT JOIN (
                SELECT question_id, COUNT(*) AS answer_count
                FROM answers
                GROUP BY question_id
            ) a ON q.id = a.question_id
            LEFT JOIN (
                SELECT question_id, COUNT(*) AS comment_count
                FROM comments
                GROUP BY question_id
            ) c ON q.id = c.question_id
            ORDER BY q.created_at DESC";
        $stmt = $conn->prepare($sql);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $questions = array();
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    echo json_encode($questions);
    $stmt->close();
} catch (Exception $e) {
    error_log("Error in get-question.php: " . $e->getMessage());
    echo json_encode(['error' => 'Database error occurred']);
}
?>
