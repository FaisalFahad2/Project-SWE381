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

// Only run search functionality on search-results.html page
if (window.location.pathname.includes('search-results.html')) {
  const term = localStorage.getItem('searchTerm');
  console.log('Search Term:', term);

  if (term) {
    fetch(`../php/search.php?search=${encodeURIComponent(term)}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
          resultsDiv.innerHTML = '';

          if (data.message) {
            resultsDiv.innerHTML = `<p>${data.message}</p>`;
          } else {
            displayResults(data);
          }
        }
      });
  } else {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
      resultsDiv.innerHTML = '<p>No search term provided.</p>';
    }
  }
}

function displayResults(questions) {
  // Support both array and object with questions/data property
  if (!Array.isArray(questions)) {
    questions = questions.questions || questions.data || [];
  }
  const results = document.getElementById('results');
  results.innerHTML = '';
  if (!questions.length) {
    results.innerHTML = '<li>No results found.</li>';
    return;
  }
  questions.forEach(q => {
    const li = document.createElement('li');
    li.className = 'question-item';
    li.innerHTML = `
      <h3><a href="question.html?id=${q.id}">${q.title}</a></h3>
      <div class="question-meta">
        <span>${q.answer_count} answers</span>
        <span>${q.comment_count} comments</span>
        <span>Posted on ${formatDate(q.created_at)}</span>
      </div>
      <p class="description">${q.description}</p>
    `;
    results.appendChild(li);
  });
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (isNaN(date)) return "Unknown date";
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
