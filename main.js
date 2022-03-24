// Environment variables:
require('dotenv').config();

// Require all dipendencies
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const http = require('http').createServer(app);
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const ms = require('ms');

// Require database
const { database } = require('./util/databaseConnection.js');

// Require Gmail API
const { sendMail } = require('./util/gmailAPI.js');

// Require all utilities
const logger = require('./util/logger.js');
const global = require('./util/global.js');

// Port
const port = process.env.PORT || 8080;

const socket = require('socket.io');
const io = socket(http, {});

// Cors restriction
// Restrict all requests to this domain from other domains
app.use(cors({
    origin: `http://localhost:${port}`,
    credentials: true
}));

// Change the favicon
app.use(favicon(path.join(__dirname, './paths/static/assets/images/favicon.png')));

// require all paths
const paths = require('./paths/index.js')(app);

// Require the API
const api = require('./api/api.js')(app);


// Listen to port
http.listen((port), () => {
    logger.log(`Server is running on port ${port}`);
    global.startupTime = Date.now();
    global.connectedUsers = 0;
    global.apiCalls = 0;
    global.signups = 0;
    global.signins = 0;
}).on('error', (err) => {
    logger.error(err);
});



const connectedToSocketArray = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];


// This array will be the ammount of api calls every minute
const apiCallsArray = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];
// This array will be the ammount of signups every minute
const signupsArray = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];
// This array will be the ammount of signins every minute
const signinsArray = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];



// Listen to socket connection
io.on('connection', (socket) => {
    logger.log(`User ${socket.id} connected`);
    global.connectedUsers += 1;


    socket.on('disconnect', () => {
        logger.log(`User ${socket.id} disconnected`);
        global.connectedUsers -= 1;
    });
});

// Listen to socket connection on status
const statusSocket = io.of('/status');
statusSocket.on('connection', (socket) => {
    logger.log(`User ${socket.id} connected on status`);
    global.connectedUsers += 1;

    // Translate Date.now() (global.startupTime) to relative time
    const uptime = ms(Date.now() - global.startupTime, { long: true });
    socket.emit('uptime', uptime);
    socket.emit('startupTime', global.startupTime);

    socket.emit('apiCalls', apiCallsArray);
    socket.emit('signups', signupsArray);
    socket.emit('signins', signinsArray);

    socket.on('disconnect', () => {
        logger.log(`User ${socket.id} disconnected on status`);
        global.connectedUsers -= 1;
    });
});

// Emit the connected users to the '/status' socket
setInterval(() => {
    connectedToSocketArray.push(global.connectedUsers);
    connectedToSocketArray.shift();

    statusSocket.emit('connectedUsers', connectedToSocketArray);
}, 1000);



// Emit the connected users to the '/apiCalls' socket
const apiCallsSocket = io.of('/apiCalls');
apiCallsSocket.on('connection', (socket) => {
    socket.on(`${process.env.APP_API_KEY}`, (data) => {
        global.apiCalls += 1;
        try {
            data = JSON.parse(data);
            if (data.type === 'signup') {
                global.signups += 1;
            } else if (data.type === 'signin') {
                global.signins += 1;
            };
        } catch(err) {
            logger.error(err);
            logger.error(data);
            logger.error('Error in parsing data');
            logger.error('Possible data breach');
        };
    });
    socket.emit('apiCalls', apiCallsArray);
});

// Send datas every minute to the '/status' socket
setInterval(() => {
    // Api calls
    apiCallsArray.push(global.apiCalls);
    apiCallsArray.shift();
    global.apiCalls = 0;
    statusSocket.emit('apiCalls', apiCallsArray);

    // Signups
    signupsArray.push(global.signups);
    signupsArray.shift();
    global.signups = 0;
    statusSocket.emit('signups', signupsArray);

    // Signins
    signinsArray.push(global.signins);
    signinsArray.shift();
    global.signins = 0;
    statusSocket.emit('signins', signinsArray);
}, 1000 * 60);



// Timer for server uptime
// This timer would repeat every second until it repeated 60 times
// Then it would now repeat every minute
// Then it would repeat every hour
let uptimeSeconds = 0;
let uptimeMinutes = 0;
var willRepeatEvery = 1000;

const sendUptime = () => {
    const uptime = ms(Date.now() - global.startupTime, { long: true });
    statusSocket.emit('uptime', uptime);

    uptimeSeconds += 1;
    if (uptimeSeconds === 60) {
        uptimeMinutes += 1;
        uptimeSeconds = 0;
        willRepeatEvery = 1000 * 60;
        if (uptimeMinutes === 60) {
            uptimeMinutes = 0;
            willRepeatEvery = 1000 * 60 * 60;
        };
    };

    setTimeout(() => { sendUptime() }, willRepeatEvery);
};
setTimeout(() => { sendUptime() }, 1000);