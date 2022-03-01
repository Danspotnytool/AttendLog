
// Get the port
const port = location.port;

// Connect to WebSocket server
const socket = io();

socket.on('connect', () => {
    console.log(`Connected to the server as: ${socket.id}`);
});