import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store des joueurs connectés
interface Player {
    id: string;
    username: string;
    x: number;
    y: number;
    room?: string;
}

const players = new Map<string, Player>();

// Routes API
app.get('/', (req, res) => {
    res.json({
        name: 'MechaPizzAI MMORPG Server',
        version: '0.1.0',
        status: 'online',
        playersOnline: players.size,
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io events
io.on('connection', (socket) => {
    console.log(`🔌 Nouvelle connexion: ${socket.id}`);

    // Création du joueur
    const player: Player = {
        id: socket.id,
        username: `Agent ${socket.id.slice(0, 6)}`,
        x: 0,
        y: 0,
    };
    players.set(socket.id, player);

    // Envoi de la liste des joueurs existants
    const existingPlayers = Array.from(players.values()).filter((p) => p.id !== socket.id);
    socket.emit('players:list', existingPlayers);

    // Notification aux autres joueurs
    socket.broadcast.emit('player:joined', player);

    // Ping/Pong pour la latence
    socket.on('ping', (timestamp: number) => {
        socket.emit('pong', timestamp);
    });

    // Mouvement du joueur
    socket.on('player:move', (data: { x: number; y: number }) => {
        const p = players.get(socket.id);
        if (p) {
            p.x = data.x;
            p.y = data.y;
            socket.broadcast.emit('player:moved', { playerId: socket.id, x: data.x, y: data.y });
        }
    });

    // Message de chat
    socket.on('chat:message', (data: { message: string }) => {
        const p = players.get(socket.id);
        if (p) {
            io.emit('chat:message', {
                playerId: socket.id,
                username: p.username,
                message: data.message,
            });
        }
    });

    // Action du joueur
    socket.on('player:action', (data: { action: string; data?: any }) => {
        console.log(`🎮 Action de ${socket.id}:`, data.action);
        // Traitement des actions (attaques, interactions, etc.)
    });

    // Rejoindre une room/guilde
    socket.on('room:join', (data: { roomId: string }) => {
        socket.join(data.roomId);
        const p = players.get(socket.id);
        if (p) {
            p.room = data.roomId;
        }
        console.log(`🏠 ${socket.id} a rejoint la room: ${data.roomId}`);
    });

    // Quitter une room
    socket.on('room:leave', (data: { roomId: string }) => {
        socket.leave(data.roomId);
        const p = players.get(socket.id);
        if (p) {
            p.room = undefined;
        }
        console.log(`🚪 ${socket.id} a quitté la room: ${data.roomId}`);
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`🔌 Déconnexion: ${socket.id}`);
        players.delete(socket.id);
        socket.broadcast.emit('player:left', { playerId: socket.id });
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log('🚀 ==========================================');
    console.log('🎮  MechaPizzAI MMORPG Server');
    console.log('🍕  Version: 0.1.0');
    console.log(`🌐  Port: ${PORT}`);
    console.log('🤖  Agents, Pizza & Aventure!');
    console.log('============================================');
});

export { app, io };