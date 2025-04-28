/* ../js/main.js  — NEW absolute paths added */

const PROJECT_ROOT = '/Project-SWE381';
const API_ROOT     = `${PROJECT_ROOT}/php/`;

/* ---------- open/close answer & comment modals (unchanged) ---------- */
const commentBtn  = document.getElementById('commentBtn');
const commentModal = document.getElementById('commentModal');
commentBtn.addEventListener('click', () => commentModal.style.display = 'flex');

const answerBtn  = document.getElementById('addAnswerBtn');
const answerModal = document.getElementById('answerModal');
answerBtn.addEventListener('click', () => answerModal.style.display = 'flex');

document.addEventListener('click', e => {
  if (e.target.className === 'close') {
    e.target.parentElement.parentElement.style.display = 'none';
  }
});

/* ---------------- load answers & comments ---------------- */
function loadAnswers(questionId) {
  const fd = new FormData();
  fd.append('question_id', questionId);

  fetch(`${API_ROOT}get-answers-comments.php`, {  // <— path fixed
    method: 'POST',
    body:   fd
  })
  .then(r => r.json())
  .then(data => {
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    data.answers.forEach(answer => {
      const answerDiv = document.createElement('div');
      answerDiv.className = 'answer';
      answerDiv.innerHTML = `
        <p><strong>${answer.user}:</strong> ${answer.content}</p>
        <button class="open-comment-modal" data-answer-id="${answer.id}">
          Add Comment
        </button>
        <div class="comments">
          ${answer.comments
              .map(c => `<p><em>${c.user}: ${c.content}</em></p>`)
              .join('')}
        </div>
      `;
      container.appendChild(answerDiv);
    });
  })
  .catch(err => console.error('Error loading answers:', err));
}
