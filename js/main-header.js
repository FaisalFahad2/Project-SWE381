document.addEventListener('DOMContentLoaded', function() {
  fetch('../php/check_session.php')
    .then(response => response.json())
    .then(data => {
      const userLink = document.getElementById('userLink');
      if (data.logged_in) {
        if (userLink) {
          userLink.href = '../php/profile.php';
          userLink.textContent = 'Profile';
        }
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });
}); 