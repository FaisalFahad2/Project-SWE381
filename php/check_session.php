<?php
session_start();

$response = array(
    "logged_in" => false,
    "user_id" => null,
    "username" => null
);

if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    $response["logged_in"] = true;
    $response["user_id"] = $_SESSION['user_id'];
    $response["username"] = $_SESSION['username'];
}

header('Content-Type: application/json');
echo json_encode($response);
?>
