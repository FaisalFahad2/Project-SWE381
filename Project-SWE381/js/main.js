window.addEventListener("load", () => {
  // الحصول على كل أزرار التصويت
  const upvoteButtons = document.querySelectorAll('.upvote');
  const downvoteButtons = document.querySelectorAll('.downvote');

  // إضافة أحداث التصويت للأزرار
  upvoteButtons.forEach(button => {
      button.addEventListener('click', function() {
          const answerId = this.getAttribute('data-answer-id');
          updateVote(answerId, 'upvote');
      });
  });

  downvoteButtons.forEach(button => {
      button.addEventListener('click', function() {
          const answerId = this.getAttribute('data-answer-id');
          updateVote(answerId, 'downvote');
      });
  });

  // دالة لتحديث التصويت في الخادم
  function updateVote(answerId, voteType) {
      // تحديد العنصر الذي يحتوي على القيمة الحالية للتصويت
      const ratingElement = document.querySelector(`[data-answer-id="${answerId}"]`).closest('.answer').querySelector('.rating-value');
      let currentRating = parseInt(ratingElement.textContent);

      // تعديل التصويت محليًا قبل إرسال الطلب (لتحسين التجربة)
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
});

  const commentBtn = document.getElementById("commentBtn");
  const commentModal = document.getElementById("commentModal");

  commentBtn.addEventListener("click", () => {
    commentModal.style.display = "flex";
  });

    
  const answerBtn = document.getElementById("addAnswerBtn");
  const answerModal = document.getElementById("answerModal");

  answerBtn.addEventListener("click", () => {
    answerModal.style.display = "flex";
  });


  document.addEventListener('click' , (e) => {
    if(e.target.className === "close"){
      e.target.parentElement.parentElement.style.display = "none";
    }
  })


  

  function loadAnswers(questionId) {
    const formData = new FormData();
    formData.append("question_id", questionId);

    fetch("../php/get-answers-comments.php", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("answersContainer");
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
    });
  }

  function checkSession() {
    fetch('../php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                window.location.href = 'login.html';
            }
        })
        .catch(() => {
            window.location.href = 'login.html';
        });
}

// Check session when page loads
document.addEventListener('DOMContentLoaded', checkSession);