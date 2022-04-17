
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



const verifications = [];



// Test if connection to database is possible
database.ref('/').once('value').then(() => {
    logger.log('Verifications database connected');
}).catch((error) => {
    logger.log(error);
});



// Verification Class
class Verification {
    constructor(verificationString, userID, createdAt) {
        this.verificationString = verificationString;
        this.userID = userID;
        this.createdAt = createdAt;

        // Create a timer to delete the verification string using the createdAt timestamp
        // The expiration time is set to 24 hours from when it was created
        this.expirationTimeout = setTimeout(() => {
            this.destroy();
        }, (createdAt + (24 * 60 * 60 * 1000)) - Date.now());
    };

    async deleteVerification() {
        clearTimeout(this.expirationTimeout);

        await database.ref(`/verifications/${this.verificationString}`).remove();
        // Remove the verification string from the verifications array
        verifications.splice(verifications.indexOf(this), 1);
    };

    async verify() {
        // Verify the user
        await database.ref(`/users/${this.userID}/verified/`).set(true);
        // Remove the verification string from user
        await database.ref(`/users/${this.userID}/verificationString`).remove();

        this.deleteVerification();
    };

    async destroy() {
        // Delete the user from the database
        await database.ref(`/users/${this.userID}`).remove();

        this.deleteVerification();
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

    // Create a new verification object
    const verification = new Verification(verificationString, userID, createdAt);
    // Add the verification object to the verifications array
    verifications.push(verification);
});



// Listen to '/verify' route
router.get('/verify/:verificationString', async (req, res) => {
    sendMessage(JSON.stringify({
        type: 'verify',
    }));

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
        logger.log(`${ip} - Verification Attempt - Invalid Authorization`);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - Verification Attempt - Invalid User`);
            return res.send({
                message: 'Invalid User',
                code: '400'
            });
        };
        if (snapshot.val().token !== user.token) {
            logger.log(`${ip} - Verification Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };
        Object.keys(snapshot.val()).forEach((key) => {
            if (key !== 'token') {
                user[key] = snapshot.val()[key];
            };
        });

        // Check if the user is already verified
        if (user.verified) {
            logger.log(`${ip} - Verification Attempt - User already verified`);
            return res.send({
                message: 'User already verified',
                code: '400'
            });
        };

        // Check if the verification string is valid
        const verification = verifications.find((verification) => {
            return verification.verificationString === req.params.verificationString;
        });
        if (!verification) {
            logger.log(`${ip} - Verification Attempt - Invalid verification string`);
            return res.send({
                message: 'Invalid verification string',
                code: '400'
            });
        };

        // Verify the user
        verification.verify().then(() => {
            res.redirect('/dashboard');
        });
    });
});



module.exports = router;