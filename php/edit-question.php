<?php
// edit-question.php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
    $id = $_POST['id'];
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';

    $stmt = $conn->prepare("UPDATE questions SET title = ?, description = ? WHERE id = ?");
    $stmt->bind_param("ssi", $title, $description, $id);
    if ($stmt->execute()) {
        echo "Question updated successfully";
    } else {
        echo "Error: " . $stmt->error;
    }
    $stmt->close();
}
$conn->close();
?>
