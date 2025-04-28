/* ../js/questions.js */

/*
 *  Set this constant to the folder that sits directly under http://localhost/
 *  In your case (see the Network tab: “…/Project-SWE381/html%20files/…”)
 *  that folder is “Project-SWE381”.
 */
const PROJECT_ROOT = '/Project-SWE381';   //  ← change if your project folder is named differently
const API_ROOT     = `${PROJECT_ROOT}/php/`;   // → resolves to /Project-SWE381/php/...

/* ───────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  /* initial load */
  loadQuestions();

  /* modal elements */
  const modal        = document.getElementById('questionModal');
  const addBtn       = document.getElementById('addQuestionBtn');
  const closeModal   = document.getElementById('closeModal');
  const questionForm = document.getElementById('questionForm');

  /* open modal */
  addBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add Question';
    questionForm.reset();
    document.getElementById('questionId').value = '';
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
  });

  /* close modal */
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  /* add / edit submit */
  questionForm.addEventListener('submit', e => {
    e.preventDefault();

    const id          = document.getElementById('questionId').value;
    const title       = document.getElementById('questionTitle').value.trim();
    const description = document.getElementById('questionDescription').value.trim();

    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);

    /* ----- add ----- */
    if (!id) {
      fetch(`${API_ROOT}submit-question.php`, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(({ success, message }) => {
          if (success) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            loadQuestions();
          } else {
            alert(message || 'Could not add question.');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Network / server error – check console.');
        });
      return;
    }

    /* ----- edit ----- */
    fd.append('id', id);
    fetch(`${API_ROOT}edit-question.php`, { method: 'POST', body: fd })
      .then(r => r.text())
      .then(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        loadQuestions();
      })
      .catch(err => {
        console.error(err);
        alert('Network / server error – check console.');
      });
  });

  /* search */
  document.getElementById('searchBtn').addEventListener('click', () => {
    const term = document.getElementById('searchInput').value;
    loadQuestions(term);
  });
});

/* ------------ helpers ------------ */
function loadQuestions(term = '') {
  let url = `${API_ROOT}get-question.php`;
  if (term) url += `?search=${encodeURIComponent(term)}`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('questionList');
      list.innerHTML = '';
      data.forEach(q => {
        const li = document.createElement('li');
        li.innerHTML = `
          <h3>${q.title}</h3>
          <p>${q.description}</p>
          <button onclick="editQuestion(${q.id})">Edit</button>
          <button onclick="deleteQuestion(${q.id})">Delete</button>
        `;
        list.appendChild(li);
      });
    })
    .catch(err => console.error('Error loading questions:', err));
}

function editQuestion(id) {
  const fd = new FormData();
  fd.append('id', id);

  fetch(`${API_ROOT}get-question.php`, { method: 'POST', body: fd })
    .then(r => r.json())
    .then(q => {
      document.getElementById('modalTitle').textContent           = 'Edit Question';
      document.getElementById('questionId').value                 = q.id;
      document.getElementById('questionTitle').value              = q.title;
      document.getElementById('questionDescription').value        = q.description;
      document.body.style.overflow = 'hidden';
      document.getElementById('questionModal').style.display = 'flex';
    });
}

function deleteQuestion(id) {
  if (!confirm('Delete this question?')) return;

  const fd = new FormData();
  fd.append('id', id);

  fetch(`${API_ROOT}delete-question.php`, { method: 'POST', body: fd })
    .then(() => loadQuestions())
    .catch(err => {
      console.error(err);
      alert('Network / server error – check console.');
    });
}
