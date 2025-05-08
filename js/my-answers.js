// Check session and redirect if not logged in
fetch('../php/check_session.php')
  .then(response => response.json())
  .then(data => {
    if (!data.logged_in) {
      window.location.href = 'login.html';
      return;
    }
    loadMyAnswers();
  })
  .catch(error => {
    console.error('Error checking session:', error);
  });

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (isNaN(date)) return "Unknown date";
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function loadMyAnswers() {
  fetch('../php/get-my-answers.php')
    .then(response => response.json())
    .then(answers => {
      const container = document.getElementById('myAnswersContainer');
      container.innerHTML = ''; // Clear loading message

      if (answers.length === 0) {
        container.innerHTML = '<p class="no-answers">You haven\'t answered any questions yet.</p>';
        return;
      }

      answers.forEach(answer => {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-item';
        answerDiv.innerHTML = `
          <div class="question-title">
            <h3>Question: <a href="question.html?id=${answer.question_id}">${answer.question_title}</a></h3>
          </div>
          <div class="answer-content">
            <p>${answer.content}</p>
            <div class="answer-stats">
              <span>Posted on ${formatDate(answer.created_at)}</span>
            </div>
          </div>
          <div class="answer-actions">
            <button onclick="editAnswer(${answer.id}, ${answer.question_id})" class="edit-btn">Edit</button>
            <button onclick="deleteAnswer(${answer.id}, ${answer.question_id})" class="delete-btn">Delete</button>
          </div>
        `;
        container.appendChild(answerDiv);
      });
    })
    .catch(error => {
      console.error('Error loading answers:', error);
      document.getElementById('myAnswersContainer').innerHTML = 
        '<p class="error">Error loading your answers. Please try again later.</p>';
    });
}

function editAnswer(answerId, questionId) {
  window.location.href = `question.html?id=${questionId}&answer=${answerId}&edit=true`;
}

function deleteAnswer(answerId, questionId) {
  if (!confirm('Are you sure you want to delete this answer?')) {
    return;
  }

  const formData = new FormData();
  formData.append('id', answerId);

  fetch('../php/delete-answer.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadMyAnswers(); // Reload the list
    } else {
      alert(data.message || 'Error deleting answer');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error deleting answer');
  });
}