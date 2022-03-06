
// Get the port
const port = location.port;

// // Connect to WebSocket server
// const socket = io();

// socket.on('connect', () => {
//     console.log(`Connected to the server as: ${socket.id}`);
// });



const sidePanel = document.getElementById('sidePanel');
const mainPanel = document.getElementById('mainPanel');
const menuButton = document.getElementById('menuButton');

// Resize the Main Panel
const resizeMainPanel = async () => {
    mainPanel.style.height = `${sidePanel.offsetHeight}px`;

    // Get the sidePanel display attribute
    const displayAttribute = sidePanel.getAttribute('display');
    if (displayAttribute === 'false') {
        mainPanel.style.height = `${sidePanel.offsetHeight}px`;
        mainPanel.style.width = `${window.innerWidth}px`;
        mainPanel.style.position = 'absolute';
        return;
    };

    if (window.innerWidth <= 795) {
        mainPanel.style.width = '100%';
        mainPanel.style.position = 'absolute';
        mainPanel.style.left = '0px';
        return;
    };
    mainPanel.style.width = `${window.innerWidth - sidePanel.offsetWidth}px`;
    mainPanel.style.position = 'relative';
};

// Displaying the side panel
const displaySidePanel =  async () => {
    // Get the sidePanel display attribute
    const displayAttribute = sidePanel.getAttribute('display');
    if (displayAttribute === 'true') {
        sidePanel.setAttribute('display', 'false');
        sidePanel.style.marginLeft = `-${sidePanel.offsetWidth}px`;
        menuButton.style.right = `-${menuButton.offsetWidth}px`;
    } else {
        sidePanel.setAttribute('display', 'true');
        sidePanel.style.marginLeft = '0px';
        menuButton.style.right = '0px';
    };
    resizeMainPanel();
};
menuButton.onclick = () => { displaySidePanel(); };



if (window.innerWidth <= 795) {
    setTimeout(() => {
        menuButton.click();
    }, 10);
};
resizeMainPanel();
window.onresize =  async () => {
    resizeMainPanel();
};