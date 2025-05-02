<?php
session_start();

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $question_id = $_POST['question_id']; 
    $content = $_POST['content'];          
    $user_id = $_SESSION['user_id'];                        
    $sql = "INSERT INTO answers (question_id, content, user_id) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('isi', $question_id, $content, $user_id);
    if ($stmt->execute()) {
        header("Location: ../HTML%20files/question.html?id=" . $question_id);  
        exit();
    } else {
        echo "Error: " . $stmt->error;
    }
}
?>
