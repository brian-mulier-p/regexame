const express = require("express");
const { Server:socketServer } = require("socket.io");
const path = require("path")

const PORT = process.env.PORT || 3001;

const app = express();
const server = app
    .use(express.static(path.join(__dirname, 'build')))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const io = new socketServer(server);

let connectedClients = 0;

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit("client_number", {
        "id": ++connectedClients
    })
    socket.on('disconnect', () => console.log('Client disconnected'));
});