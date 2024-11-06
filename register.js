const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value.trim();

    if (username) {
        localStorage.setItem('userName', username); // Store username in local storage
        window.location.href = 'home.html'; // Redirect to World Explorer page
    }
});
