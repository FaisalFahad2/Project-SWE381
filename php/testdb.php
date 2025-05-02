<?php
// Include your database class
include 'db.php';

try {
    // Get database instance
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // Check connection
    if ($conn->ping()) {
        echo "<p style='color:green'>Database connection successful!</p>";
        
        // Try to check if the users table exists
        $result = $conn->query("SHOW TABLES LIKE 'users'");
        if ($result->num_rows > 0) {
            echo "<p style='color:green'>Users table exists!</p>";
            
            // Show the table structure
            $result = $conn->query("DESCRIBE users");
            echo "<p>Users table structure:</p>";
            echo "<pre>";
            while ($row = $result->fetch_assoc()) {
                print_r($row);
            }
            echo "</pre>";
        } else {
            echo "<p style='color:red'>Users table doesn't exist. You may need to create it.</p>";
            
            // Provide create table SQL for reference
            echo "<p>Example SQL to create users table:</p>";
            echo "<pre>
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
            </pre>";
        }
    } else {
        echo "<p style='color:red'>Database connection failed!</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>