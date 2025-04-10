
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
