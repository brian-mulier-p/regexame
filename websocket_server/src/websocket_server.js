const express = require("express");
const {Server: socketServer} = require("socket.io");
const path = require("path");
const Server = require("./server.js");

const PORT = process.env.PORT || 3000;

const app = express();
const server = app
    .use(express.static(path.join(__dirname, "..", "..", "build")))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "..", "build", "index.html"));
});

const io = new socketServer(server);

let servers = [];

function generateServersDto() {
    return servers.map(server => server.clientView());
}

io.on("connection", (socket) => {
    console.log("Client connected");
    const clientId = socket.id;
    socket.emit("server_list", generateServersDto());

    socket.on("create_server", data => {
        console.log("received create_server event with following data : " + data);
        const createdServer = new Server(clientId, data.name, []);
        const examples = createdServer.examples;
        servers.push(createdServer);
        socket.emit("server_created");
        io.emit("server_list", generateServersDto());

        socket.on("add_example", exampleToAdd => {
            examples.push(exampleToAdd);
            io.to("host_" + clientId).emit("sync_examples", examples);
        });
    });

    socket.on("connect_to_server", (ownerId) => {
        socket.join("host_" + ownerId);
        socket.emit("sync_examples", servers.filter(server => server.ownerId === ownerId)[0].examples);
    })

    socket.on("disconnect_from_server", (ownerId) => {
        socket.leave("host_" + ownerId);
    })

    socket.on("disconnect", () => console.log("Client disconnected"));
});