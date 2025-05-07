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
    console.log('JSON starts at position:', jsonStart);
    if (jsonStart !== -1 && jsonStart > 0) {
      console.log('Content before JSON:', text.substring(0, jsonStart));
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw parseError;
    }
    
    console.log('Parsed data:', data);
    
    if (!data || !data.questions || !Array.isArray(data.questions)) {
      console.error('Invalid data format:', data);
      const list = document.getElementById('questionList');
      if (list) {
        list.innerHTML = '<p>Error loading questions</p>';
      }
      return;
    }

    const list = document.getElementById('questionList');
    if (!list) {
      console.error('Question list element not found');
      return;
    }
    
    list.innerHTML = '';
    const currentUserId = sessionStorage.getItem('user_id');
    
    data.questions.forEach(question => {
      const questionElement = document.createElement('div');
      questionElement.className = 'question';
      const isOwner = currentUserId && question.user_id == currentUserId;
      
      let actionButtons = '';
      if (isOwner) {
        actionButtons = `
          <div class="question-actions">
            <button onclick="editQuestion(${question.id})">Edit</button>
            <button onclick="deleteQuestion(${question.id})">Delete</button>
          </div>
        `;
      }
      
      questionElement.innerHTML = `
        <h3><a href="question.html?id=${question.id}">${question.title}</a></h3>
        <p>${question.description}</p>
        <div class="question-meta">
          <span class="author">Asked by: ${question.username || 'Anonymous'}</span>
          <span class="date">${new Date(question.created_at).toLocaleDateString()}</span>
        </div>
        ${actionButtons}
      `;
      list.appendChild(questionElement);
    });
  } catch (err) {
    console.error('Error loading questions:', err);
    const list = document.getElementById('questionList');
    if (list) {
      list.innerHTML = '<li>Error loading questions. Check console for details.</li>';
    }
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
    
    const data = await response.json();
    
    // Check if the current user owns this question
    if (data.user_id != sessionStorage.getItem('user_id')) {
      alert('You can only edit your own questions.');
      return;
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Question';
    document.getElementById('questionId').value = data.id;
    document.getElementById('questionTitle').value = data.title;
    document.getElementById('questionDescription').value = data.description;
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
