<?php
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        $host = 'localhost:3307';
        $username = 'root';
        $password = '';
        $dbname = 'stackoverflow_clone';
        
        // Create connection
        $this->connection = new mysqli($host, $username, $password , $dbname);
        
        // Check connection
        if ($this->connection->connect_error) {
            error_log("Database connection failed: " . $this->connection->connect_error);
            die("Database connection failed. Please try again later.");
        }
        
        // Create database if not exists
        $this->createDatabase($dbname);
        $this->connection->select_db($dbname);
        
        // Create tables
        $this->createTables();
    }
    
    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    private function createDatabase($dbname) {
        $sql = "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
        if (!$this->connection->query($sql)) {
            error_log("Database creation failed: " . $this->connection->error);
            die("Database setup failed.");
        }
    }
    
    private function createTables() {
        // Users table (unchanged from your original)
        $sql = "CREATE TABLE IF NOT EXISTS users(
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(20) NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB";
        
        if (!$this->connection->query($sql)) {
            error_log("Users table creation failed: " . $this->connection->error);
            die("Table setup failed.");
        }
        
        // Questions table
        $sql = "CREATE TABLE IF NOT EXISTS questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            views INT DEFAULT 0,
            votes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FULLTEXT(title, description)
        ) ENGINE=InnoDB";
        
        if (!$this->connection->query($sql)) {
            error_log("Questions table creation failed: " . $this->connection->error);
            die("Table setup failed.");
        }
        
        // Answers table
        $sql = "CREATE TABLE IF NOT EXISTS answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            total_score INT DEFAULT 0,
            is_accepted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB";
        
        if (!$this->connection->query($sql)) {
            error_log("Answers table creation failed: " . $this->connection->error);
            die("Table setup failed.");
        }
        
        // Comments table
        $sql = "CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question_id INT DEFAULT NULL,
            answer_id INT DEFAULT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT chk_comment_target CHECK (
                (question_id IS NOT NULL AND answer_id IS NULL) OR
                (question_id IS NULL AND answer_id IS NOT NULL)
            )
        ) ENGINE=InnoDB";
        
        if (!$this->connection->query($sql)) {
            error_log("Comments table creation failed: " . $this->connection->error);
            die("Table setup failed.");
        }
        
        // Votes table (additional for tracking upvotes/downvotes)
        $sql = "CREATE TABLE IF NOT EXISTS votes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            answer_id INT NOT NULL,
            vote_value TINYINT NOT NULL, -- 1 for upvote, -1 for downvote
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
            UNIQUE KEY (user_id, answer_id) -- Prevent duplicate votes
        ) ENGINE=InnoDB";
        
        if (!$this->connection->query($sql)) {
            error_log("Votes table creation failed: " . $this->connection->error);
            // Don't die here as votes table is optional for basic functionality
        }
    }
    
    public function __destruct() {
        if ($this->connection) {
            $this->connection->close();
        }
    }
}
?>