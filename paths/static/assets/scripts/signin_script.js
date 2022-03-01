
// Load image './assets/svg/eye-solid.svg'
const openedEyeIcon = document.createElement('img');
openedEyeIcon.src = './assets/svg/eye-solid.svg';
const closedEyeIcon = document.createElement('img');
closedEyeIcon.src = './assets/svg/eye-slash-solid.svg';

const loginCard = document.getElementById('loginCard');
const centerLoginCard = () => {
    const height = loginCard.offsetHeight;
    const width = loginCard.offsetWidth;

    const winH = window.innerHeight;
    const winW = window.innerWidth;

    loginCard.style.marginTop = `${(winH - height) / 2}px`;
    loginCard.style.marginLeft = `${(winW - width) / 2}px`;
};
centerLoginCard();

const passwordContainer = document.getElementById('passwordContainer');
const eyeIcon = document.getElementById('eyeIcon');
const passwordInput = document.querySelector('input[name="password"]');
const resizeEyeIcon = () => {
    const height = passwordContainer.offsetHeight;
    passwordInput.style.width = `${passwordContainer.offsetWidth - height}px`;
    eyeIcon.style.height = `${height/2}px`;
    eyeIcon.style.marginTop = `${height/4}px`;
    eyeIcon.style.marginLeft = `${height/4}px`;
};
resizeEyeIcon();

eyeIcon.onclick = () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.src = openedEyeIcon.src;
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = closedEyeIcon.src;
    };
    passwordInput.focus();
    resizeEyeIcon();
};

window.onresize = () => {
    centerLoginCard();
    resizeEyeIcon();
};