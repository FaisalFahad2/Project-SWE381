console.log("question-details.js is loaded!");

// Function to check if elements exist
function checkElements() {
  const elements = {
    userLink: document.getElementById('userLink'),
    addAnswerBtn: document.getElementById('addAnswerBtn'),
    questionActions: document.getElementById('questionActions'),
    commentBtn: document.getElementById('commentBtn')
  };
  
  console.log('Checking elements:', elements);
  return elements;
}

// Function to handle session check
function checkSession() {
  console.log('Checking session...');
  return fetch('../php/check_session.php')
    .then(response => {
      console.log('Session response received:', response);
      return response.json();
    })
    .then(data => {
      console.log('Session data:', data);
      return data;
    })
    .catch(error => {
      console.error('Session check error:', error);
      throw error;
    });
}

// Function to update UI based on session
function updateUI(data) {
  console.log('Updating UI with data:', data);
  const elements = checkElements();
  
  if (data.logged_in) {
    console.log('User is logged in');
    if (elements.userLink) {
      elements.userLink.href = '../php/profile.php';
      elements.userLink.textContent = 'Profile';
    }
    if (elements.addAnswerBtn) {
      elements.addAnswerBtn.style.display = 'block';
      console.log('Add Answer button displayed');
    }
    if (elements.commentBtn) {
      elements.commentBtn.style.display = 'block';
      console.log('Comment button displayed');
    }
  } else {
    console.log('User is not logged in');
    if (elements.addAnswerBtn) elements.addAnswerBtn.style.display = 'none';
    if (elements.commentBtn) elements.commentBtn.style.display = 'none';
    if (elements.questionActions) elements.questionActions.style.display = 'none';
  }
}

function attachQuestionEditDeleteHandlers(questionId, oldTitle, oldBody) {
  const editBtn = document.getElementById('editQuestionBtn');
  const deleteBtn = document.getElementById('deleteQuestionBtn');
  const titleElem = document.getElementById('questionTitle');
  const bodyElem = document.getElementById('questionBody');

  if (editBtn) {
    editBtn.onclick = function() {
      // Show input fields for editing
      titleElem.innerHTML = `<input type="text" id="editTitleInput" value="${oldTitle}" style="width:100%;">`;
      bodyElem.innerHTML = `<textarea id="editBodyInput" style="width:100%;height:80px;">${oldBody}</textarea><br><button id="saveEditQuestionBtn">Save</button> <button id="cancelEditQuestionBtn">Cancel</button>`;
      document.getElementById('saveEditQuestionBtn').onclick = function() {
        const newTitle = document.getElementById('editTitleInput').value;
        const newBody = document.getElementById('editBodyInput').value;
        fetch('../php/edit-question.php', {
          method: 'POST',
          body: new URLSearchParams({ id: questionId, title: newTitle, description: newBody })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            titleElem.textContent = newTitle;
            bodyElem.textContent = newBody;
          } else {
            alert(data.message || 'Failed to edit question');
          }
        });
      };
      document.getElementById('cancelEditQuestionBtn').onclick = function() {
        titleElem.textContent = oldTitle;
        bodyElem.textContent = oldBody;
      };
    };
  }
  if (deleteBtn) {
    deleteBtn.onclick = function() {
      if (!confirm('Are you sure you want to delete this question?')) return;
      fetch('../php/delete-question.php', {
        method: 'POST',
        body: new URLSearchParams({ id: questionId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Question deleted');
          window.location.href = 'index.html';
        } else {
          alert(data.message || 'Failed to delete question');
        }
      });
    };
  }
}

function loadQuestionDetails(currentUserId = null) {
  const questionId = new URLSearchParams(window.location.search).get('id');
  console.log('Parsed questionId from URL:', questionId);
  if (!questionId) {
    document.getElementById('questionTitle').textContent = "No question ID provided.";
    return;
  }

  console.log('Loading question details for ID:', questionId);

  // Load question details
  fetch(`../php/get-question-details.php?id=${questionId}`)
    .then(response => {
      console.log('Question details response:', response);
      return response.json();
    })
    .then(data => {
      console.log('Question details data:', data);
      if (data.success) {
        document.getElementById('questionTitle').textContent = data.title;
        document.getElementById('questionBody').textContent = data.description;
        // Attach edit/delete handlers
        attachQuestionEditDeleteHandlers(questionId, data.title, data.description);
        // Show edit/delete buttons only if user owns the question
        if (currentUserId && data.user_id == currentUserId) {
          const questionActions = document.getElementById('questionActions');
          if (questionActions) questionActions.style.display = 'block';
        }
        // Load answers and comments immediately after question details
        console.log('About to load answers for question:', questionId);
        loadAnswers(questionId);
      } else {
        document.getElementById('questionTitle').textContent = "Question not found.";
        document.getElementById('questionBody').textContent = "";
      }
    })
    .catch(error => {
      console.error('Error loading question details:', error);
      document.getElementById('questionTitle').textContent = "Error loading question.";
      document.getElementById('questionBody').textContent = "";
    });
}

function loadAnswers(questionId) {
  console.log('Loading answers for question:', questionId);
  const formData = new FormData();
  formData.append("question_id", questionId);

  console.log('Sending request to get-answers-comments.php');
  fetch("../php/get-answers-comments.php", {
    method: "POST",
    body: formData
  })
  .then(res => {
    console.log('Raw response:', res);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log('Parsed answers data:', data);
    
    if (!data.success) {
      console.error('Server returned error:', data.message);
      return;
    }

    // Handle question comments
    const questionCommentsContainer = document.getElementById("questionComments");
    if (questionCommentsContainer) {
      questionCommentsContainer.innerHTML = "";
      if (data.question_comments && data.question_comments.length > 0) {
        console.log('Loading question comments:', data.question_comments);
        data.question_comments.forEach(comment => {
          const commentDiv = document.createElement("div");
          commentDiv.className = "comment-card";
          commentDiv.innerHTML = `
            <div class="comment-meta">${comment.user}</div>
            <div class="comment-content">${comment.content}</div>
            ${comment.is_owner ? `<div class="comment-actions"><button class="comment-action-btn edit-comment-btn" data-comment-id="${comment.id}">Edit</button> <button class="comment-action-btn delete-comment-btn" data-comment-id="${comment.id}">Delete</button></div>` : ''}
          `;
          questionCommentsContainer.appendChild(commentDiv);
        });
      }
    }

    // Handle answers
    const answersContainer = document.getElementById("answersContainer");
    if (answersContainer) {
      answersContainer.innerHTML = "";
      if (data.answers && data.answers.length > 0) {
        data.answers.forEach(answer => {
          const upActive = answer.user_vote === 'up' ? 'active' : '';
          const downActive = answer.user_vote === 'down' ? 'active' : '';
          const answerDiv = document.createElement("div");
          answerDiv.className = "answer-card";
          answerDiv.innerHTML = `
            <div class="answer-header">
              <strong>${answer.user}</strong> answered:
              <span class="answer-date">${formatDate(answer.created_at)}</span>
            </div>
            <div class="answer-content">${answer.content}</div>
            <div class="answer-actions">
              <button class="vote-btn upvote ${upActive}" data-answer-id="${answer.id}">↑</button>
              <span class="rating-value">${answer.rating ?? 0}</span>
              <button class="vote-btn downvote ${downActive}" data-answer-id="${answer.id}">↓</button>
              <button class="open-comment-modal" data-answer-id="${answer.id}">Add Comment</button>
              ${answer.is_owner ? `<button class="edit-answer-btn" data-answer-id="${answer.id}">Edit</button> <button class="delete-answer-btn" data-answer-id="${answer.id}">Delete</button>` : ''}
            </div>
            <div class="answer-comments">
              ${(answer.comments || []).map(comment => `
                <div class='comment-card'>
                  <div class='comment-meta'>${comment.user}</div>
                  <div class='comment-content'>${comment.content}</div>
                  ${comment.is_owner ? `<div class='comment-actions'><button class='comment-action-btn edit-comment-btn' data-comment-id='${comment.id}'>Edit</button> <button class='comment-action-btn delete-comment-btn' data-comment-id='${comment.id}'>Delete</button></div>` : ''}
                </div>
              `).join('')}
            </div>
          `;
          answersContainer.appendChild(answerDiv);
        });
      } else {
        answersContainer.innerHTML = '<p>No answers yet. Be the first to answer!</p>';
      }
      attachVoteHandlers();
      attachAnswerEditDeleteHandlers(questionId);
      attachCommentEditDeleteHandlers(questionId);
    }
  })
  .catch(error => {
    console.error('Error loading answers:', error);
  });
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (isNaN(date)) return "Unknown date";
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Answer Submission Modal Logic ---
function setupAnswerModal() {
  const addAnswerBtn = document.getElementById('addAnswerBtn');
  const answerModal = document.getElementById('answerModal');
  const closeBtns = answerModal.querySelectorAll('.close');
  const answerForm = document.getElementById('answerForm');
  const answerContent = document.getElementById('answerContent');
  const questionId = new URLSearchParams(window.location.search).get('id');

  if (addAnswerBtn && answerModal) {
    addAnswerBtn.onclick = () => {
      answerModal.style.display = 'flex';
    };
  }
  closeBtns.forEach(btn => btn.onclick = () => { answerModal.style.display = 'none'; });

  if (answerForm) {
    answerForm.onsubmit = function(e) {
      e.preventDefault();
      const formData = new FormData(answerForm);
      formData.set('question_id', questionId);
      fetch('../php/submit-answer.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          answerModal.style.display = 'none';
          answerContent.value = '';
          loadAnswers(questionId);
        } else {
          alert(data.message || 'Failed to submit answer');
        }
      })
      .catch(() => alert('Failed to submit answer'));
    };
  }
}

// --- Voting Logic ---
function vote(answerId, type, btn) {
  fetch('../php/vote.php', {
    method: 'POST',
    body: new URLSearchParams({ answer_id: answerId, vote_type: type })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Update the rating value in the DOM
      const ratingSpan = btn.parentElement.querySelector('.rating-value');
      if (ratingSpan) ratingSpan.textContent = data.rating;
      // Highlight active button
      btn.classList.add('active');
      if (type === 'up') {
        btn.parentElement.querySelector('.downvote').classList.remove('active');
      } else {
        btn.parentElement.querySelector('.upvote').classList.remove('active');
      }
    } else {
      alert(data.message || 'Vote failed');
    }
  });
}

function attachVoteHandlers() {
  document.querySelectorAll('.upvote').forEach(btn => {
    btn.onclick = function() {
      vote(btn.dataset.answerId, 'up', btn);
    };
  });
  document.querySelectorAll('.downvote').forEach(btn => {
    btn.onclick = function() {
      vote(btn.dataset.answerId, 'down', btn);
    };
  });
}

// --- Answer Editing/Deleting Logic ---
function attachAnswerEditDeleteHandlers(questionId) {
  document.querySelectorAll('.edit-answer-btn').forEach(btn => {
    btn.onclick = function() {
      const answerId = btn.getAttribute('data-answer-id');
      const answerDiv = btn.closest('.answer-card');
      const contentDiv = answerDiv.querySelector('.answer-content');
      const oldContent = contentDiv.textContent;
      contentDiv.innerHTML = `<textarea class='edit-answer-textarea' style='width:100%;height:60px;'>${oldContent}</textarea>
        <button class='save-edit-answer-btn'>Save</button>
        <button class='cancel-edit-answer-btn'>Cancel</button>`;
      const saveBtn = contentDiv.querySelector('.save-edit-answer-btn');
      const cancelBtn = contentDiv.querySelector('.cancel-edit-answer-btn');
      saveBtn.onclick = function() {
        const newContent = contentDiv.querySelector('.edit-answer-textarea').value;
        fetch('../php/edit-answer.php', {
          method: 'POST',
          body: new URLSearchParams({ id: answerId, content: newContent })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            contentDiv.textContent = newContent;
          } else {
            alert(data.message || 'Failed to edit answer');
          }
        });
      };
      cancelBtn.onclick = function() {
        contentDiv.textContent = oldContent;
      };
    };
  });
  document.querySelectorAll('.delete-answer-btn').forEach(btn => {
    btn.onclick = function() {
      if (!confirm('Are you sure you want to delete this answer?')) return;
      const answerId = btn.getAttribute('data-answer-id');
      fetch('../php/delete-answer.php', {
        method: 'POST',
        body: new URLSearchParams({ id: answerId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadAnswers(questionId);
        } else {
          alert(data.message || 'Failed to delete answer');
        }
      });
    };
  });
}

// --- Comment Modal Logic ---
function setupCommentModal() {
  const commentBtn = document.getElementById('commentBtn');
  const commentModal = document.getElementById('commentModal');
  const closeBtns = commentModal.querySelectorAll('.close');
  const commentForm = document.getElementById('commentForm');
  const commentContent = document.getElementById('commentContent');
  const questionId = new URLSearchParams(window.location.search).get('id');

  // Open modal for question comment
  if (commentBtn && commentModal) {
    commentBtn.onclick = () => {
      // Always get the latest questionId from the URL
      const questionId = new URLSearchParams(window.location.search).get('id');
      const qidInput = document.getElementById('commentQuestionId');
      const aidInput = document.getElementById('commentAnswerId');
      if (qidInput) {
        qidInput.value = questionId;
        console.log('Set commentQuestionId value:', qidInput.value);
      }
      if (aidInput) aidInput.value = '';
      commentModal.style.display = 'flex';
    };
  }
  // Open modal for answer comment
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('open-comment-modal')) {
      const qidInput = document.getElementById('commentQuestionId');
      const aidInput = document.getElementById('commentAnswerId');
      if (qidInput) qidInput.value = '';
      if (aidInput) aidInput.value = e.target.getAttribute('data-answer-id');
      commentModal.style.display = 'flex';
    }
  });
  closeBtns.forEach(btn => btn.onclick = () => { commentModal.style.display = 'none'; });

  if (commentForm) {
    commentForm.onsubmit = function(e) {
      e.preventDefault();
      const answerId = document.getElementById('commentAnswerId').value;
      if (answerId) {
        // Comment for answer
        document.getElementById('commentQuestionId').value = '';
      } else {
        // Comment for question
        const questionId = new URLSearchParams(window.location.search).get('id');
        document.getElementById('commentQuestionId').value = questionId;
      }
      console.log('DOM value before submit:', document.getElementById('commentQuestionId').value);
      const formData = new FormData(commentForm);
      console.log('Submitting comment:', {
        question_id: formData.get('question_id'),
        answer_id: formData.get('answer_id'),
        content: formData.get('content')
      });
      fetch('../php/submit-comment.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          commentModal.style.display = 'none';
          commentContent.value = '';
          loadAnswers(document.getElementById('commentQuestionId').value || new URLSearchParams(window.location.search).get('id'));
        } else {
          alert(data.message || 'Failed to submit comment');
        }
      })
      .catch(() => alert('Failed to submit comment'));
    };
  }
}

// --- Comment Editing/Deleting Logic ---
function attachCommentEditDeleteHandlers(questionId) {
  // Edit comment
  document.querySelectorAll('.edit-comment-btn').forEach(btn => {
    btn.onclick = function() {
      const commentId = btn.getAttribute('data-comment-id');
      const commentDiv = btn.closest('.comment-card');
      const contentDiv = commentDiv.querySelector('.comment-content');
      const oldContent = contentDiv.textContent;
      contentDiv.innerHTML = `<textarea class="edit-comment-textarea" style="width:100%;">${oldContent}</textarea>
        <button class="save-edit-comment-btn">Save</button>
        <button class="cancel-edit-comment-btn">Cancel</button>`;
      const saveBtn = contentDiv.querySelector('.save-edit-comment-btn');
      const cancelBtn = contentDiv.querySelector('.cancel-edit-comment-btn');
      saveBtn.onclick = function() {
        const newContent = contentDiv.querySelector('.edit-comment-textarea').value;
        fetch('../php/edit-comment.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `id=${commentId}&content=${encodeURIComponent(newContent)}`
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            contentDiv.textContent = newContent;
          } else {
            alert('Error: ' + (data.error || 'Failed to edit comment'));
          }
        });
      };
      cancelBtn.onclick = function() {
        contentDiv.textContent = oldContent;
      };
    };
  });
  // Delete comment
  document.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.onclick = function() {
      const commentId = btn.getAttribute('data-comment-id');
      if (!confirm('Are you sure you want to delete this comment?')) return;
      fetch('../php/delete-comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${commentId}`
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Remove the comment div
          const commentDiv = btn.closest('.comment-card');
          if (commentDiv) commentDiv.remove();
        } else {
          alert('Error: ' + (data.error || 'Failed to delete comment'));
        }
      });
    };
  });
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded event fired in question-details.js");
  checkSession()
    .then(data => {
      updateUI(data);
      loadQuestionDetails(data.user_id);
      setupAnswerModal();
      setupCommentModal();
    })
    .catch(error => {
      console.error('Error during initialization:', error);
      loadQuestionDetails();
      setupAnswerModal();
      setupCommentModal();
    });
}); 