# Project-SWE381
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    user_id INT,                     
    title VARCHAR(255) NOT NULL,     
    description TEXT,                
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE  
) ENGINE=InnoDB;



CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    content TEXT NOT NULL,
    user_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE  
) ENGINE=InnoDB;
ALTER TABLE answers ADD COLUMN rating INT DEFAULT 0;



CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    answer_id INT NOT NULL,
    vote_type ENUM('up', 'down') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (user_id, answer_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
);


