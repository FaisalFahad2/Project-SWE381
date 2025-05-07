document.addEventListener('DOMContentLoaded', function() {
    const answerForm = document.getElementById('answerForm');
    const commentForm = document.getElementById('commentForm');
    const answerModal = document.getElementById('answerModal');
    const commentModal = document.getElementById('commentModal');
    const questionId = new URLSearchParams(window.location.search).get('id');

    // Set question ID in forms
    if (questionId) {
        document.getElementById('questionId').value = questionId;
        document.getElementById('commentQuestionId').value = questionId;
        loadAnswers(questionId);
    }

    // Handle answer submission
    answerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const content = document.getElementById('answerContent').value;
        
        const formData = new FormData();
        formData.append('question_id', questionId);
        formData.append('content', content);

        fetch('../php/submit-answer.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                answerModal.style.display = 'none';
                answerForm.reset();
                loadAnswers(questionId);
            } else {
                alert(data.error || 'Failed to submit answer');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit answer');
        });
    });

    // Handle comment submission
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const content = document.getElementById('commentContent').value;
        
        const formData = new FormData();
        formData.append('question_id', questionId);
        formData.append('content', content);

        fetch('../php/submit-comment.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                commentModal.style.display = 'none';
                commentForm.reset();
                loadAnswers(questionId);
            } else {
                alert(data.error || 'Failed to submit comment');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit comment');
        });
    });

    // Function to load answers and comments
    function loadAnswers(questionId) {
        fetch(`../php/get-answers.php?question_id=${questionId}`)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('answersContainer');
                container.innerHTML = '';

                if (data.length === 0) {
                    container.innerHTML = '<p>No answers yet. Be the first to answer!</p>';
                    return;
                }

                data.forEach(answer => {
                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'answer';
                    answerDiv.innerHTML = `
                        <div class="answer-content">
                            <p>${answer.content}</p>
                            <small>Answered by: ${answer.username} on ${new Date(answer.created_at).toLocaleDateString()}</small>
                        </div>
                        <div class="answer-actions">
                            ${answer.is_owner ? `
                                <button onclick="editAnswer(${answer.id})" class="edit-btn">Edit</button>
                                <button onclick="deleteAnswer(${answer.id})" class="delete-btn">Delete</button>
                            ` : ''}
                            <button class="comment-btn" data-answer-id="${answer.id}">Add Comment</button>
                        </div>
                        <div class="comments">
                            ${answer.comments ? answer.comments.map(comment => `
                                <div class="comment">
                                    <p>${comment.content}</p>
                                    <small>- ${comment.username}</small>
                                </div>
                            `).join('') : ''}
                        </div>
                    `;
                    container.appendChild(answerDiv);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('answersContainer').innerHTML = 
                    '<p>Error loading answers. Please try again later.</p>';
            });
    }
}); 