
<?php
session_start();
session_unset();
session_destroy();
session_start(); 
include 'db.php';

$conn = Database::getInstance()->getConnection();

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $firstname = mysqli_real_escape_string($conn, $_POST["firstname"]);
    $lastname = mysqli_real_escape_string($conn, $_POST["lastname"]);
    $username = mysqli_real_escape_string($conn, $_POST["username"]);
    $email = mysqli_real_escape_string($conn, $_POST["email"]);
    $phone = mysqli_real_escape_string($conn, $_POST["phone"]);
    $password = $_POST["password"];

    if (!preg_match('/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
        $_SESSION['error'] = "Password must be at least 8 characters and include uppercase, number, and symbol";
        header("Location: ../html/register.html");
        exit();
    }

    $check_username = $conn->query("SELECT * FROM users WHERE username = '$username'");
    if($check_username->num_rows > 0){
        $_SESSION['error'] = "Username already exists";
        header("Location: ../html/register.html");
        exit();
    }

    $check_email = $conn->query("SELECT * FROM users WHERE email = '$email'");
    if ($check_email->num_rows > 0) {
        $_SESSION['error'] = "Email already registered. Please use another email.";
       header("Location: ../html/register.html");
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (firstname, lastname, username, email, phone, password) 
            VALUES ('$firstname', '$lastname', '$username', '$email', '$phone', '$hashed_password')";

    if ($conn->query($sql) === TRUE) {
        $_SESSION["registration_success"] = true;
        $_SESSION["username"] = $username;
        header("Location: ../php/profile.php");
        exit();
    } else {
        $_SESSION['error'] = "Error: " . $sql . "<br>" . $conn->error;
        header("Location: ../html/register.html");
        exit();
    }
} else {
    // If someone tries to access this page directly without POST
    header("Location: ../html/register.html");
    exit();
}
?>