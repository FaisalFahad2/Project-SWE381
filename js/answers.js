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
                    <div class="rating">
                        <button class="upvote" data-answer-id="${answer.id}">↑</button>
                        <span class="rating-value">${answer.rating || 0}</span>
                        <button class="downvote" data-answer-id="${answer.id}">↓</button>
                    </div>
                    <div class="answer-actions">
                        ${answer.is_owner ? `
                            <button onclick="editAnswer(${answer.id}, '${answer.username}')" class="edit-btn">Edit</button>
                            <button onclick="deleteAnswer(${answer.id})" class="delete-btn">Delete</button>
                        ` : ''}
                        <button class="comment-btn" data-answer-id="${answer.id}">Add Comment</button>
                    </div>
                    <div class="comments">
                        ${answer.comments ? answer.comments.map(comment => `
                            <div class="comment" id="comment-${comment.id}">
                                <p>${comment.content}</p>
                                <small>- ${comment.username}</small>
                                ${comment.is_owner ? `
                                    <div class="comment-actions">
                                        <button onclick="editComment(${comment.id}, '${comment.content}', '${comment.username}')" class="edit-btn">Edit</button>
                                        <button onclick="deleteComment(${comment.id})" class="delete-btn">Delete</button>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('') : ''}
                    </div>
                `;
                container.appendChild(answerDiv);
            });
            
            // Reattach vote handlers after loading answers
            attachVoteHandlers();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('answersContainer').innerHTML = 
                '<p>Error loading answers. Please try again later.</p>';
        });
}

// Make these functions globally available
window.editAnswer = function(answerId, username) {
    const answerDiv = event.target.closest('.answer');
    const contentDiv = answerDiv.querySelector('.answer-content p');
    const currentContent = contentDiv.textContent;

    // Create edit form
    contentDiv.innerHTML = `
        <textarea class="edit-textarea" style="width: 100%; min-height: 100px; margin-bottom: 10px;">${currentContent}</textarea>
        <div class="edit-buttons">
            <button onclick="saveAnswer(${answerId}, '${username}')" class="save-btn">Save</button>
            <button onclick="cancelEdit(${answerId}, '${currentContent}', '${username}')" class="cancel-btn">Cancel</button>
        </div>
    `;
};

window.saveAnswer = function(answerId, username) {
    const answerDiv = event.target.closest('.answer');
    const newContent = answerDiv.querySelector('.edit-textarea').value;

    console.log('Saving answer:', { answerId, newContent }); // Debug log

    fetch('../php/edit-answer.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${answerId}&content=${encodeURIComponent(newContent)}`
    })
    .then(response => {
        console.log('Response status:', response.status); // Debug log
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data); // Debug log
        if (data.success === true) {
            // Get the question ID from the URL
            const questionId = new URLSearchParams(window.location.search).get('id');
            console.log('Reloading answers for question:', questionId); // Debug log
            if (questionId) {
                // Reload all answers to show updated content
                loadAnswers(questionId);
            }
        } else {
            alert('Error updating answer: ' + (data.error || 'Unknown error'));
            // Restore the original content on error
            const contentDiv = answerDiv.querySelector('.answer-content p');
            contentDiv.innerHTML = contentDiv.querySelector('.edit-textarea').value;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating answer. Please try again.');
        // Restore the original content on error
        const contentDiv = answerDiv.querySelector('.answer-content p');
        contentDiv.innerHTML = contentDiv.querySelector('.edit-textarea').value;
    });
};

window.cancelEdit = function(answerId, originalContent, username) {
    const answerDiv = event.target.closest('.answer');
    const contentDiv = answerDiv.querySelector('.answer-content p');
    contentDiv.innerHTML = originalContent;
};

// Comment editing functions
window.editComment = function(commentId, currentContent, username) {
    const commentDiv = document.getElementById(`comment-${commentId}`);
    const contentP = commentDiv.querySelector('p');
    
    // Create edit form
    contentP.innerHTML = `
        <textarea class="edit-textarea" style="width: 100%; min-height: 60px; margin-bottom: 10px;">${currentContent}</textarea>
        <div class="edit-buttons">
            <button onclick="saveComment(${commentId}, '${username}')" class="save-btn">Save</button>
            <button onclick="cancelCommentEdit(${commentId}, '${currentContent}')" class="cancel-btn">Cancel</button>
        </div>
    `;
};

window.saveComment = function(commentId, username) {
    const commentDiv = document.getElementById(`comment-${commentId}`);
    const newContent = commentDiv.querySelector('.edit-textarea').value;

    console.log('Saving comment:', { commentId, newContent }); // Debug log

    fetch('../php/edit-comment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${commentId}&content=${encodeURIComponent(newContent)}`
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response status:', response.status); // Debug log
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data); // Debug log
        if (data.success === true) {
            // Get the question ID from the URL
            const questionId = new URLSearchParams(window.location.search).get('id');
            console.log('Reloading answers for question:', questionId); // Debug log
            if (questionId) {
                // Reload all answers to show updated content
                loadAnswers(questionId);
            }
        } else {
            alert('Error updating comment: ' + (data.error || 'Unknown error'));
            // Restore the original content on error
            const contentP = commentDiv.querySelector('p');
            contentP.innerHTML = contentP.querySelector('.edit-textarea').value;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating comment. Please try again.');
        // Restore the original content on error
        const contentP = commentDiv.querySelector('p');
        contentP.innerHTML = contentP.querySelector('.edit-textarea').value;
    });
};

window.cancelCommentEdit = function(commentId, originalContent) {
    const commentDiv = document.getElementById(`comment-${commentId}`);
    const contentP = commentDiv.querySelector('p');
    contentP.innerHTML = originalContent;
};

window.deleteComment = function(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    fetch('../php/delete-comment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${commentId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success === true) {
            // Get the question ID from the URL
            const questionId = new URLSearchParams(window.location.search).get('id');
            if (questionId) {
                // Reload all answers to show updated content
                loadAnswers(questionId);
            }
        } else {
            alert('Error deleting comment: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting comment. Please try again.');
    });
};

// Add these new functions for question comments
window.editQuestionComment = function(commentId, currentContent, username) {
    const commentDiv = document.getElementById(`question-comment-${commentId}`);
    const contentP = commentDiv.querySelector('p');
    
    // Create edit form
    contentP.innerHTML = `
        <textarea class="edit-textarea" style="width: 100%; min-height: 60px; margin-bottom: 10px;">${currentContent}</textarea>
        <div class="edit-buttons">
            <button onclick="saveQuestionComment(${commentId}, '${username}')" class="save-btn">Save</button>
            <button onclick="cancelQuestionCommentEdit(${commentId}, '${currentContent}')" class="cancel-btn">Cancel</button>
        </div>
    `;
};

window.saveQuestionComment = function(commentId, username) {
    const commentDiv = document.getElementById(`question-comment-${commentId}`);
    const newContent = commentDiv.querySelector('.edit-textarea').value;

    fetch('../php/edit-comment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${commentId}&content=${encodeURIComponent(newContent)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success === true) {
            // Get the question ID from the URL
            const questionId = new URLSearchParams(window.location.search).get('id');
            if (questionId) {
                // Reload the page to show updated content
                window.location.reload();
            }
        } else {
            alert('Error updating comment: ' + (data.error || 'Unknown error'));
            // Restore the original content on error
            const contentP = commentDiv.querySelector('p');
            contentP.innerHTML = contentP.querySelector('.edit-textarea').value;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating comment. Please try again.');
        // Restore the original content on error
        const contentP = commentDiv.querySelector('p');
        contentP.innerHTML = contentP.querySelector('.edit-textarea').value;
    });
};

window.cancelQuestionCommentEdit = function(commentId, originalContent) {
    const commentDiv = document.getElementById(`question-comment-${commentId}`);
    const contentP = commentDiv.querySelector('p');
    contentP.innerHTML = originalContent;
};

window.deleteQuestionComment = function(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    fetch('../php/delete-comment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${commentId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success === true) {
            // Get the question ID from the URL
            const questionId = new URLSearchParams(window.location.search).get('id');
            if (questionId) {
                // Reload the page to show updated content
                window.location.reload();
            }
        } else {
            alert('Error deleting comment: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting comment. Please try again.');
    });
};

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
}); 