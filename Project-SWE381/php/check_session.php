<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        echo json_encode(['error' => 'Not logged in']);
        exit();
    } else {
        header('Location: ../html/login.html');
        exit();
    }
}
?>