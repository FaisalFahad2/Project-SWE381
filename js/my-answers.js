window.addEventListener('load', function() {
  // Check if user is logged in
  if (!sessionStorage.getItem('user_id')) {
      window.location.href = 'login.html';
      return;
  }

  const container = document.getElementById('myAnswersContainer');
  
  // Add heading
  container.innerHTML = '<h2>My Answers</h2>';

  // Fetch user's answers
  fetch('../php/answer/get-my-answers.php')
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              container.innerHTML = `<p class="error">${data.error}</p>`;
              return;
          }

          if (data.length === 0) {
              container.innerHTML = `<p>You haven't posted any answers yet.</p>`;
              return;
          }

          // Create answers list
          const answersList = document.createElement('div');
          answersList.className = 'answers-list';

          data.forEach(answer => {
              const answerCard = document.createElement('div');
              answerCard.className = 'answer-card';
              answerCard.innerHTML = `
                  <h3>
                      <a href="question.html?id=${answer.question_id}">
                          ${answer.question_title}
                      </a>
                  </h3>
                  <div class="answer-content">${answer.content}</div>
                  <div class="answer-meta">
                      <span class="score">Score: ${answer.total_score}</span>
                      <span class="date">Posted: ${new Date(answer.created_at).toLocaleDateString()}</span>
                  </div>
                  <div class="answer-actions">
                      <button onclick="editAnswer(${answer.id})" class="edit-btn">Edit</button>
                      <button onclick="deleteAnswer(${answer.id})" class="delete-btn">Delete</button>
                  </div>
              `;
              answersList.appendChild(answerCard);
          });

          container.appendChild(answersList);
      })
      .catch(error => {
          container.innerHTML = `<p class="error">Error loading answers: ${error.message}</p>`;
      });
});

// Edit answer function
function editAnswer(answerId) {
  const answerCard = event.target.closest('.answer-card');
  const contentDiv = answerCard.querySelector('.answer-content');
  const currentContent = contentDiv.textContent;

  // Create edit form
  contentDiv.innerHTML = `
      <textarea class="edit-textarea">${currentContent}</textarea>
      <button onclick="saveAnswer(${answerId})" class="save-btn">Save</button>
      <button onclick="cancelEdit(${answerId}, '${currentContent}')" class="cancel-btn">Cancel</button>
  `;
}

// Save edited answer
function saveAnswer(answerId) {
  const answerCard = event.target.closest('.answer-card');
  const newContent = answerCard.querySelector('.edit-textarea').value;

  fetch('../php/answer/edit-answer.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `id=${answerId}&content=${encodeURIComponent(newContent)}`
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          const contentDiv = answerCard.querySelector('.answer-content');
          contentDiv.innerHTML = newContent;
      } else {
          alert('Error updating answer: ' + data.error);
      }
  })
  .catch(error => {
      alert('Error: ' + error.message);
  });
}

// Cancel edit
function cancelEdit(answerId, originalContent) {
  const answerCard = event.target.closest('.answer-card');
  const contentDiv = answerCard.querySelector('.answer-content');
  contentDiv.innerHTML = originalContent;
}

// Delete answer
function deleteAnswer(answerId) {
  if (!confirm('Are you sure you want to delete this answer?')) {
      return;
  }

  fetch('../php/answer/delete-answer.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `id=${answerId}`
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          // Remove the answer card from DOM
          const answerCard = event.target.closest('.answer-card');
          answerCard.remove();
          
          // Check if there are any answers left
          const answersList = document.querySelector('.answers-list');
          if (!answersList.children.length) {
              document.getElementById('myAnswersContainer').innerHTML = 
                  `<p>You haven't posted any answers yet.</p>`;
          }
      } else {
          alert('Error deleting answer: ' + data.error);
      }
  })
  .catch(error => {
      alert('Error: ' + error.message);
  });
}