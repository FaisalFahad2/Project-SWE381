<?php
// db.php
$host = 'localhost';
$username = 'root';
$password = 'helloMyDB';
$dbname = 'stackoverflow_clone';

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
