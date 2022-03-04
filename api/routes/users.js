
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
const getAccountArray = async () => {
    const dbUsers = await database.ref('/users').once('value').then((snapshot) => {
        console.log(snapshot.val());
        return Array.from(snapshot.val());
    }).catch((err) => {
        console.log(err);
    });
    const dbUsernames = await database.ref('/usernames').once('value').then((snapshot) => {
        console.log(snapshot.val());
        return Array.from(snapshot.val());
    }).catch((err) => {
        console.log(err);
    });

    users = dbUsers;
    usernames = dbUsernames;
};
getAccountArray();



// Intex route
router.get('/me', (req, res, next) => {
    // Get the user from the request header
    const userID = req.headers.userid;
    const token = req.headers.token;
    console.log(`from header ${userID}`);
    console.log(`from header ${token}`);

    // Find the user in the users object using the userID
    database.ref(`/users/${userID}`).once('value').then((snapshot) => {
        console.log(snapshot.val());
        const user = snapshot.val();
        if (!user) {
            return res.send({
                message: 'User not found',
                code: '404'
            });
        };
        // Check if the token is valid
        if (user.token !== token) {
            return res.send({
                message: 'Invalid token',
                code: '401'
            });
        };
        res.send({
            message: 'User valid',
            code: '200'
        });
    });
});

router.post('/',  async (req, res, next) => {
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
        await database.ref(`/users/${user.userID}`).set(user);
        await database.ref(`/usernames/${usernames.length}`).set(username);

        // Push the user to the users array
        users.push(user);
        usernames.push(username);

        // Return the user
        res.send({
            message: 'Account created',
            user: {
                userID: user.userID,
                token: user.token,
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

module.exports = router;