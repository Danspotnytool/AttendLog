
// Erase cookies
// Make Cookie uneditable
document.cookie = '{}';

// Get rem function
/**
 * @param {number} rem
 */
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



const welcomeCard = document.getElementById('welcomeCard');
const signinCard = document.getElementById('signinCard');
const passwordContainer = document.getElementById('passwordContainer');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');



// Resize welcome card
const resizeWelcomeCard = () => {
    welcomeCard.style.width = `${signinCard.offsetLeft}px`;
};

// Move eye icon
const moveEyeIcon = () => {
    eyeIcon.style.display = 'block';
    eyeIcon.style.top = `${(passwordContainer.offsetHeight / 2) - (eyeIcon.offsetHeight / 2)}px`;
    eyeIcon.style.right = `${getRem(1)}px`;
};



// Display password
eyeIcon.onclick = () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.src = openedEyeIcon.src;
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = closedEyeIcon.src;
    };
};



window.onload = () => {
    resizeWelcomeCard();
    moveEyeIcon();
};
window.onresize = () => {
    resizeWelcomeCard();
    moveEyeIcon();
};



// Remove window.prompt
delete window.prompt;


const signinForm = document.getElementById('signinForm');
const signin = document.getElementById('signin');
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
        return signin.disabled = false;
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