<?php
header('Content-Type: application/json');
require_once 'db.php';
$db = Database::getInstance();
$conn = $db->getConnection();
// session_start();
$answerId = $_POST['answer_id'];
$voteType = $_POST['vote_type']; 
$userId = 1; // $_SESSION['user_id']

$sql = "SELECT vote_type FROM votes WHERE user_id = ? AND answer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $userId, $answerId);
$stmt->execute();
$result = $stmt->get_result();

$currentCounter = 0; 

if ($result->num_rows > 0) {
    $previousVote = $result->fetch_assoc()['vote_type'];
    if ($previousVote === 'up') {
        $currentCounter = 1;
    } elseif ($previousVote === 'down') {
        $currentCounter = -1;
    }
}

$ratingChange = 0;
$newCounter = $currentCounter;

if ($voteType === 'up') {
    if ($currentCounter === 1) {
        echo json_encode(['status' => 'already_upvoted']);
        exit;
    } elseif ($currentCounter === 0) {
        $newCounter = 1;
        $ratingChange = 1;
    } elseif ($currentCounter === -1) {
        $newCounter = 0;
        $ratingChange = 1;
    }
} elseif ($voteType === 'down') {
    if ($currentCounter === -1) {
        echo json_encode(['status' => 'already_downvoted']);
        exit;
    } elseif ($currentCounter === 0) {
        $newCounter = -1;
        $ratingChange = -1;
    } elseif ($currentCounter === 1) {
        $newCounter = 0;
        $ratingChange = -1;
    }
}

if ($result->num_rows > 0) {
    if ($newCounter === 0) {
        $deleteVote = $conn->prepare("DELETE FROM votes WHERE user_id = ? AND answer_id = ?");
        $deleteVote->bind_param("ii", $userId, $answerId);
        $deleteVote->execute();
    } else {
        $newVoteType = ($newCounter === 1) ? 'up' : 'down';
        $updateVote = $conn->prepare("UPDATE votes SET vote_type = ?, created_at = NOW() WHERE user_id = ? AND answer_id = ?");
        $updateVote->bind_param("sii", $newVoteType, $userId, $answerId);
        $updateVote->execute();
    }
} else {
    if ($newCounter !== 0) {
        $newVoteType = ($newCounter === 1) ? 'up' : 'down';
        $insertVote = $conn->prepare("INSERT INTO votes (user_id, answer_id, vote_type) VALUES (?, ?, ?)");
        $insertVote->bind_param("iis", $userId, $answerId, $newVoteType);
        $insertVote->execute();
    }
}

if ($ratingChange !== 0) {
    $updateRating = $conn->prepare("UPDATE answers SET rating = rating + ? WHERE id = ?");
    $updateRating->bind_param("ii", $ratingChange, $answerId);
    $updateRating->execute();
}

$getRating = $conn->prepare("SELECT rating FROM answers WHERE id = ?");
$getRating->bind_param("i", $answerId);
$getRating->execute();
$result = $getRating->get_result();
$newRating = $result->fetch_assoc()['rating'];

echo json_encode([
    'status' => 'success',
    'new_rating' => $newRating,
    'counter' => $newCounter
]);
?>