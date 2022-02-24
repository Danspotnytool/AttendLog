// Environment variables:
require('dotenv').config();

// Require all dipendencies
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');

// Port
const port = process.env.PORT || 8080;

const io = require('socket.io')(http, {});

// Cors
// app.use(cors({}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// require all path routes
require('./routes/index.js')(app);


// Listen to port
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);
});