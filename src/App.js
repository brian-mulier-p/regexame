import './App.css';
import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from './context/client-socket';


function App() {
    const [client_id, setClientId] = useState(NaN);
    const socket = useContext(SocketContext);
    socket.on("client_number", (id) => {
        setClientId(id);
    })

    useEffect(() => {


        return () => {
            socket.disconnect();
        }
    })

    return (
        <div className="App">
            <header className="App-header">
                <p>
                    You're the client number {client_id}
                </p>
            </header>
        </div>
    );
}

export default App;
