function search() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm !== '') {
    localStorage.setItem('searchTerm', searchTerm);
    console.log("Search Term Saved:", searchTerm);
    window.location.href = 'search-results.html';
  } else {
    alert("Please enter a search term.");
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', search);
  }
});

const term = localStorage.getItem('searchTerm');
console.log('Search Term:', term);

if (term) {
  fetch(`../php/search.php?search=${encodeURIComponent(term)}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';

      if (data.message) {
        resultsDiv.innerHTML = `<p>${data.message}</p>`;
      } else {
        data.forEach(item => {
          console.log("Result item:", item); 
          resultsDiv.innerHTML += `
            <div class="question">
              <a href="question.html?id=${item.id}">
                <p><b>Title:</b> ${item.title}</p>
              </a>
              <p><b>Question ID:</b> ${item.id}</p>
              <p><b>Description:</b> ${item.description}</p>
              <p><b>Created At:</b> ${item.created_at}</p>
              <hr>
            </div>
          `;
        });
      }
    });
} else {
  document.getElementById('results').innerHTML = '<p>No search term provided.</p>';
}

// استخراج معرف السؤال من الرابط
function getQuestionIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// تحميل تفاصيل السؤال بناءً على ID
function loadQuestionDetails() {
  const questionId = getQuestionIdFromURL();
  if (!questionId) {
    document.getElementById('questionTitle').textContent = "No question ID provided.";
    return;
  }

  fetch(`../php/get-question-details.php?id=${questionId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById('questionTitle').textContent = data.title;
        document.getElementById('questionBody').textContent = data.description;

        const commentBtn = document.getElementById('commentBtn');
        if (commentBtn) {
          commentBtn.dataset.questionId = questionId;
        }

        const answerBtn = document.getElementById('addAnswerBtn');
        if (answerBtn) {
          answerBtn.dataset.questionId = questionId;
        }

      } else {
        document.getElementById('questionTitle').textContent = "Question not found.";
        document.getElementById('questionBody').textContent = "";
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('questionTitle').textContent = "Error loading question.";
      document.getElementById('questionBody').textContent = "";
    });
}

// تحميل التفاصيل عند فتح الصفحة
window.onload = loadQuestionDetails;
