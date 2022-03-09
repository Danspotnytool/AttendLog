
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
const menuButtonBarIcons = [];
const header = document.getElementById('header');

// Load the menuButton svg
fetch('./assets/svg/menu-icon.svg')
    .then(response => response.text())
    .then(data => {
        // convert into svg element
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'image/svg+xml');
        const svg = xml.documentElement;
        // Check if there's a script tag then remove it
        const script = svg.querySelector('script');
        if (script) {
            svg.removeChild(script);
        };

        // Get all the children of the svg element
        const children = Array.from(svg.children);
        // Get all child that has a white stroke
        const menuBarIcon = children.filter((child) => {
            return child.getAttribute('stroke') === 'white';
        });
        menuBarIcon.forEach((child) => {
            menuButtonBarIcons.push(child);
        });
        menuButton.appendChild(svg);


        const displayAttribute = sidePanel.getAttribute('display');
        if (displayAttribute === 'true') {
            menuButtonBarIcons.forEach((child) => {
                child.setAttribute('stroke', 'white');
            });
        } else {
            menuButtonBarIcons.forEach((child) => {
                child.setAttribute('stroke', 'black');
            });
        };
    });


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
        menuButton.style.backgroundColor = '#ffffff';

        header.style.marginLeft = `${menuButton.offsetWidth}px`;

        menuButtonBarIcons.forEach((child) => {
            child.setAttribute('stroke', 'black');
        });
    } else {
        sidePanel.setAttribute('display', 'true');
        sidePanel.style.marginLeft = '0px';
        menuButton.style.right = '0px';
        menuButton.style.backgroundColor = '#01284D';

        header.style.marginLeft = '0px';

        menuButtonBarIcons.forEach((child) => {
            child.setAttribute('stroke', 'white');
        });
    };
    resizeMainPanel();
};
menuButton.onclick = () => { displaySidePanel(); };



const onloadFunction = () => {  
    if (window.innerWidth <= 795) {
        // Get the sidePanel display attribute
        const displayAttribute = sidePanel.getAttribute('display');
        if (displayAttribute === 'true') {
            menuButton.style.backgroundColor = '#01284D';
        } else {
            menuButton.style.backgroundColor = '#ffffff';
        };
    };
};
onloadFunction();
window.onload = async () => {
    onloadFunction();
};
resizeMainPanel();
window.onresize =  async () => {
    resizeMainPanel();
};


// Updating the Date and time
const date = document.getElementById('date');
const time = document.getElementById('time');

// Update the date
const updateDate = async () => {
    const dateNow = new Date();
    const months = [
        'January', 'February',
        'March', 'April',
        'May', 'June',
        'July', 'August',
        'September', 'October',
        'November', 'December'
    ];
    const month = months[dateNow.getMonth()];
    const dateString = `${month} ${dateNow.getDate()}, ${dateNow.getFullYear()}`;
    date.innerHTML = `${dateString}`;
};
updateDate();

// Updating the time
const updateTime = async () => {
    // 12 hour clock
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour = hours % 12;
    const hourString = hour < 10 ? `0${hour}` : hour;
    const minuteString = minutes < 10 ? `0${minutes}` : minutes;
    const secondString = seconds < 10 ? `0${seconds}` : seconds;
    time.innerHTML = `${hourString}:${minuteString}:${secondString} ${ampm}`;

    if (hourString === '00' && minuteString === '00') {
        updateDate();
    };
};
updateTime();
setInterval(() => {
    updateTime();
}, 1000);