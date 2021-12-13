import "./App.css";
import React, {useContext, useState} from "react";
import {SocketContext} from "./context/client-socket";
import {Socket} from "socket.io-client";
import Example from "./Example.js"


function App() {
    const [serverList, setServerList] = useState([]);

    const [serverName, setServerName] = useState("Default Server Name");
    const handleServerNameChange = (e) => setServerName(e.target.value);

    const [exampleToAdd, setExampleToAdd] = useState("");
    const handleExampleToAddChange = (e) => setExampleToAdd(e.target.value);
    const [serverExamples : string[], setServerExamples] = useState([]);

    const [joinedServerOwnerId, setJoinedServerOwnerId] = useState(undefined);
    const [isCreatingServer, setIsCreatingServer] = useState(false);
    const handleCreateServer = () => setIsCreatingServer(true);
    const [isHost, setIsHost] = useState(false);

    const [userRegex, setUserRegex] = useState("");
    const [shouldEvaluateRegex, setShouldEvaluateRegex] = useState(false);
    const handleUserRegexChange = (e) => setUserRegex(e.target.value);

    const socket: Socket = useContext(SocketContext);

    socket.on("server_list", serverList => {
        setServerList(serverList)
    })

    socket.on("sync_examples", examples => {
        setServerExamples(examples);
    })

    function askForServerCreation() {
        socket.emit("create_server", {name: serverName})

        socket.on("server_created", ignored => {
            setIsHost(true);
            setIsCreatingServer(false);
        })
    }

    console.log("HOST ? " + isHost);
    console.log("CREATING SERVER ? " + isCreatingServer);

    function connectToServer(ownerId) {
        socket.emit("connect_to_server", ownerId);

        setJoinedServerOwnerId(ownerId);
    }

    function sendExampleToClients() {
        socket.emit("add_example", exampleToAdd);

        setExampleToAdd("");
    }

    function handleGoToServerMenu() {
        if (joinedServerOwnerId !== undefined) {
            socket.emit("disconnect_from_server", joinedServerOwnerId);

            setJoinedServerOwnerId(undefined);
        }

        setIsCreatingServer(false);
        setIsHost(false);
    }

    return isHost ? (<div className="App">
            <header className="App-header">
                <input id="example_to_add" title="New example" value={exampleToAdd} onChange={handleExampleToAddChange}/>
                <button onClick={sendExampleToClients}>Send example to clients</button>
            </header>
        </div>)
        : joinedServerOwnerId !== undefined ? (<div className="App">
                <header className="App-header">
                    {
                        serverExamples.length > 0 ? (<ul id="example_list">
                                {serverExamples.map(serverExample => <Example regex={userRegex === "" ? undefined : new RegExp(`^${userRegex}$`)}>
                                    {serverExample}
                                </Example>)}
                            </ul>) :
                            (<h1>No example available yet</h1>)
                    }
                    <input id="user_regex" title="Enter a matching regex" onChange={handleUserRegexChange}/>
                    <button onClick={handleGoToServerMenu}>Go back</button>
                </header>
            </div>)

            : isCreatingServer ? (<div className="App">
                    <header className="App-header">
                        <input id="server_name" title="Server name" value={serverName} onChange={handleServerNameChange}/>
                        <button onClick={askForServerCreation}>Create server</button>
                    </header>
                </div>)
                : (<div className="App">
                    <header className="App-header">
                        {
                            serverList.length > 0 ? (<ul id="server_list">
                                    {serverList.map(server => <li>
                                        <button onClick={() => {
                                            console.log("connect")
                                            connectToServer(server.ownerId)
                                        }}>Client#{server.ownerId} | {server.name}</button>
                                    </li>)}
                                </ul>) :
                                (<h1>No servers are available</h1>)
                        }
                        <button onClick={handleCreateServer}>Go to server creation
                        </button>
                    </header>
                </div>)
}

export default App;
