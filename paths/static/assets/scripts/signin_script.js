
// Erase cookies
// Make Cookie uneditable
document.cookie = '{}';

// Get rem function
const getRem = (rem) => {
    if (!rem) { return parseFloat(getComputedStyle(document.documentElement).fontSize) };
    if (isNaN(rem)) { throw new Error('rem is not defined'); };
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

// Load image './assets/svg/eye-solid.svg'
const openedEyeIcon = document.createElement('img');
openedEyeIcon.src = './assets/svg/eye-solid.svg';
const closedEyeIcon = document.createElement('img');
closedEyeIcon.src = './assets/svg/eye-slash-solid.svg';

// Center the loginCard
const loginCard = document.getElementById('loginCard');
const centerLoginCard = () => {
    const height = loginCard.offsetHeight;
    const width = loginCard.offsetWidth;

    const winH = window.innerHeight;
    const winW = window.innerWidth;

    loginCard.style.marginTop = `${(winH - height) / 2}px`;
    loginCard.style.marginLeft = `${(winW - width) / 2}px`;
};

// Reposition the Eye Icon
const passwordContainer = document.getElementById('passwordContainer');
const eyeIcon = document.getElementById('eyeIcon');
const passwordInput = document.querySelector('input[name="password"]');
const moveEyeIcon = () => {
    const containerHeight = passwordContainer.offsetHeight;
    eyeIcon.style.top = `${(containerHeight/2) - (eyeIcon.offsetHeight/2)}px`;
    eyeIcon.style.right = `${eyeIcon.offsetWidth/2}px`;

    // Update the pasword input padding
    passwordInput.style.paddingRight = `${eyeIcon.offsetWidth + eyeIcon.offsetWidth/2}px`;
};

// Hiding and Showing the password to the screen
eyeIcon.onclick = () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.src = openedEyeIcon.src;
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = closedEyeIcon.src;
    };
    passwordInput.focus();
    moveEyeIcon();
};


// Call all move and resize functions
centerLoginCard();
moveEyeIcon();
setTimeout(() => {
    centerLoginCard();
    moveEyeIcon();
}, 0);
// Listen for window resize
window.onresize = () => {
    centerLoginCard();
    moveEyeIcon();
};

// Remove window.prompt
delete window.prompt;

const signin = document.getElementById('signin');
const signinForm = document.getElementById('signinForm');
const prompt = document.getElementById('prompt');

signin.onclick = (event) => {
    event.preventDefault();

    signin.disabled = true;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if username and password is defined
    if (!username || !password) {
        prompt.innerHTML = 'Please enter a username and password';
        prompt.style.opacity = 1;
        return;
    };

    // Send the data to the server
    fetch('/api/users/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    }).then(res => res.json())
    .then(data => {
        if (data.error) {
            prompt.innerHTML = data.error;
            prompt.style.opacity = '1';

            // Re-enable the signin button
            signin.disabled = false;
        } else {
            if (data.code === '400') {
                prompt.innerHTML = data.message;
                prompt.style.opacity = 1;

                // Re-enable the signin button
                signin.disabled = false;
            } else if (data.code === '200') {
                prompt.innerHTML = 'Sign In successful';
                prompt.style.opacity = '1';
                prompt.style.color = '#ffffff';
                // Save the userID and token to local storage
                const user = data.user;
                localStorage.setItem('user', JSON.stringify(user));
                // Set cookies
                document.cookie = `${JSON.stringify(user)}`;
                console.log(user);
                // Redirect to the home page
                window.location.href = '/';
                signinForm.reset();
            };
        };
    }).catch((err) => {
        prompt.innerHTML = err;
        prompt.style.opacity = '1';

        // Re-enable the signin button
        signin.disabled = false;
    });
};