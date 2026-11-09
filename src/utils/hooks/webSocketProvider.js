'use client';
import { useState, useEffect } from 'react';
import WebSocketContext from './webSocketContext';
import WebSocketWrapper from './websocket';

const WebSocketProvider = ({ children }) => {
    const [socketConnected, setSocketConnected] = useState(false);
    const [webSocket, setWebSocket] = useState(null);

    useEffect(() => {
        const socket = new WebSocketWrapper();
        // 修改ws连接状态
        socket.onConnectionChange(isConnected => setSocketConnected(isConnected));
        socket.connect();
            
        setWebSocket(socket);
        return () => { socket.onConnectionChange(null); socket.close(); };
    }, []);

    return (
        <WebSocketContext.Provider value={{ webSocket, socketConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketProvider;
