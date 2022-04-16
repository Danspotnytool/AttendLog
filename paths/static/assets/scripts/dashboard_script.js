
// Get the port
const port = location.port;



const sidePanel = document.getElementById('sidePanel');
const signOutButton = document.getElementById('signOutButton');
const notificationPanel = document.getElementById('notificationPanel');
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
    window.location.href = `${window.location.origin}/signin`;
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


//  ---------------------- Notification Function  ----------------------
/**
 * @param {object} detail
 * @param {string} detail.type log, error
 * @param {string} detail.header
 * @param {string} detail.body
 * @param {string} detail.footer
 * @param {intiger} detail.timeout
 * @param {string} detail.button
 * @param {function} detail.onclick
 */
const notify = (detail) => {
    const notification = new CustomEvent('notification', {
        detail: detail
    });
    window.dispatchEvent(notification);
};
//  ---------------------- Notification Function  ----------------------


// Checking what page we are on
const checkPage = async () => {
    // Get the pathname
    const pathname = window.location.pathname;
    const headerTitle = document.getElementById('headerTitle');

    const sidePanelLinks = Array.from(document.querySelectorAll('#menuContainer ul li'));

    switch (pathname) {
        case '/dashboard':
            headerTitle.innerHTML = 'Dashboard';

            fetch(`${window.location.origin}/dashboardPanels/classes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((response) => {
                return response.text();
            }).then((data) => {
                const mainContainer = document.getElementById('mainContainer');
                mainContainer.innerHTML = data;

                // Get script tags inside the mainContainer
                const scriptTags = Array.from(document.getElementById('mainContainer').getElementsByTagName('script'));
                scriptTags.forEach((script) => {
                    eval(script.innerHTML);
                });

                document.title = 'Dashboard - AttendLog';

                sidePanelLinks.find(link => link.getAttribute('active') === 'true').setAttribute('active', 'false');
                sidePanelLinks.find(link => link.getAttribute('href') === 'Dashboard').setAttribute('active', 'true');
            });
            break;

        case '/dashboard/classes':
            headerTitle.innerHTML = 'Dashboard';

            fetch(`${window.location.origin}/dashboardPanels/classes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((response) => {
                return response.text();
            }).then((data) => {
                const mainContainer = document.getElementById('mainContainer');
                mainContainer.innerHTML = data;

                // Get script tags inside the mainContainer
                const scriptTags = Array.from(document.getElementById('mainContainer').getElementsByTagName('script'));
                scriptTags.forEach((script) => {
                    eval(script.innerHTML);
                });

                document.title = 'Dashboard - AttendLog';

                sidePanelLinks.find(link => link.getAttribute('active') === 'true').setAttribute('active', 'false');
                sidePanelLinks.find(link => link.getAttribute('href') === 'Dashboard').setAttribute('active', 'true');
            });
            break;

        case '/dashboard/profile':
            // Get the Main Panel Header
            headerTitle.innerHTML = 'Profile';

            fetch(`${window.location.origin}/dashboardPanels/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((response) => {
                return response.text();
            }).then((data) => {
                const mainContainer = document.getElementById('mainContainer');
                mainContainer.innerHTML = data;

                // Get script tags inside the mainContainer
                const scriptTags = Array.from(document.getElementById('mainContainer').getElementsByTagName('script'));
                scriptTags.forEach((script) => {
                    eval(script.innerHTML);
                });

                document.title = 'Profile - AttendLog';

                sidePanelLinks.find(link => link.getAttribute('active') === 'true').setAttribute('active', 'false');
                sidePanelLinks.find(link => link.getAttribute('href') === 'Profile').setAttribute('active', 'true');
            });
            break;

        default:
            break;
    };
};
checkPage();



// Get all side panel links
const sidePanelLinks = Array.from(document.querySelectorAll('#menuContainer ul li'));
sidePanelLinks.forEach((link) => {
    link.onclick = () => {
        // Get its href
        const href = link.getAttribute('href');

        // Push the href to the history
        switch (href.toLowerCase()) {
            case 'dashboard':
                window.history.pushState({}, '', `${window.location.origin}/dashboard/classes`);
                break;

            case 'profile':
                window.history.pushState({}, '', `${window.location.origin}/dashboard/profile`);
                break;

            case 'settings':
                window.history.pushState({}, '', `${window.location.origin}/dashboard/settings`);
                break;

            default:
                break;
        };
        checkPage();
    };
});



// Listen to go back button
window.onpopstate = () => {
    checkPage();
};



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
            formsBackground.click();
            createClassForm.reset();
            // Check if the user is on the dashboard page
            const pathname = window.location.pathname;
            if (pathname === '/dashboard') {
                // Get the script tags inside the mainContainer
                const scriptTags = Array.from(document.getElementById('mainContainer').getElementsByTagName('script'));
                scriptTags.forEach((script) => {
                    eval(script.innerHTML);
                });
            } else {
                // Redirect to the dashboard page
                window.location.href = '/dashboard';
            };
        };
    }).catch(err => {
        createClassButton.disabled = false;
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
            formsBackground.click();
            joinClassForm.reset();
            // Check if the user is on the dashboard page
            const pathname = window.location.pathname;
            if (pathname === '/dashboard') {
                // Get the script tags inside the mainContainer
                const scriptTags = Array.from(document.getElementById('mainContainer').getElementsByTagName('script'));
                scriptTags.forEach((script) => {
                    eval(script.innerHTML);
                });
            } else {
                // Redirect to the dashboard page
                window.location.href = '/dashboard';
            };
        };
    }).catch(err => {
        joinClassButton.disabled = false;
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



// Listen to the event
window.addEventListener('notification', (event) => {
    notificationPanel.style.display = 'block';

    // Create the notification
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.style.marginLeft = '1000rem';
    notification.classList.add(event.detail.type);
    notification.innerHTML = `
        <div class="close">
            <img src="./assets/svg/exit-form-icon copy.svg" alt="Close Notification">
        </div>
        <div class="header">${event.detail.header}</div>
        <div class="body">${event.detail.body}</div>
        <div class="footer">${event.detail.footer}</div>
    `;

    // Check if there's a button
    if (event.detail.button) {
        notification.style.paddingLeft = '7.5rem';

        const button = document.createElement('button');
        button.classList.add('button');
        button.innerHTML = event.detail.button;
        button.onclick = () => {
            event.detail.buttonAction();
        };
        notification.appendChild(button);
    };

    // Append the notification to the notificationPanel
    notificationPanel.appendChild(notification);

    setTimeout(() => {
        notification.style.marginLeft = '0';
    }, 10);

    // Listen to the close button
    notification.querySelector('.close').onclick = () => {
        notification.style.marginLeft = '100rem';
        setTimeout(() => {
            notification.remove();
        }, 500);
    };

    // Add timeout bar
    if (event.detail.timeout) {
        const timeoutBar = document.createElement('div');
        timeoutBar.classList.add('timeoutBar');
        timeoutBar.style.width = '100%';
        timeoutBar.style.height = '5px';
        timeoutBar.style.left = '-100%';
        timeoutBar.style.bottom = '0';
        timeoutBar.style.position = 'absolute';
        timeoutBar.style.transition = 'left 0.5s linear';
        timeoutBar.style.transitionDuration = `${event.detail.timeout / 1000}s`;

        notification.appendChild(timeoutBar);

        // move the timeout bar
        setTimeout(() => {
            timeoutBar.style.left = '0';
        }, 10);

        // Remove the notification after timeout
        setTimeout(() => {
            // Click the close button
            notification.querySelector('.close').click();
        }, event.detail.timeout);
    };
});



notify({
    type: 'log',
    header: 'Welcome to the Dashboard',
    body: 'You can create a class or join a class to log attendance',
    footer: 'Click on the "?" button to learn more about the Dashboard.',
    timeout: 5000,
    button: '<p style="font-size: 3rem;">?</p>',
    buttonAction: () => {
        console.log('Button clicked');
    }
});