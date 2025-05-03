/* ../js/questions.js */

/*
 *  Set this constant to the folder that sits directly under http://localhost/
 *  In your case (see the Network tab: "…/Project-SWE381/html%20files/…")
 *  that folder is "Project-SWE381".
 */
// const PROJECT_ROOT = '/Project-SWE381';   //  ← change if your project folder is named differently
// const API_ROOT     = `${PROJECT_ROOT}/php/`;   // → resolves to /Project-SWE381/php/...

/* ───────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  // Load questions on page load
  loadQuestions();

  // Modal elements
  const modal = document.getElementById("questionModal");
  const addBtn = document.getElementById("addQuestionBtn");
  const closeModal = document.getElementById("closeModal");
  const questionForm = document.getElementById("questionForm");

  // Open modal on "Add Question" button click
  addBtn.addEventListener('click', function() {
    document.getElementById("modalTitle").textContent = "Add Question";
    questionForm.reset();
    document.getElementById("questionId").value = "";
    document.body.style.overflow = "hidden";
    modal.style.display = "flex";
  });

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
    const text = await response.text();
    console.log('Raw response:', text);
    
    const data = JSON.parse(text);
    const list = document.getElementById('questionList');
    list.innerHTML = '';
    
    data.forEach(q => {
      const li = document.createElement('li');
      li.innerHTML = `
        <h3><a href="question.html?id=${q.id}">${q.title}</a></h3>
        <p>${q.description}</p>
        <button onclick="editQuestion(${q.id})">Edit</button>
        <button onclick="deleteQuestion(${q.id})">Delete</button>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading questions:', err);
    const list = document.getElementById('questionList');
    list.innerHTML = '<li>Error loading questions. Check console for details.</li>';
  }
}

async function editQuestion(id) {
  try {
    const fd = new FormData();
    fd.append('id', id);

    const response = await fetch(`/Project-SWE381/php/get-question.php`, { 
      method: 'POST', 
      body: fd 
    });
    
    const q = await response.json();
    
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
  if (!confirm('Delete this question?')) return;

  try {
    const fd = new FormData();
    fd.append('id', id);

    const response = await fetch(`/Project-SWE381/php/delete-question.php`, { 
      method: 'POST', 
      body: fd 
    });
    
    await loadQuestions();
  } catch (err) {
    console.error('Error deleting question:', err);
    alert('Error deleting question. Check console for details.');
  }
}
