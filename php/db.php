<?php
class Database {
    private static $instance = null;
    private $connection;
    private $isConnected = false;
    
    private function __construct() {
        $host = 'localhost:3306'; // Adjust the port if necessary
        $username = 'root';
        $password = 'Ffma0000';
        $dbname = 'stackclone';
        
        // Create connection
        $this->connection = new mysqli($host, $username, $password);
        
        // Check connection
        if ($this->connection->connect_error) {
            error_log("Database connection failed: " . $this->connection->connect_error);
            throw new Exception("Database connection failed");
        }

        // Select database and check if successful
        if (!$this->connection->select_db($dbname)) {
            error_log("Database selection failed: " . $this->connection->error);
            throw new Exception("Database selection failed");
        }
        
        // Set charset to UTF-8
        $this->connection->set_charset('utf8mb4');
        $this->isConnected = true;
    }

    // Prevent cloning of the instance
    private function __clone() {}
    
    // Prevent unserializing of the instance
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        if (!$this->isConnected) {
            $this->__construct();
        }
        return $this->connection;
    }
    
    // Helper method for prepared statements
    public function prepare($sql) {
        return $this->connection->prepare($sql);
    }
    
    // Helper method for simple queries
    public function query($sql) {
        $result = $this->connection->query($sql);
        if (!$result) {
            error_log("Query failed: " . $this->connection->error . " SQL: " . $sql);
        }
        return $result;
    }
    
    // Helper method to execute prepared statements with parameters
    public function execute($sql, $types, $params) {
        $stmt = $this->prepare($sql);
        if (!$stmt) {
            error_log("Statement preparation failed: " . $this->connection->error);
            return false;
        }
        
        $stmt->bind_param($types, ...$params);
        $result = $stmt->execute();
        if (!$result) {
            error_log("Statement execution failed: " . $stmt->error);
        }
        
        return $stmt;
    }
    
    // Transaction helpers
    public function beginTransaction() {
        $this->connection->begin_transaction();
    }
    
    public function commit() {
        $this->connection->commit();
    }
    
    public function rollback() {
        $this->connection->rollback();
    }

    public function close() {
        if ($this->isConnected && $this->connection) {
            $this->connection->close();
            $this->isConnected = false;
            self::$instance = null; // Reset the singleton instance
        }
    }

    public function __destruct() {
        // Don't close the connection in destructor
        // Let PHP handle the cleanup
    }
}
?>