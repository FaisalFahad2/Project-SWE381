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
const ratingElement = button.closest('.answer').querySelector('.rating-value');
let currentRating = parseInt(ratingElement.textContent);

fetch('../php/vote.php', {
method: 'POST',
headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
},
body: `answer_id=${answerId}&vote_type=${voteType}`
})
.then(response => response.json()) // 👈 نتوقع JSON بدل النص العادي
.then(data => {
if (data.status === 'success') {
    ratingElement.textContent = data.new_rating; // 👈 نحدث التقييم بالقيمة الجديدة من الخادم
} else {
    alert('You have already voted');

    ratingElement.textContent = currentRating;
}
})
.catch(error => {
console.error('Error:', error);
ratingElement.textContent = currentRating;
});
}