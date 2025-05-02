<?php
require_once 'db.php';

if (isset($_GET['search'])) {
    $search = $conn->real_escape_string($_GET['search']);
    $sql = "SELECT id, user_id, title, description, created_at FROM questions WHERE title LIKE '%$search%' OR description LIKE '%$search%'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = [
                'id' => $row['id'],  // ← أضف هذا السطر
                'user_id' => $row['user_id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'created_at' => $row['created_at']
            ];
            
        }

        echo json_encode($data);
    } else {
        echo json_encode(["message" => "No results found"]);
    }
}
?>
