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

// Cors strict same origin policy
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:${port}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false);
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));


// require all path routes
// Read all files in the routes directory
const routes = fs.readdirSync(path.join(__dirname, 'routes'));
// Require each file in the routes directory
routes.forEach(route => {
    const routName = route.split('.')[0];
    app.get(`/${routName}`, (req, res, next) => {
        require(`./routes/${route}`)(req, res, next);
    });
});
// Index route
app.get('/', (req, res, next) => {
    require('./routes/index.js')(req, res, next);
});


// Listen to port
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

io.on('connection', (socket) => {
    console.log(`${logger.blue(`${socket.id}`)} has connected`);
});