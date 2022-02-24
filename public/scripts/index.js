
// Get the port
const port = location.port;

// Connect to WebSocket server
const socket = io.connect(`http://localhost:${port}`);

socket.on('connect', () => {
    console.log(`Connected to the server as: ${socket.id}`);
});