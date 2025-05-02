<?php
include 'db.php';

$questionId = isset($_GET['question_id']) ? intval($_GET['question_id']) : 0;

if ($questionId > 0) {
    $sql = "SELECT * FROM answers WHERE question_id = $questionId ORDER BY created_at DESC";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $first = true;
        while ($row = $result->fetch_assoc()) {
            if (!$first) {
                echo '<hr>';
            }
            $first = false;
            
            echo '<div class="answer">';
            echo '<p>' . htmlspecialchars($row['content']) . '</p>';
            echo '<small>Answered at: ' . $row['created_at'] . '</small>';
            
            echo '<div class="rating">';
            echo '<button class="up" data-answer-id="' . $row['id'] . '">↑</button>';
            echo '<span class="rating-value">' . $row['rating'] . '</span>';
            echo '<button class="down" data-answer-id="' . $row['id'] . '">↓</button>';
            echo '</div>';
            
            echo '</div>';
        }
    } else {
        echo '<p>No answers yet. Be the first to answer!</p>';
    }
} else {
    echo '<p>Invalid question ID.</p>';
}
?>

<style>
    .rating span {
        margin-left: 10px;
        margin-right: 10px;
    }
</style>
