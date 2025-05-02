document.addEventListener('DOMContentLoaded', function() {
  const answersContainer = document.getElementById('answersContainer');
  const questionIdInput = document.getElementById('questionId');

  const urlParams = new URLSearchParams(window.location.search);
  const questionId = urlParams.get('id');

  if (!questionId) {
      console.error('No question ID found in URL.');
      answersContainer.innerHTML = "<p>No question selected.</p>";
      return;
  }

  questionIdInput.value = questionId;
  fetch(`../php/question.php?question_id=${questionId}`)
      .then(response => response.text())
      .then(data => {
          answersContainer.innerHTML = data;
          attachVoteHandlers(); // 🔥 أضف هذا بعد تحميل الإجابات
      })
      .catch(error => {
          console.error('Error fetching answers:', error);
      });
});

// دالة جديدة لربط أزرار التصويت
function attachVoteHandlers() {
  const upvoteButtons = document.querySelectorAll('.up');
  const downvoteButtons = document.querySelectorAll('.down');

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