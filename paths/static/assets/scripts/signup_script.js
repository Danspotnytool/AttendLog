
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
const signupCard = document.getElementById('signupCard');
const passwordContainer = document.getElementById('passwordContainer');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');



// Resize welcome card
const resizeWelcomeCard = () => {
    welcomeCard.style.width = `${signupCard.offsetLeft}px`;
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


const signup = document.getElementById('signup');
const signupForm = document.getElementById('signupForm');
const prompt = document.getElementById('prompt');

signup.onclick = (event) => {
    event.preventDefault();

    // Disable the signup button
    signup.disabled = true;

    // Get all the values from the form
    const username = document.getElementById('username').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Check if all the fields are filled
    if (!username || !firstName || !lastName || !email || !password) {
        prompt.innerHTML = 'Please fill in all the fields';
        prompt.style.opacity = 1;
        return signup.disabled = false;;
    };
    // Check character lengths of the fields
    if (username.length > 20 || firstName.length > 20 || lastName.length > 20 || email.length > 50 || password.length > 20) {
        prompt.innerHTML = 'Please make sure all the fields are less than 20 characters';
        prompt.style.opacity = 1;
        return signup.disabled = false;;
    };
    if (username.length < 6 || firstName.length < 3 || lastName.length < 4 || email.length < 6 || password.length < 6) {
        prompt.innerHTML = 'Please make sure all the fields have the proper length\n(Username: 6-20 characters\n First Name: 3-20 characters\n Last Name: 4-20 characters\n Email: 6-50 characters\n Password: 6-20 characters)';
        prompt.style.opacity = 1;
        return signup.disabled = false;;
    };
    // Check if the email is valid
    if (!/^[^@]+@[^@.]+\.[a-z]+$/i.test(email)) {
        prompt.innerHTML = 'Please make sure the email is valid';
        prompt.style.opacity = 1;
        return signup.disabled = false;;
    };
    // Check if the password is valid
    // It should be at least 8 characters long
    // It should contain at least one number
    // It should contain at least one uppercase letter
    // It should contain at least one lowercase letter
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/.test(password)) {
        prompt.innerHTML = 'The password should be at least 6 characters long and contain at least one number, one uppercase letter and one lowercase letter';
        prompt.style.opacity = 1;
        return signup.disabled = false;;
    };

    // Usernames can't have special characters, spaces, or start with a number
    if (/[^a-zA-Z0-9]/.test(username)) {
        prompt.innerHTML = 'The username can only contain letters and numbers';
        prompt.style.opacity = 1;
        return signup.disabled = false;;
    };
    if (/^[0-9]/.test(username)) {
        prompt.innerHTML = `The username can't start with a number`;
        prompt.style.opacity = 1;
        return signup.disabled = false;;
    };
    if (/\s/.test(username)) {
        prompt.innerHTML = `The username can't contain spaces`;
        prompt.style.opacity = 1;
        return signup.disabled = false;
    };

    // Send the data to the server
    fetch('/api/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })
    }).then(res => res.json())
    .then(data => {
        if (data.error) {
            prompt.innerHTML = data.error;
            prompt.style.opacity = 1;
        } else {
            if (data.code === '400') {
                prompt.innerHTML = data.message;
                prompt.style.opacity = 1;

                // Re-enable the signup button
                signup.disabled = false;
            } else if (data.code === '200') {
                prompt.innerHTML = 'You have successfully registered';
                prompt.style.opacity = 1;
                prompt.style.color = '#ffffff';
                // Save the userID and token to local storage
                const user = data.user;
                localStorage.setItem('user', JSON.stringify(user));
                // Set cookies
                document.cookie = `${JSON.stringify(user)}`;
                console.log(user);
                // Redirect to the home page
                window.location.href = '/';
                signupForm.reset();
            };
        };
    }).catch((err) => {
        prompt.innerHTML = 'An error has occured';
        prompt.style.opacity = 1;
        console.log(err);
    });
};