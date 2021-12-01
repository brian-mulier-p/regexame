import socketio from "socket.io-client";
import React from "react";

export const socket = socketio.connect("http://localhost:3001", { transports : ['websocket'] });
export const SocketContext = React.createContext();