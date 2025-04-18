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

    // Disable page scroll
    document.body.style.overflow = "hidden";

    // Show the modal
    modal.style.display = "flex";  // Use "flex" so align-items & justify-content center
  });

  // Close modal when clicking the close icon
  closeModal.addEventListener('click', function() {
    modal.style.display = "none";

    // Re-enable scrolling
    document.body.style.overflow = "auto";
  });

  // Close modal if clicking outside the modal content
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Handle form submission (for add/edit)
  questionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let questionId = document.getElementById("questionId").value;
    let title = document.getElementById("questionTitle").value;
    let description = document.getElementById("questionDescription").value;
    let formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (questionId) { // Edit existing question
      formData.append('id', questionId);
      fetch('php/edit-question.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        loadQuestions();
      });
    } else { // Add new question
      fetch('php/submit-question.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        loadQuestions();
      });
    }
  });

  // Search functionality
  document.getElementById("searchBtn").addEventListener('click', function() {
    let searchTerm = document.getElementById("searchInput").value;
    loadQuestions(searchTerm);
  });
});

// Function to load questions via AJAX
function loadQuestions(searchTerm = '') {
  let url = 'php/get-question.php';
  if (searchTerm) {
    url += '?search=' + encodeURIComponent(searchTerm);
  }
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const questionList = document.getElementById("questionList");
      questionList.innerHTML = '';
      data.forEach(function(question) {
        let li = document.createElement("li");
        li.innerHTML = `
          <h3>${question.title}</h3>
          <p>${question.description}</p>
          <button onclick="editQuestion(${question.id})">Edit</button>
          <button onclick="deleteQuestion(${question.id})">Delete</button>
        `;
        questionList.appendChild(li);
      });
    })
    .catch(error => console.error('Error loading questions:', error));
}

// Open modal to edit a question
function editQuestion(id) {
  let formData = new FormData();
  formData.append('id', id);
  fetch('php/get-question.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(question => {
    document.getElementById("modalTitle").textContent = "Edit Question";
    document.getElementById("questionId").value = question.id;
    document.getElementById("questionTitle").value = question.title;
    document.getElementById("questionDescription").value = question.description;

    // Disable page scroll
    document.body.style.overflow = "hidden";

    // Show the modal
    let modal = document.getElementById("questionModal");
    modal.style.display = "flex";
  });
}

// Delete a question
function deleteQuestion(id) {
  if (confirm("Are you sure you want to delete this question?")) {
    let formData = new FormData();
    formData.append('id', id);
    fetch('php/delete-question.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      loadQuestions();
    });
  }
}
