
// Require all dipendencies
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const socketClient = require('socket.io-client');


// Require firebase utility
const { database } = require('../../util/databaseConnection.js');

// Require all utilities
const logger = require('../../util/logger.js');
const global = require('../../util/global.js');

// Port
const port = process.env.PORT || 8080;


router.use(bodyParser.json());



// Connect to socket.io client
const io = socketClient(`http://localhost:${port}/apiCalls`);
io.on('connect', () => {
    logger.log('Classes socket connected');
});
// Send a message
const sendMessage = (message) => {
    io.emit(`${process.env.APP_API_KEY}`, message);
};



// Test if connection to database is possible
database.ref('/').once('value').then(() => {
    global.loadedAPIs.push('records');
    logger.log('Records database connected');
}).catch((error) => {
    logger.log(error);
});



router.post('/:classID/setNew', async (req, res) => {
    sendMessage(JSON.stringify({
        type: 'setNewRecord',
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
        logger.log(`${ip} - ${username} - Set New Record Attempt - Invalid Authorization`);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - Set New Record Attempt - Invalid User`);
            return res.send({
                message: 'Invalid User',
                code: '400'
            });
        };
        if (snapshot.val().token !== user.token) {
            logger.log(`${ip} - ${username} - Set New Record Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };

        // Assign the user's verified status to the response
        user['verified'] = snapshot.val().verified;
    });
    // Check if the user is verified
    if (!user.verified) {
        logger.log(`${ip} - ${user.userID} - Set New Record Attempt - Unverified User`);
        return res.send({
            message: 'Unverified User',
            code: '400'
        });
    };

    // Check if the class exists
    const classRef = database.ref(`/classes/${req.params.classID}`);
    await classRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - ${user.userID} - Set New Record Attempt - Invalid Class`);
            return res.send({
                message: 'Invalid Class',
                code: '400'
            });
        };
        // Check if user is the teacher of the class
        if (snapshot.val().classTeacher !== user.userID) {
            logger.log(`${ip} - ${user.userID} - Set New Record Attempt - Not Teacher`);
            return res.send({
                message: 'Not Teacher',
                code: '400'
            });
        };

        // Create the new record
        const newRecord = {
            timeStart: Date.now(),
            timeEnd: req.body.timeEnd,
            students: []
        };
        // Generate a unique record ID
        newRecord.recordID = uuidv4();

        // Push the new record to the records database
        const recordRef = database.ref(`/records/${req.params.classID}/${newRecord.recordID}`);
        recordRef.set(newRecord).then(() => {
            // respond to the client
            logger.log(`${ip} - ${user.userID} - Set New Record - Success`);
            return res.send({
                message: 'Success',
                code: '200'
            });
        });
    });
});



router.get('/:classID/getAll', async (req, res) => {
    sendMessage(JSON.stringify({
        type: 'getAllRecords',
    }));

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Validate the token on the header cookie
});

module.exports = router;