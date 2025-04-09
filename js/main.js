
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



