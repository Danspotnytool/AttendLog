
// Get the port
const port = location.port;



const sidePanel = document.getElementById('sidePanel');
const signOutButton = document.getElementById('signOutButton');
const mainPanel = document.getElementById('mainPanel');
const menuButton = document.getElementById('menuButton');
const menuButtonBarIcons = [];
const header = document.getElementById('header');
const formsBackground = document.getElementById('formsBackground');
const createClass = document.getElementById('createClass');
const createClassForm = document.getElementById('createClassForm');
const createClassButton = document.getElementById('createClassButton');
const joinClass = document.getElementById('joinClass');
const joinClassForm = document.getElementById('joinClassForm');
const joinClassButton = document.getElementById('joinClassButton');

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
        return;
    };

    if (window.innerWidth <= 795) {
        mainPanel.style.width = '100%';
        return;
    };
    mainPanel.style.width = `${window.innerWidth - sidePanel.offsetWidth}px`;
};

// Displaying the side panel
const displaySidePanel =  async () => {
    // Get the sidePanel display attribute
    const displayAttribute = sidePanel.getAttribute('display');
    if (displayAttribute === 'true') {
        sidePanel.setAttribute('display', 'false');
        sidePanel.style.marginLeft = `-${sidePanel.offsetWidth}px`;
        menuButton.style.right = `-${menuButton.offsetWidth}px`;

        header.style.marginLeft = '0';
        header.style.paddingLeft = `${menuButton.offsetWidth + (header.offsetWidth * 0.02)}px`;

        menuButtonBarIcons.forEach((child) => {
            child.setAttribute('stroke', 'black');
        });
    } else {
        sidePanel.setAttribute('display', 'true');
        sidePanel.style.marginLeft = '0px';
        menuButton.style.right = '0px';

        header.style.marginLeft = '0px';
        header.style.paddingLeft = '2%';

        menuButtonBarIcons.forEach((child) => {
            child.setAttribute('stroke', 'white');
        });
    };
    resizeMainPanel();
};
menuButton.onclick = () => { displaySidePanel(); };


signOutButton.onclick = () => {
    localStorage.removeItem('user');
    document.cookie = '{}';
    window.location.href = './signin';
};


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



// Displaying the Create Class form
const displayCreateClassForm = async () => {
    createClassForm.style.top = '5%';
    createClassForm.style.transform = 'scale(100%)';
    formsBackground.style.display = 'block';
};
createClass.onclick = () => { displayCreateClassForm(); };

// Display the Join Class form
const displayJoinClassForm = async () => {
    joinClassForm.style.top = '5%';
    joinClassForm.style.transform = 'scale(100%)';
    formsBackground.style.display = 'block';
};
joinClass.onclick = () => { displayJoinClassForm(); };

// Hide the forms
const hideForms = async () => {
    createClassForm.style.top = '-100%';
    createClassForm.style.transform = 'scale(0%)';
    joinClassForm.style.top = '-100%';
    joinClassForm.style.transform = 'scale(0%)';
    formsBackground.style.display = 'none';

    // Clear all form fields
    Array.from(document.getElementsByTagName('form')).forEach((form) => {
        form.reset();
    });
};
formsBackground.onclick = () => { hideForms(); };
Array.from(document.getElementsByClassName('closeFormIcon')).forEach((element) => {
    element.onclick = () => { hideForms(); };
});
Array.from(document.getElementsByClassName('cancel')).forEach((element) => {
    element.onclick = () => { hideForms(); };
});



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


// Get user's classes
const getUserClasses = async () => {
    // Errase the classes
    const classContainer = document.getElementById('classContainer');
    if (classContainer.children.length > 0) {
        while (classContainer.firstChild) {
            classContainer.removeChild(classContainer.firstChild);
        };
    };

    fetch('/api/classes/get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(data => {
        if (data.code === '400') {
            return console.log(data.message);
        } else {
            const classes = Array.from(data);
            const classContainer = document.getElementById('classContainer');
            classes.forEach((classData) => {
                const classCard = document.createElement('div');
                classCard.className = 'classCard';
                classCard.style.backgroundColor = `${classData.classColor}`;

                // Check if the class color is dark or light
                const color = classData.classColor;
                let r = parseInt(color.substring(1, 3), 16);
                let g = parseInt(color.substring(3, 5), 16);
                let b = parseInt(color.substring(5, 7), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;

                const titleCard = document.createElement('div');
                if (brightness < 125) {
                    titleCard.style.color = 'white';
                    const newR = Math.round(r * 0.8).toString(16);
                    const newG = Math.round(g * 0.8).toString(16);
                    const newB = Math.round(b * 0.8).toString(16);
                    const newColor = `#${newR}${newG}${newB}`;
                    classCard.style.backgroundColor = `${newColor}`;
                } else {
                    titleCard.style.color = 'black';
                    const newR = Math.round(r * 1.2).toString(16);
                    const newG = Math.round(g * 1.2).toString(16);
                    const newB = Math.round(b * 1.2).toString(16);
                    const newColor = `#${newR}${newG}${newB}`;
                    classCard.style.backgroundColor = `${newColor}`;
                };
                titleCard.className = 'titleCard';

                classCard.appendChild(titleCard);

                const title = document.createElement('h3');
                title.innerHTML = `${classData.className}`;
                titleCard.appendChild(title);

                const infoCard = document.createElement('div');
                infoCard.className = 'infoCard';
                titleCard.appendChild(infoCard);

                const teacherName = document.createElement('h4');
                teacherName.innerText = `${classData.teacherName}`;
                infoCard.appendChild(teacherName);

                const studentsNumber = document.createElement('h4');
                studentsNumber.innerText = `${classData.numberOfStudents || 0}`;
                infoCard.appendChild(studentsNumber);

                const description = document.createElement('p');
                description.className = 'description';
                description.innerText = `${classData.classDescription}`;
                if (brightness < 125) {
                    description.style.color = 'white';
                } else {
                    description.style.color = 'black';
                };
                classCard.appendChild(description);


                classContainer.appendChild(classCard);
            });
        };
    }).catch((err) => {
        console.log(err);
    });
};
getUserClasses();



// Creating the class
createClassButton.onclick = async (event) => {
    event.preventDefault();
    createClassButton.disabled = true;

    // Get the form data
    const formData = new FormData(createClassForm);
    const className = formData.get('className');
    const classColor = formData.get('classColor');
    const classDescription = formData.get('classDescription');
    
    // Create the class
    fetch('/api/classes/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            className: className,
            classColor: classColor,
            classDescription: classDescription
        })
    }).then(response => response.json())
    .then(data => {
        if (data.code === '400') {
            return console.log(data.message);
        } else {
            getUserClasses();
            formsBackground.click();
            createClassForm.reset();
        };
    }).catch(err => {
        console.log(err);
    });
};


// Join Class
joinClassButton.onclick = async (event) => {
    event.preventDefault();
    joinClassButton.disabled = true;

    // Get the form data
    const formData = new FormData(joinClassForm);
    const classID = formData.get('classID');
    const classToken = formData.get('classToken');

    // Join the class
    fetch('/api/classes/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            classID: classID,
            classToken: classToken
        })
    }).then(response => response.json())
    .then(data => {
        if (data.code === '400') {
            // If the class is not found
        } else {
            getUserClasses();
            formsBackground.click();
            joinClassForm.reset();
            // Click the forms background to close the forms
            formsBackground.click();
        };
    }).catch(err => {
        console.log(err);
    });
};



// Connect to Socket.IO server
if (window.location.origin != 'http://127.0.0.1:5500') {
    const socket = io();

    socket.on('connect', () => {
        console.log(`Connected to the server as: ${socket.id}`);
    });
    socket.on('disconnect', () => {
        console.log('Disconnected from the server');
    });
    socket.on('error', (error) => {
        socket.destroy();
    });
};