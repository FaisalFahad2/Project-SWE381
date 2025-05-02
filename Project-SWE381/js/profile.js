document.addEventListener('DOMContentLoaded', function() {
    // Fetch profile data
    fetch('../php/get-profile.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('username').textContent = data.data.username;
                document.getElementById('firstname').textContent = data.data.firstname;
                document.getElementById('lastname').textContent = data.data.lastname;
                document.getElementById('email').textContent = data.data.email;
                document.getElementById('phone').textContent = data.data.phone;
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = 'login.html';
        });
});

function logout() {
    fetch('../php/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = 'login.html';
        });
}