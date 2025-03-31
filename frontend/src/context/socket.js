import { io } from 'socket.io-client';

const socket = io('http://localhost:5000',{
    secure: true,
    rejectUnauthorized: false,
    transports: ['websocket']
});

export default socket;