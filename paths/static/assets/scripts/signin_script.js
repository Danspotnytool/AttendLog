
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

window.onresize = () => {
    centerLoginCard();
};