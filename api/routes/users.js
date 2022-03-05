
// Require all dipendencies
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bycrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');


// Require firebase utility
const { database } = require('../../util/databaseConnection.js');



router.use(bodyParser.json());



// Get all users and usernames from the database
let users;
let usernames;
let emails;
const getAccountArray = async () => {
    const dbUsers = await database.ref('/users').once('value').then((snapshot) => {
        console.log('Users database is loaded');
        return snapshot.val();
    }).catch((err) => {
        console.log(err);
    });
    const dbUsernames = await database.ref('/usernames').once('value').then((snapshot) => {
        console.log('Usernames database is loaded');
        return Array.from(snapshot.val());
    }).catch((err) => {
        console.log(err);
    });
    const dbEmails = await database.ref('/emails').once('value').then((snapshot) => {
        console.log('Emails database is loaded');
        return Array.from(snapshot.val());
    }).catch((err) => {
        console.log(err);
    });

    users = dbUsers;
    usernames = dbUsernames;
    emails = dbEmails;
};
getAccountArray();

// Signup route
router.post('/signup',  async (req, res, next) => {
    // Get the data from the request
    // Username, First name, Last name, Email address, and Password
    let { username, firstName, lastName, email, password } = req.body;
    res.statusCode = 200;

    // Check if all the fields are filled
    if (!username || !firstName || !lastName || !email || !password) {
        return res.send({
            message: 'Please fill in all the fields',
            code: '400'
        });
    };
    // Check character lengths of the fields
    if (username.length > 20 || firstName.length > 20 || lastName.length > 20 || email.length > 50 || password.length > 20) {
        return res.send({
            message: 'Please make sure all the fields are less than 20 characters',
            code: '400'
        });
    };
    
    if (username.length < 6 || firstName.length < 3 || lastName.length < 4 || email.length < 6 || password.length < 6) {
        return res.send({
            message: `Please make sure all the fields have the proper length
(Username: 6-20 characters
First Name: 3-20 characters
Last Name: 4-20 characters
Email: 6-50 characters
Password: 6-20 characters)`,
            code: '400'
        });
    };
    // Check if the email is valid
    if (!/^[^@]+@[^@.]+\.[a-z]+$/i.test(email)) {
        return res.send({
            message: 'Please make sure the email is valid',
            code: '400'
        });
    };
    // Check if the password is valid
    // It should be at least 8 characters long
    // It should contain at least one number
    // It should contain at least one uppercase letter
    // It should contain at least one lowercase letter
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/.test(password)) {
        return res.send({
            message: 'The password should be at least 6 characters long and contain at least one number, one uppercase letter and one lowercase letter',
            code: '400'
        });
    };

    // Check if the username is already taken
    if (usernames.includes(username)) {
        return res.send({
            message: 'The username is already taken',
            code: '400'
        });
    };
    // Usernames can't have special characters, spaces, or start with a number
    if (/[^a-zA-Z0-9]/.test(username)) {
        return res.send({
            message: 'The username can only contain letters and numbers',
            code: '400'
        });
    };
    if (/^[0-9]/.test(username)) {
        return res.send({
            message: `The username can't start with a number`,
            code: '400'
        });
    };
    if (/\s/.test(username)) {
        return res.send({
            message: `The username can't contain spaces`,
            code: '400'
        });
    };


    // Check if the email is already taken
    if (emails.includes(email)) {
        return res.send({
            message: 'The email is already taken',
            code: '400'
        });
    };


    try {
        const hashedPassword = await bycrypt.hash(password, 10);
        password = hashedPassword;
    } catch (err) {
        console.log(err);
        return res.send({
            message: 'Something went wrong',
            code: '400'
        });
    };

    const user = {
        username: username,
        userID: `${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`,
        token: uuidv4(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        createdAt: Date.now()
    };

    // Write to the database
    try {
        await database.ref(`/users/${users.length}`).set(user).then(() => {
            users.push(user);
        });
        await database.ref(`/usernames/${usernames.length}`).set(username).then(() => {
            usernames.push(username);
        });
        await database.ref(`/emails/${emails.length}`).set(user.email).then(() => {
            emails.push(user.email);
        });

        // Return the user
        res.send({
            message: 'Account created',
            user: {
                userID: user.userID,
                token: user.token
            },
            code: '200'
        });
    } catch (err) {
        console.log(err);
        return res.send({
            message: 'Something went wrong',
            code: '400'
        });
    };
});


// Signin route
router.post('/signin', async (req, res, next) => {
    // Get the data from the request
    // Username and Password
    const { username, password } = req.body;

    // Check if username and password is defined
    if (!username || !password) {
        return res.send({
            message: 'Please fill in all the fields',
            code: '400'
        });
    };

    // Check if the username is valid
    // The usernames is an array of objects
    // Username: UserID
    if (!usernames.includes(username)) {
        return res.send({
            message: 'Invalid username or password',
            code: '400'
        });
    };

    // Find the username in the database
    const user = users.find((user) => { return user.username === `${username}`} );

    // Check if the password is valid
    // The password is hashed
    try {
        const isMatch = await bycrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send({
                message: 'Invalid username or password',
                code: '400'
            });
        };
    } catch (err) {
        console.log(err);
        return res.send({
            message: 'Something went wrong',
            code: '400'
        });
    };
    // Return the user
    res.send({
        message: 'Login Successful',
        user: {
            userID: user.userID,
            token: user.token
        },
        code: '200'
    });
});

module.exports = router;