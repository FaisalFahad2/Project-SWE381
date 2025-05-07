// Check session and redirect if not logged in
fetch('../php/check_session.php')
  .then(response => response.json())
  .then(data => {
    if (!data.logged_in) {
      window.location.href = 'login.html';
      return;
    }
    loadMyQuestions();
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

function loadMyQuestions() {
  fetch('../php/get-my-questions.php')
    .then(response => response.json())
    .then(questions => {
      const container = document.getElementById('myQuestionList');
      container.innerHTML = ''; // Clear loading message

      if (questions.length === 0) {
        container.innerHTML = '<p class="no-questions">You haven\'t asked any questions yet.</p>';
        return;
      }

      questions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
          <h3><a href="question.html?id=${question.id}">${question.title}</a></h3>
          <p class="description">${question.description}</p>
          <div class="question-stats">
            <span>${question.answer_count} answers</span>
            <span>${question.comment_count} comments</span>
            <span>Posted on ${formatDate(question.created_at)}</span>
          </div>
          <div class="question-actions">
            <button onclick="editQuestion(${question.id})" class="edit-btn">Edit</button>
            <button onclick="deleteQuestion(${question.id})" class="delete-btn">Delete</button>
          </div>
        `;
        container.appendChild(questionDiv);
      });
    })
    .catch(error => {
      console.error('Error loading questions:', error);
      document.getElementById('myQuestionList').innerHTML = 
        '<p class="error">Error loading your questions. Please try again later.</p>';
    });
}

function editQuestion(id) {
  window.location.href = `question.html?id=${id}&edit=true`;
}

function deleteQuestion(id) {
  if (!confirm('Are you sure you want to delete this question?')) {
    return;
  }

  const formData = new FormData();
  formData.append('id', id);

  fetch('../php/delete-question.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadMyQuestions(); // Reload the list
    } else {
      alert(data.message || 'Error deleting question');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error deleting question');
  });
} 