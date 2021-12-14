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
    const clientId = socket.id;

    socket.on("username", username => {
        socket.emit("server_list", generateServersDto());

        socket.on("create_server", data => {
            const createdServer = new Server(clientId, username, data.name, []);
            const examples = createdServer.examples;
            servers.push(createdServer);
            socket.emit("server_created");
            io.emit("server_list", generateServersDto());

            socket.on("add_example", exampleToAdd => {
                examples.push(exampleToAdd);
                io.to("host_" + clientId).emit("sync_examples", examples);
            });



            socket.on("ask_for_user_regex_to_server", () => {
                io.to("host_" + clientId).emit("ask_for_user_regex_to_clients");
            })
        });

        socket.on("connect_to_server", (ownerId) => {
            socket.join("host_" + ownerId);
            socket.emit("sync_examples", servers.filter(server => server.ownerId === ownerId)[0].examples);

            socket.on("current_user_regex", (regex) => {
                io.to(ownerId).emit("new_user_regex", {username: username, regex: regex});
            })
        })

        socket.on("disconnect_from_server", (ownerId) => {
            socket.leave("host_" + ownerId);
        })
    })

    socket.on("disconnect", () => console.log("Client disconnected"));
});