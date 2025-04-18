<?php
// get-question.php
include 'db.php';
header('Content-Type: application/json');

// If a POST request with an 'id' is sent, return a single question
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
    $id = $_POST['id'];
    $stmt = $conn->prepare("SELECT id, user_id, title, description FROM questions WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $question = $result->fetch_assoc();
    echo json_encode($question);
    $stmt->close();
    $conn->close();
    exit;
}

// Otherwise, fetch all questions (optionally filtered by a search term)
$search = '';
if (isset($_GET['search'])) {
    $search = $_GET['search'];
}

if ($search) {
    $searchTerm = "%" . $conn->real_escape_string($search) . "%";
    $stmt = $conn->prepare("SELECT id, user_id, title, description FROM questions WHERE title LIKE ?");
    $stmt->bind_param("s", $searchTerm);
} else {
    $stmt = $conn->prepare("SELECT id, user_id, title, description FROM questions ORDER BY created_at DESC");
}

$stmt->execute();
$result = $stmt->get_result();
$questions = array();
while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}
echo json_encode($questions);
$stmt->close();
$conn->close();
?>
