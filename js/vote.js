document.addEventListener('DOMContentLoaded', function() {
  // Only attach vote handlers; do not load answers here
  attachVoteHandlers();
});

// دالة جديدة لربط أزرار التصويت
function attachVoteHandlers() {
  const upvoteButtons = document.querySelectorAll('.upvote');
  const downvoteButtons = document.querySelectorAll('.downvote');

  upvoteButtons.forEach(button => {
      button.addEventListener('click', function() {
          const answerId = this.getAttribute('data-answer-id');
          updateVote(answerId, 'up', this);
      });
  });

  downvoteButtons.forEach(button => {
      button.addEventListener('click', function() {
          const answerId = this.getAttribute('data-answer-id');
          updateVote(answerId, 'down', this);
      });
  });
}

function updateVote(answerId, voteType, button) {
  const questionId = new URLSearchParams(window.location.search).get('id');
  fetch('../php/vote.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `answer_id=${answerId}&vote_type=${voteType}`
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      // Reload answers to update UI and active state
      if (typeof loadAnswers === 'function') {
        loadAnswers(questionId);
      }
    } else {
      alert(data.message || 'Vote failed');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}