<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
session_start();

try {
    include 'db.php';
    $db = Database::getInstance();
    $conn = $db->getConnection();

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['question_id'])) {
        $question_id = $_POST['question_id'];
        error_log("Processing request for question_id: " . $question_id);

        // Get answers with user information
        $answersQuery = "SELECT a.id, a.content, a.user_id, a.created_at, u.username as user 
                        FROM answers a 
                        JOIN users u ON a.user_id = u.id 
                        WHERE a.question_id = ? 
                        ORDER BY a.id DESC";
        
        $stmt = $conn->prepare($answersQuery);
        if (!$stmt) {
            error_log("Failed to prepare answers query: " . $conn->error);
            throw new Exception("Failed to prepare answers query: " . $conn->error);
        }
        
        $stmt->bind_param("i", $question_id);
        if (!$stmt->execute()) {
            error_log("Failed to execute answers query: " . $stmt->error);
            throw new Exception("Failed to execute answers query: " . $stmt->error);
        }
        
        $answersResult = $stmt->get_result();
        error_log("Number of answers found: " . $answersResult->num_rows);
        
        $answers = array();
        while ($answer = $answersResult->fetch_assoc()) {
            // Get comments for each answer
            $commentsQuery = "SELECT c.id, c.content, c.user_id, u.username as user 
                            FROM comments c 
                            JOIN users u ON c.user_id = u.id 
                            WHERE c.answer_id = ? 
                            ORDER BY c.id ASC";
            
            $commentStmt = $conn->prepare($commentsQuery);
            if (!$commentStmt) {
                error_log("Failed to prepare comments query: " . $conn->error);
                throw new Exception("Failed to prepare comments query: " . $conn->error);
            }
            
            $commentStmt->bind_param("i", $answer['id']);
            if (!$commentStmt->execute()) {
                error_log("Failed to execute comments query: " . $commentStmt->error);
                throw new Exception("Failed to execute comments query: " . $commentStmt->error);
            }
            
            $commentsResult = $commentStmt->get_result();
            $comments = array();
            while ($comment = $commentsResult->fetch_assoc()) {
                $comment['is_owner'] = (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $comment['user_id']);
                $comments[] = $comment;
            }
            $commentStmt->close();
            
            // Calculate rating for this answer
            $ratingQuery = "SELECT SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END) as rating FROM votes WHERE answer_id = ?";
            $ratingStmt = $conn->prepare($ratingQuery);
            $ratingStmt->bind_param("i", $answer['id']);
            $ratingStmt->execute();
            $ratingResult = $ratingStmt->get_result();
            $ratingRow = $ratingResult->fetch_assoc();
            $answer['rating'] = $ratingRow['rating'] ?? 0;
            $ratingStmt->close();

            // Add user_vote property
            $user_vote = null;
            if (isset($_SESSION['user_id'])) {
                $voteStmt = $conn->prepare("SELECT vote_type FROM votes WHERE user_id = ? AND answer_id = ?");
                $voteStmt->bind_param("ii", $_SESSION['user_id'], $answer['id']);
                $voteStmt->execute();
                $voteStmt->bind_result($voteType);
                if ($voteStmt->fetch()) {
                    $user_vote = $voteType;
                }
                $voteStmt->close();
            }
            $answer['user_vote'] = $user_vote;

            $answer['comments'] = $comments;
            $answer['is_owner'] = (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $answer['user_id']);
            $answers[] = $answer;
        }
        $stmt->close();

        // Get comments for the question itself
        $questionCommentsQuery = "SELECT c.id, c.content, c.user_id, u.username as user 
                                FROM comments c 
                                JOIN users u ON c.user_id = u.id 
                                WHERE c.question_id = ? AND c.answer_id IS NULL 
                                ORDER BY c.id ASC";
        
        $questionCommentStmt = $conn->prepare($questionCommentsQuery);
        if (!$questionCommentStmt) {
            error_log("Failed to prepare question comments query: " . $conn->error);
            throw new Exception("Failed to prepare question comments query: " . $conn->error);
        }
        
        $questionCommentStmt->bind_param("i", $question_id);
        if (!$questionCommentStmt->execute()) {
            error_log("Failed to execute question comments query: " . $questionCommentStmt->error);
            throw new Exception("Failed to execute question comments query: " . $questionCommentStmt->error);
        }
        
        $questionCommentsResult = $questionCommentStmt->get_result();
        $questionComments = array();
        while ($comment = $questionCommentsResult->fetch_assoc()) {
            $comment['is_owner'] = (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $comment['user_id']);
            $questionComments[] = $comment;
        }
        $questionCommentStmt->close();

        echo json_encode([
            'success' => true,
            'answers' => $answers,
            'question_comments' => $questionComments
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request'
        ]);
    }
} catch (Exception $e) {
    error_log("Error in get-answers-comments.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred: ' . $e->getMessage()
    ]);
}
?> 