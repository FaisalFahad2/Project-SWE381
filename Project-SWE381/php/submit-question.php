<?php
// ../php/submit-question.php
include 'db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Unknown error'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title       = trim($_POST['title']       ?? '');
    $description = trim($_POST['description'] ?? '');

    if ($title === '' || $description === '') {
        $response['message'] = 'Title and description are required.';
        echo json_encode($response);
        exit;
    }

    // (In a real application, get user_id from the session)
    $user_id = 1;

    $stmt = $conn->prepare(
        "INSERT INTO questions (user_id, title, description, created_at)
         VALUES (?, ?, ?, NOW())"
    );

    if (!$stmt) {
        $response['message'] = 'Prepare failed: ' . $conn->error;
    } else {
        $stmt->bind_param('iss', $user_id, $title, $description);
        if ($stmt->execute()) {
            $response = ['success' => true, 'message' => 'Question added successfully'];
        } else {
            $response['message'] = 'Database error: ' . $stmt->error;
        }
        $stmt->close();
    }
}

echo json_encode($response);
$conn->close();
?>
