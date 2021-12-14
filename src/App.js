import "./App.css";
import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from "./context/client-socket";
import {Socket} from "socket.io-client";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Example from "./Example";


function App() {
    const [userName, setUserName] = useState(undefined);
    const [userNameIsSet, setUserNameIsSet] = useState(false);
    const handleUserNameChange = (e) => setUserName(e.target.value);

    const [serverList, setServerList] = useState([]);

    const [serverName, setServerName] = useState("Default Server Name");
    const handleServerNameChange = (e) => setServerName(e.target.value);

    const [exampleToAdd, setExampleToAdd] = useState("");
    const handleExampleToAddChange = (e) => setExampleToAdd(e.target.value);
    const [serverExamples: string[], setServerExamples] = useState([]);

    const [joinedServerOwnerId, setJoinedServerOwnerId] = useState(undefined);
    const [isCreatingServer, setIsCreatingServer] = useState(false);
    const handleCreateServer = () => setIsCreatingServer(true);
    const [isHost, setIsHost] = useState(false);
    const [myServerRegexes, setMyServerRegexes] = useState([]);

    const INTELLIJ_INTERPRETER = "INTELLIJ"
    const JAVA_INTERPRETER = "JAVA"
    const [regexInterpreter, setRegexInterpreter] = useState(JAVA_INTERPRETER);
    const [userRegex, setUserRegex] = useState(undefined);
    const handleUserRegexChange = (e) => setUserRegex(e.target.value);

    const socket: Socket = useContext(SocketContext);

    useEffect(() => {
        socket.on("server_list", serverList => {
            setServerList(serverList)
        })

        socket.on("sync_examples", examples => {
            setServerExamples(examples);
        })

        socket.on("ask_for_user_regex_to_clients", (ignored) => {
            if (userRegex !== undefined) {
                socket.emit("current_user_regex", userRegex)
            }
        })

        socket.on("server_created", ignored => {
            setIsHost(true);
            setIsCreatingServer(false);
            socket.emit("connect_to_server", socket.id);
        })

        socket.on("new_user_regex", (regexWithUsername) => {
            var newRegexes = Array.from(myServerRegexes);
            newRegexes.push(regexWithUsername)
            setMyServerRegexes(newRegexes);
        });

        return () => {
            socket.off("server_list");
            socket.off("sync_examples");
            socket.off("ask_for_user_regex_to_clients");
            socket.off("server_created");
            socket.off("new_user_regex");
        }
    })

    useEffect(() => {
        [...document.getElementsByTagName("button")].forEach(button => button.blur());
    }, [isHost, joinedServerOwnerId, isCreatingServer, userNameIsSet, myServerRegexes, userRegex])

    function askForServerCreation() {
        socket.emit("create_server", {name: serverName})
    }

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

    function handleSaveUserName() {
        setUserNameIsSet(true);

        socket.emit("username", userName);
    }

    function handleEnterToContinue(buttonToActivateId) {
        return (e) => {
            if (e.key.toUpperCase() === 'ENTER') {
                document.getElementById(buttonToActivateId).click();
            }
        };
    }

    function askUserRegex() {
        socket.emit("ask_for_user_regex_to_server");
    }

    function newRegexWithTryCatch(regex) {
        try{
            return new RegExp(regexInterpreter === JAVA_INTERPRETER ? `^${regex}$` : regex);
        }catch (err){
            return undefined;
        }
    }

    return (<div className="App">
        {isHost ?
            myServerRegexes.length === 0 ?
                // HOST VIEW
                (<header className="App-header">
                    <ul id="example_list">
                        {serverExamples.map(serverExample => <Example>
                            {serverExample}
                        </Example>)}
                    </ul>
                    <input id="example_to_add" title="New example" value={exampleToAdd}
                           onChange={handleExampleToAddChange}
                           onKeyPress={handleEnterToContinue("add_example_button")}/>
                    <Button id="add_example_button" className="m-10px" variant="primary" size="lg"
                            onClick={sendExampleToClients} onMouseUp={(e) => e.target.blur()}>Send example to
                        clients</Button>
                    <Button id="ask_user_regex_button" className="m-10px" variant="primary" size="lg"
                            onClick={askUserRegex}>Show results</Button>
                </header>)
                :
                (<header className="App-header">
                    <ul id="example_list">
                        {myServerRegexes.map(serverRegex => {
                                return (<div className={"inline-block m-10px"}>
                                    <h4><b>{serverRegex.username}</b>{" : "}<i>{serverRegex.regex}</i></h4>
                                    {serverExamples.map(serverExample => {
                                        return (<Example
                                            regex={newRegexWithTryCatch(serverRegex.regex)}>
                                            {serverExample}
                                        </Example>)
                                    })}
                                </div>)
                            }
                        )}
                    </ul>
                    <Button className="m-10px" variant="primary" size="lg" onClick={handleGoToServerMenu}>Go
                        back</Button>
                    <div className="abs-bottom w-50">
                        <h3>Choose your REGEX interpreter</h3>
                        <Button id={"java"} className="m-10px" variant="primary" size="lg"
                                active={regexInterpreter === JAVA_INTERPRETER}
                                onClick={() => setRegexInterpreter(JAVA_INTERPRETER)}>
                            Java
                        </Button>
                        <Button id={"intellij"} className="m-10px" variant="primary" size="lg"

                                active={regexInterpreter === INTELLIJ_INTERPRETER}
                                onClick={() => setRegexInterpreter(INTELLIJ_INTERPRETER)}>
                            IntelliJ
                        </Button>
                    </div>
                </header>)
            : joinedServerOwnerId !== undefined ?
                // JOINED SERVER - DISPLAYING EXAMPLES
                serverExamples.length > 0 ?
                    (<header className="App-header">
                        <ul id="example_list">
                            {serverExamples.map(serverExample => <Example
                                regex={newRegexWithTryCatch(userRegex)}>
                                {serverExample}
                            </Example>)}
                        </ul>
                        <Form.Group className="mb-3" controlId="formServerName">
                            <Form.Control id="user_regex" placeholder="Enter a matching regex"
                                          onChange={handleUserRegexChange}/>
                        </Form.Group>
                        <Button className="m-10px" variant="primary" size="lg" onClick={handleGoToServerMenu}>Go
                            back</Button>
                        <div className="abs-bottom w-50">
                            <h3>Choose your REGEX interpreter</h3>
                            <Button id={"java"} className="m-10px" variant="primary" size="lg"
                                    active={regexInterpreter === JAVA_INTERPRETER}
                                    onClick={() => setRegexInterpreter(JAVA_INTERPRETER)}>
                                Java
                            </Button>
                            <Button id={"intellij"} className="m-10px" variant="primary" size="lg"

                                    active={regexInterpreter === INTELLIJ_INTERPRETER}
                                    onClick={() => setRegexInterpreter(INTELLIJ_INTERPRETER)}>
                                IntelliJ
                            </Button>
                        </div>
                    </header>)
                    :
                    // JOINED SERVER - NO EXAMPLE YET
                    (<header className="App-header">
                        <h1>No example available yet</h1>
                    </header>)
                : isCreatingServer ?
                    // SERVER CREATION
                    (<header className="App-header">
                        <Form.Group className="mb-3" controlId="formServerName">
                            <Form.Control placeholder="Enter server name" onChange={handleServerNameChange}
                                          onKeyPress={handleEnterToContinue("create_server_button")}/>
                        </Form.Group>
                        <Button id="create_server_button" className="m-10px" variant="primary" size="lg"
                                onClick={askForServerCreation}>
                            Create server
                        </Button>
                    </header>)
                    :
                    // ASK FOR NAME
                    !userNameIsSet ?
                        (<header id="username-modal-header">
                            <Modal.Dialog>
                                <Modal.Header>
                                    <Modal.Title>Getting to know you :)</Modal.Title>
                                </Modal.Header>

                                <Modal.Body>
                                    <Form.Group className="mb-3" controlId="formUserName">
                                        <Form.Control placeholder="Enter your name" onChange={handleUserNameChange}
                                                      onKeyPress={handleEnterToContinue("save_name_button")}/>
                                    </Form.Group>
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button id="save_name_button" variant="primary" onClick={handleSaveUserName}>I know
                                        my name
                                        !</Button>
                                </Modal.Footer>
                            </Modal.Dialog>
                        </header>)
                        :
                        // STARTING PAGE
                        (<header className="App-header">
                            {serverList.length > 0 ? (
                                    <ul id="server_list">
                                        {serverList.map(server => <li>
                                            <Button className="m-10px" variant="secondary" size="lg" onClick={() => {
                                                connectToServer(server.ownerId)
                                            }}><b>{server.ownerName}</b>{" | " + server.name}</Button>
                                        </li>)}
                                    </ul>
                                ) :
                                (<h1>No servers are available</h1>)
                            }
                            <Button className="m-10px" variant="primary" size="lg" onClick={handleCreateServer}>
                                Go to server creation
                            </Button>
                        </header>)
        }
    </div>)
}

export default App;
