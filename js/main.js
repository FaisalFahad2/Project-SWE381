window.addEventListener("load", () => {
  console.log('Main.js loaded');
  
  // دالة لتحديث التصويت في الخادم
  function updateVote(answerId, voteType) {
      const ratingElement = document.querySelector(`[data-answer-id="${answerId}"]`)?.closest('.answer')?.querySelector('.rating-value');
      if (!ratingElement) {
          console.error('Rating element not found');
          return;
      }

      let currentRating = parseInt(ratingElement.textContent);
      ratingElement.textContent = currentRating + (voteType === 'upvote' ? 1 : -1);

      // إرسال التصويت إلى الخادم
      fetch('../php/vote.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `answer_id=${answerId}&vote_type=${voteType}`
      })
      .then(response => response.text())
      .then(data => {
          if (data !== 'Vote updated successfully') {
              alert('Error: ' + data);  // في حالة حدوث خطأ
              // إعادة القيمة الأصلية في حالة حدوث خطأ
              ratingElement.textContent = currentRating;
          }
      })
      .catch(error => {
          console.error('Error:', error);
          // إعادة القيمة الأصلية في حالة حدوث خطأ
          ratingElement.textContent = currentRating;
      });
  }

  // Add event listeners for comment and answer buttons
  const commentBtn = document.getElementById("commentBtn");
  const commentModal = document.getElementById("commentModal");
  const answerBtn = document.getElementById("addAnswerBtn");
  const answerModal = document.getElementById("answerModal");

  console.log('Checking buttons:', {
    commentBtn: commentBtn,
    commentModal: commentModal,
    answerBtn: answerBtn,
    answerModal: answerModal
  });

  if (commentBtn && commentModal) {
    commentBtn.addEventListener("click", () => {
      commentModal.style.display = "flex";
    });
  }

  if (answerBtn && answerModal) {
    answerBtn.addEventListener("click", () => {
      answerModal.style.display = "flex";
    });
  }

  document.addEventListener('click' , (e) => {
    if(e.target.className === "close"){
      e.target.parentElement.parentElement.style.display = "none";
    }
  })
});

function loadAnswers(questionId) {
  console.log('Loading answers for question:', questionId);
  const formData = new FormData();
  formData.append("question_id", questionId);

  fetch("../php/get-answers-comments.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    console.log('Answers data:', data);
    const container = document.getElementById("answersContainer");
    if (!container) {
      console.error('Answers container not found');
      return;
    }
    
    container.innerHTML = "";

    data.answers.forEach(answer => {
      const answerDiv = document.createElement("div");
      answerDiv.className = "answer";
      answerDiv.innerHTML = `
        <p><strong>${answer.user}:</strong> ${answer.content}</p>
        <button class="open-comment-modal" data-answer-id="${answer.id}">Add Comment</button>
        <div class="comments">
          ${answer.comments.map(comment => `<p><em>${comment.user}: ${comment.content}</em></p>`).join("")}
        </div>
      `;
      container.appendChild(answerDiv);
    });
  })
  .catch(error => {
    console.error('Error loading answers:', error);
  });
}

