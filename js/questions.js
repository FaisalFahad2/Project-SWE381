/* ../js/questions.js */

/*
 *  Set this constant to the folder that sits directly under http://localhost/
 *  In your case (see the Network tab: "…/Project-SWE381/html%20files/…")
 *  that folder is "Project-SWE381".
 */
// const PROJECT_ROOT = '/Project-SWE381';   //  ← change if your project folder is named differently
// const API_ROOT     = `${PROJECT_ROOT}/php/`;   // → resolves to /Project-SWE381/php/...

/* ───────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async function() {
  // Load questions on page load
  loadQuestions();

  // Modal elements
  const modal = document.getElementById("questionModal");
  const addBtn = document.getElementById("addQuestionBtn");
  const closeModal = document.getElementById("closeModal");
  const questionForm = document.getElementById("questionForm");

  // Check if user is logged in using the session endpoint
  let isLoggedIn = false;
  try {
    const response = await fetch('/Project-SWE381/php/check_session.php');
    const data = await response.json();
    isLoggedIn = data.logged_in;
    if (isLoggedIn) {
      sessionStorage.setItem('user_id', data.user_id);
      sessionStorage.setItem('username', data.username);
    }
  } catch (err) {
    console.error('Error checking session:', err);
  }
  
  // Show/hide Add Question button based on login status
  if (addBtn) {
    if (!isLoggedIn) {
      addBtn.style.display = 'none';
    } else {
      addBtn.style.display = 'block';
    }
  }

  // Open modal on "Add Question" button click
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
      }
      document.getElementById("modalTitle").textContent = "Add Question";
      questionForm.reset();
      document.getElementById("questionId").value = "";
      document.body.style.overflow = "hidden";
      modal.style.display = "flex";
    });
  }

  // Close modal when clicking the close icon
  closeModal.addEventListener('click', function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Handle form submission (for add/edit)
  questionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
  
    // Disable the submit button to prevent double submission
    const submitBtn = questionForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
  
    let id = document.getElementById("questionId").value;
    let title = document.getElementById("questionTitle").value;
    let description = document.getElementById("questionDescription").value;
    
    let fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
  
    try {
      /* ----- add ----- */
      if (!id) {
        const response = await fetch(`/Project-SWE381/php/submit-question.php`, { 
          method: 'POST', 
          body: fd 
        });
        
        const data = await response.json();
        
        if (data.success) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
          await loadQuestions();
        } else {
          alert(data.message || 'Could not add question.');
        }
      } else {
        /* ----- edit ----- */
        fd.append('id', id);
        const response = await fetch(`/Project-SWE381/php/edit-question.php`, { 
          method: 'POST', 
          body: fd 
        });
        
        const data = await response.json();
        
        if (data.success) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
          await loadQuestions();
        } else {
          alert(data.message || 'Could not edit question.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network / server error – check console.');
    } finally {
      if (submitBtn) submitBtn.disabled = false; // Re-enable button
    }
  });

  /* search */
  document.getElementById('searchBtn').addEventListener('click', () => {
    const term = document.getElementById('searchInput').value;
    loadQuestions(term);
  });
});

/* ------------ helpers ------------ */
async function loadQuestions(term = '') {
  let url = `/Project-SWE381/php/get-question.php`;
  if (term) url += `?search=${encodeURIComponent(term)}`;

  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    const text = await response.text();
    console.log('Raw response:', text);
    console.log('Response type:', typeof text);
    console.log('Response length:', text.length);
    
    // Try to find where the invalid content starts
    const jsonStart = text.indexOf('{');
    const jsonStart2 = text.indexOf('[');
    if (jsonStart !== -1 || jsonStart2 !== -1) {
      const start = Math.min(jsonStart === -1 ? Infinity : jsonStart, jsonStart2 === -1 ? Infinity : jsonStart2);
      console.log('JSON starts at position:', start);
      if (start > 0) {
        console.log('Content before JSON:', text.substring(0, start));
      }
    }
    
    const data = JSON.parse(text);
    // Support both array and object with questions/data property
    const questions = Array.isArray(data) ? data : (data.questions || data.data || []);
    const container = document.getElementById('questionList');
    container.innerHTML = '';
    
    const currentUserId = sessionStorage.getItem('user_id');
    
    questions.forEach(q => {
      const questionDiv = document.createElement('li');
      questionDiv.className = 'question-item';
      questionDiv.innerHTML = `
        <h3><a href="question.html?id=${q.id}">${q.title}</a></h3>
        <div class="question-meta">
          <span>${q.answer_count} answers</span>
          <span>${q.comment_count} comments</span>
          <span>Posted on ${formatDate(q.created_at)}</span>
        </div>
        <p class="description">${q.description}</p>
        <div class="question-actions">
          <button onclick="editQuestion(${q.id})" class="edit-btn">Edit</button>
          <button onclick="deleteQuestion(${q.id})" class="delete-btn">Delete</button>
        </div>
      `;
      container.appendChild(questionDiv);
    });
  } catch (err) {
    console.error('Error loading questions:', err);
    const container = document.getElementById('questionList');
    container.innerHTML = '<li>Error loading questions. Check console for details.</li>';
  }
}

async function editQuestion(id) {
  if (!sessionStorage.getItem('user_id')) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const fd = new FormData();
    fd.append('id', id);

    const response = await fetch(`/Project-SWE381/php/get-question.php`, { 
      method: 'POST', 
      body: fd 
    });
    
    console.log('Edit response status:', response.status);
    console.log('Edit response headers:', Object.fromEntries(response.headers.entries()));
    const text = await response.text();
    console.log('Edit raw response:', text);
    
    // Try to find where the invalid content starts
    const jsonStart = text.indexOf('{');
    if (jsonStart !== -1) {
      console.log('JSON starts at position:', jsonStart);
      if (jsonStart > 0) {
        console.log('Content before JSON:', text.substring(0, jsonStart));
      }
    }
    
    const q = JSON.parse(text);
    
    // Check if the current user owns this question
    if (q.user_id != sessionStorage.getItem('user_id')) {
      alert('You can only edit your own questions.');
      return;
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Question';
    document.getElementById('questionId').value = q.id;
    document.getElementById('questionTitle').value = q.title;
    document.getElementById('questionDescription').value = q.description;
    document.body.style.overflow = 'hidden';
    document.getElementById('questionModal').style.display = 'flex';
  } catch (err) {
    console.error('Error loading question:', err);
    alert('Error loading question details. Check console for details.');
  }
}

async function deleteQuestion(id) {
  if (!sessionStorage.getItem('user_id')) {
    window.location.href = 'login.html';
    return;
  }

  if (!confirm('Delete this question?')) return;

  try {
    const fd = new FormData();
    fd.append('id', id);

    const response = await fetch(`/Project-SWE381/php/delete-question.php`, { 
      method: 'POST', 
      body: fd 
    });
    
    console.log('Delete response status:', response.status);
    console.log('Delete response headers:', Object.fromEntries(response.headers.entries()));
    const text = await response.text();
    console.log('Delete raw response:', text);
    
    // Try to find where the invalid content starts
    const jsonStart = text.indexOf('{');
    if (jsonStart !== -1) {
      console.log('JSON starts at position:', jsonStart);
      if (jsonStart > 0) {
        console.log('Content before JSON:', text.substring(0, jsonStart));
      }
    }
    
    const result = JSON.parse(text);
    if (result.success) {
      await loadQuestions();
    } else {
      alert(result.message || 'Error deleting question');
    }
  } catch (err) {
    console.error('Error deleting question:', err);
    alert('Error deleting question. Check console for details.');
  }
}

// Helper to format dates
function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (isNaN(date)) return "Unknown date";
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
