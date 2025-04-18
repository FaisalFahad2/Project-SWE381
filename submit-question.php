<?php
// submit-question.php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    // In a real app, get user_id from session; here we use a static user_id
    $user_id = 1;

    $stmt = $conn->prepare("INSERT INTO questions (user_id, title, description, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iss", $user_id, $title, $description);
    if ($stmt->execute()) {
        echo "Question added successfully";
    } else {
        echo "Error: " . $stmt->error;
    }
    $stmt->close();
}
$conn->close();
?>
