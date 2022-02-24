// Environment variables:
require('dotenv').config();

// Require all dipendencies
const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Port
const port = process.env.PORT || 8080;

const io = require('socket.io')(http, {});

// Cors
// app.use(cors({}));

// Get index
app.get('/', (req, res) => {
    res.send('Hello World!');
});


// Listen to port
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

io.on('connection', (socket) => {
    console.log('a user connected');
});