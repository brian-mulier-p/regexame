import socketio from "socket.io-client";
import React from "react";

export const socket = socketio.connect({ transports : ['websocket'] });
export const SocketContext = React.createContext();