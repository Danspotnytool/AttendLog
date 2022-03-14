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

// Require the API
const api = require('./api/api.js')(app);

// Require database
const { database } = require('./util/databaseConnection.js');

// Require all utilities
const logger = require('./util/logger.js');
const global = require('./util/global.js');

// Port
const port = process.env.PORT || 8080;

const io = require('socket.io')(http, {});

// Cors restriction
// Restrict all requests to this domain from other domains
app.use(cors({
    origin: `http://localhost:${port}`,
    credentials: true,
}));

// Change the favicon
app.use(favicon(path.join(__dirname, './paths/static/assets/images/favicon.png')));

// require all paths
const paths = require('./paths/index.js')(app);


// Listen to port
http.listen((port), () => {
    logger.log(`Server is running on port ${port}`);
    global.timestart = Date.now();
}).on('error', (err) => {
    logger.error(err);
});

io.on('connection', (socket) => {
    logger.log(`User ${socket.id} connected`);



    socket.on('disconnect', () => {
        logger.log(`User ${socket.id} disconnected`);
    });
});