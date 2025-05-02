
<?php
session_start();
require_once '../php/db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Get database connection
$db = Database::getInstance();
$conn = $db->getConnection();

// Fetch user data
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Profile</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header>
    <h1>StackClone</h1>
    <a href="index.html">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
      </svg>
    </a>
  </header>

  <main>
    <div class="profile-container">
      <h2>Profile info</h2>
      <p><strong>Username:</strong> <span id="username"><?php echo htmlspecialchars($user['username']); ?></span></p>
<p><strong>First Name:</strong> <span id="firstname"><?php echo htmlspecialchars($user['firstname']); ?></span></p>
<p><strong>Last Name:</strong> <span id="lastname"><?php echo htmlspecialchars($user['lastname']); ?></span></p>
<p><strong>Email:</strong> <span id="email"><?php echo htmlspecialchars($user['email']); ?></span></p>
<p><strong>Phone:</strong> <span id="phone"><?php echo htmlspecialchars($user['phone']); ?></span></p>

    <a href="my-questions.html">
      <h2>My Questions</h2>
    </a>

    <a href="my-answers.html">
      <h2>My Answers</h2>
    </a>

      <a href="logout.php">
        <button>Logout</button>
      </a>
    </div>
  </main>

  <footer>
    <p>&copy; 2025 StackClone</p>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-twitter-x" viewBox="0 0 16 16">
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Z"/>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49..."/>
    </svg>
  </footer>
</body>
</html>
