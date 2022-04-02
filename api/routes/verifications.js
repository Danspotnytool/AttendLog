
// Require all dipendencies
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bycrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const socketClient = require('socket.io-client');


// Require firebase utility
const { database } = require('../../util/databaseConnection.js');

// Require gmail utility
const { sendMail } = require('../../util/gmailAPI.js');

// Require all utilities
const logger = require('../../util/logger.js');
const global = require('../../util/global.js');

// Port
const port = process.env.PORT || 8080;


router.use(bodyParser.json());



// Connect to socket.io client
const io = socketClient(`http://localhost:${port}/apiCalls`);
io.on('connect', () => {
    logger.log('Verifications socket connected');
});
// Send a message
const sendMessage = (message) => {
    io.emit(`${process.env.APP_API_KEY}`, message);
};



// Test if connection to database is possible
database.ref('/').once('value').then(() => {
    logger.log('Verifications database connected');
}).catch((error) => {
    logger.log(error);
});



// Verification Class
class verifications {
    constructor(verificationString, userID, createdAt) {
        this.verificationString = verificationString;
        this.userID = userID;
        this.createdAt = createdAt;

        // Create a timer to delete the verification string using the createdAt timestamp
        // The expiration time is set to 24 hours
        this.expirationTimeout = setTimeout(() => {
            this.destroy();
        }, 1000 * 60 * 60 * 24);
    };
    // Create a new route
    create() {
        // Create a route for the verification string
        router.get(`/verify/${this.verificationString}`, async (req, res) => {
            console.log(`/verify/${this.verificationString}`);
            // Check if the user is logged in
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            // Validate the token on the header cookie
            const user = {
                userID: '',
                token: ''
            };
            try {
                user.userID = JSON.parse(req.headers.cookie).userID;
                user.token = JSON.parse(req.headers.cookie).token;
            } catch (err) {
                logger.log(`${ip} - Get Profile Attempt - Invalid Authorization`);
                return res.send({
                    message: 'Invalid Authorization',
                    code: '400'
                });
            };
            // Validate the token on the database
            const userRef = database.ref(`/users/${user.userID}`);
            await userRef.once('value', (snapshot) => {
                if (snapshot.val() === null) {
                    logger.log(`${ip} - Verify Account Attempt - Invalid UserID`);
                    return res.send({
                        message: 'Invalid UserID',
                        code: '400'
                    });
                };

                if (snapshot.val().token !== user.token) {
                    logger.log(`${ip} - Get Profile Attempt - Invalid Authorization`);
                    return res.send({
                        message: 'Invalid Authorization',
                        code: '400'
                    });
                };
            });

            // Find the verification string on the database
            const verificationStringRef = database.ref(`/verifications/${this.verificationString}`);
            verificationStringRef.once('value', (snapshot) => {
                if (snapshot.val() === null) {
                    res.send({
                        message: 'Invalid Verification String',
                        code: '400'
                    });
                    return;
                };

                // Check if this verification string is for the user
                if (snapshot.val().userID !== user.userID) {
                    res.send({
                        message: 'Invalid Verification String',
                        code: '400'
                    });
                    return;
                };

                // Verify the user
                userRef.update({
                    verified: true
                });

                // Clear the timeout
                clearTimeout(this.expirationTimeout);

                // Delete the verification string from the database
                verificationStringRef.remove();

                // Redirect the user to the dashboard
                res.redirect(`${req.protocol}://${req.get('host')}/dashboard`);
            });

        });
    };

    destroy() {
        console.log(`/verify/${this.verificationString}`);
        // Delete the verification string from the database
        database.ref(`/verifications/${this.verificationString}`).remove();
        // Delete the user from the database
        // Get it's username and email
        const userRef = database.ref(`/users/${this.userID}`);
        userRef.once('value', (snapshot) => {
            const username = snapshot.val().username;
            const email = snapshot.val().email;

            // Delete the user from the database
            database.ref(`/usernames/${username}`).remove();
            database.ref(`/emails/${encodeURIComponent(email).replace('.', '%2E')}`).remove();

            // Delete the user from the database
            database.ref(`/users/${this.userID}`).remove();

            // Delete the route
            router.get(`/verify/${this.verificationString}`, (req, res) => {
                res.send({
                    message: 'Invalid Verification String',
                    code: '400'
                });
            });
        });
    };
};



// Listen every time a new verification is created
database.ref('/verifications').on('child_added', async (snapshot) => {
    if (snapshot.key === 'placeholder') {
        return;
    };

    // Get the verification string
    const verificationString = snapshot.key;
    const userID = snapshot.val().userID;
    const createdAt = snapshot.val().createdAt;

    // Check if the createdAt timestamp is older than 24 hours
    const now = Date.now();
    // Create a new verification object
    const verification = new verifications(verificationString, userID, createdAt);
    if (now - createdAt > 1000 * 60 * 60 * 24) {
        // Delete the verification string from the database
        try { verification.destroy() } catch (err) {};
    };
    verification.create();
});



module.exports = router;