const express = require("express");
const { Server:socketServer } = require("socket.io");

const PORT = process.env.PORT || 3001;

const server = express()
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = new socketServer(server);

let connectedClients = 0;

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit("client_number", {
        "id": ++connectedClients
    })
    socket.on('disconnect', () => console.log('Client disconnected'));
});