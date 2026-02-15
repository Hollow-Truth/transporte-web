import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        const token = localStorage.getItem('access_token');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const socketUrl = apiUrl.replace('/api', '');

        socket = io(socketUrl, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        socket.on('connect', () => {
            console.log('✅ WebSocket conectado');
        });

        socket.on('disconnect', () => {
            console.log('❌ WebSocket desconectado');
        });

        socket.on('connect_error', (error) => {
            console.error('Error de conexión WebSocket:', error);
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Tipos para eventos de tracking
export interface VehiclePosition {
    vehicleId: string;
    placa: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    timestamp: string;
    routeId?: string;
}

export interface TrajectoryEvent {
    trajectoryId: string;
    vehicleId: string;
    routeId: string;
    startTime: string;
}
