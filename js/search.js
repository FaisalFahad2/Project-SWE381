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
        }
      });
  } else {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
      resultsDiv.innerHTML = '<p>No search term provided.</p>';
    }
  }
}
