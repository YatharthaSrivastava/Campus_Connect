import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to CampusConnect WebSocket server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket');
    });
  }
  return socket;
};
