<?php
session_start();

$response = array(
    "logged_in" => false
);

if (isset($_SESSION['username'])) {
    $response["logged_in"] = true;
}

echo json_encode($response);
?>
