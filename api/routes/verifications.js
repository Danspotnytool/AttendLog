
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
    constructor(verificationString, userID) {
        this.verificationString = verificationString;
        this.userID = userID;
    };
    // Create a new route
    create() {
        router.get(`/verify/${this.verificationString}`, async (req, res) => {
            sendMessage(JSON.stringify({
                type: 'profile',
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
                logger.log(`${ip} - Verify Account Attempt - Invalid Authorization`);
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
                    logger.log(`${ip} - Verify Account Attempt - Invalid Authorization`);
                    return res.send({
                        message: 'Invalid Authorization',
                        code: '400'
                    });
                };



                // Verify the account
                database.ref(`/users/${user.userID}/verified`).set(true).then(() => {
                    logger.log(`${ip} - Verify Account - Success`);
                    this.destroy();
                    return res.redirect(`${req.protocol}://${req.get('host')}/dashboard`);
                });
            });
        });
    };

    destroy() {
        // Find the verification string on the database
        database.ref(`/verifications/${this.verificationString}`).once('value', (snapshot) => {
            if (snapshot.val() === null) {
                return;
            };
            // Delete the verification string from the database
            database.ref(`/verifications/${this.verificationString}`).remove();
        });

        // Delete the route
        router.get(`/verify/${this.verificationString}`, (req, res) => {
            res.send({
                message: 'Invalid Verification String',
                code: '400'
            });
        });
    };
};



// Listen every time a new verification is created
database.ref('/verifications').on('child_added', async (snapshot) => {
    if (snapshot.val() === true) {
        return;
    };
    const verificationString = snapshot.key;
    const username = snapshot.val();
    const userID = await database.ref(`/usernames/${username}`).once('value');

    const verification = new verifications(verificationString, userID.val());
    verification.create();
});



module.exports = router;