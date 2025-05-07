<?php
error_reporting(0);
header('Content-Type: application/json');
session_start();
require_once 'db.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        exit;
    }

    if (!isset($_POST['answer_id'], $_POST['vote_type'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
        exit;
    }

    $answerId = $_POST['answer_id'];
    $voteType = $_POST['vote_type'];
    $userId = $_SESSION['user_id'];

    $voteType = strtolower(trim($voteType));
    if ($voteType !== 'up' && $voteType !== 'down') {
        echo json_encode(['status' => 'error', 'message' => 'Invalid vote type']);
        exit;
    }

    // Check if the user already voted and what type
    $checkStmt = $conn->prepare("SELECT vote_type FROM votes WHERE user_id = ? AND answer_id = ?");
    $checkStmt->bind_param("ii", $userId, $answerId);
    $checkStmt->execute();
    $checkStmt->bind_result($existingVoteType);
    $hasVote = $checkStmt->fetch();
    $checkStmt->close();

    if ($hasVote && strtolower($existingVoteType) == $voteType) {
        // User clicked the same vote again, so remove (cancel) the vote
        $deleteStmt = $conn->prepare("DELETE FROM votes WHERE user_id = ? AND answer_id = ?");
        $deleteStmt->bind_param("ii", $userId, $answerId);
        $deleteStmt->execute();
        $deleteStmt->close();
    } else {
        // Remove any previous vote
        $deleteStmt = $conn->prepare("DELETE FROM votes WHERE user_id = ? AND answer_id = ?");
        $deleteStmt->bind_param("ii", $userId, $answerId);
        $deleteStmt->execute();
        $deleteStmt->close();
        // Insert new vote
        $insertStmt = $conn->prepare("INSERT INTO votes (user_id, answer_id, vote_type) VALUES (?, ?, ?)");
        $insertStmt->bind_param("iis", $userId, $answerId, $voteType);
        $insertStmt->execute();
        $insertStmt->close();
    }

    $ratingQuery = "SELECT SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END) as rating FROM votes WHERE answer_id = ?";
    $ratingStmt = $conn->prepare($ratingQuery);
    $ratingStmt->bind_param("i", $answerId);
    $ratingStmt->execute();
    $ratingResult = $ratingStmt->get_result();
    $ratingRow = $ratingResult->fetch_assoc();
    $rating = $ratingRow['rating'] ?? 0;
    $ratingStmt->close();

    echo json_encode([
        'status' => 'success',
        'new_rating' => $rating
    ]);
} catch (Exception $e) {
    error_log('Vote error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Server error']);
}
?>