
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

// Center the registerCard
const registerCard = document.getElementById('registerCard');
const centerRegisterCard = () => {
    const height = registerCard.offsetHeight;
    const width = registerCard.offsetWidth;

    const winH = window.innerHeight;
    const winW = window.innerWidth;

    registerCard.style.marginTop = `${(winH - height) / 2}px`;
    registerCard.style.marginLeft = `${(winW - width) / 2}px`;
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
setTimeout(() => {
    centerRegisterCard();
    moveEyeIcon();
}, 0);
// Listen for window resize
window.onresize = () => {
    centerRegisterCard();
    moveEyeIcon();
};