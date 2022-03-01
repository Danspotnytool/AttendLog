// Environment variables:
require('dotenv').config();

// Require all dipendencies
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const path = require('path');

// Require all utilities
const logger = require('./util/logger.js');

// Port
const port = process.env.PORT || 8080;

const io = require('socket.io')(http, {});

// Static files
app.use(express.static(path.join(__dirname, './paths/static/')));


// require all paths
// Read all files in the paths directory
const paths = fs.readdirSync(path.join(__dirname, 'paths'));
// Require each file in the paths directory
// But ignore folders
paths.forEach((path) => {
    if (!path.endsWith('.js')) { return };
    const routName = path.split('.')[0];
    app.get(`/${routName}`, (req, res, next) => {
        require(`./paths/${path}`)(req, res, next);
    });
});
// Index route
app.get('/', (req, res, next) => {
    require('./paths/index.js')(req, res, next);
});


// Listen to port
http.listen((port), () => {
    console.log(`Server is running on port ${port}`);
});

io.on('connection', (socket) => {
    console.log(`${logger.blue(`${socket.id}`)} has connected`);



    socket.on('disconnect', () => {
        console.log(`${logger.red(`${socket.id}`)} has disconnected`);
    });
});