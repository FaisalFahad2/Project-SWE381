<?php
session_start();
include 'db.php';

$conn = Database::getInstance()->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = $_POST['password'];

    //searching for name in db
    $query = "SELECT * FROM users WHERE username = '$username'";
    $result = $conn->query($query);

    if ($result && $result->num_rows === 1) {
        $user = $result->fetch_assoc();

       //verify the password
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['logged_in'] = true;

            header("Location: ../php/profile.php"); 
            exit();
        } else {
            $_SESSION['error'] = "password incorrect";
            header("Location: ../html/login.html");
            exit();
        }
    } else {
        $_SESSION['error'] = "Username not found";
        header("Location: ../html/login.html");
        exit();
    }
} else {
    header("Location: ../html/login.html");
    exit();
}
?>