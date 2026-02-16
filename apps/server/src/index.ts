import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyToken, getUserFromToken } from './lib/auth.js';
import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '0.2.0',
        environment: process.env.NODE_ENV || 'development',
        players: players.size,
        rooms: rooms.size,
    });
});

// ============================================
// TYPES & INTERFACES
// ============================================

interface Vector2 {
    x: number;
    y: number;
}

interface Player {
    id: string;
    username: string;
    position: Vector2;
    velocity: Vector2;
    room: string;
    lastUpdate: number;
    connectedAt: number;
    level: number;
    health: number;
    maxHealth: number;
    userId?: string;
    characterId?: string;
}

interface ChatMessage {
    id: string;
    playerId: string;
    username: string;
    message: string;
    timestamp: number;
    room: string;
}

interface Room {
    id: string;
    name: string;
    maxPlayers: number;
    playerIds: Set<string>;
}

// ============================================
// CONSTANTS
// ============================================

const GAME_CONSTANTS = {
    // Map
    MAP_WIDTH: 2000,
    MAP_HEIGHT: 2000,

    // Player
    PLAYER_SPEED: 200, // pixels per second
    PLAYER_MAX_HEALTH: 100,

    // Anti-cheat
    MAX_SPEED: 250, // Maximum allowed speed (pixels per second)
    MAX_POSITION_DELTA: 100, // Maximum position change between updates
    POSITION_UPDATE_RATE: 50, // ms

    // Chat
    CHAT_MAX_LENGTH: 200,
    CHAT_COOLDOWN: 1000, // ms between messages

    // Rooms
    MAX_PLAYERS_PER_ROOM: 100,
    DEFAULT_ROOM: 'main',
};

// ============================================
// STORES
// ============================================

const players = new Map<string, Player>();
const rooms = new Map<string, Room>();
const chatHistory = new Map<string, ChatMessage[]>();
const lastChatTime = new Map<string, number>();

// Initialize default room
rooms.set(GAME_CONSTANTS.DEFAULT_ROOM, {
    id: GAME_CONSTANTS.DEFAULT_ROOM,
    name: 'Neo-Pizzapolis Central',
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS_PER_ROOM,
    playerIds: new Set(),
});

// ============================================
// UTILITIES
// ============================================

function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function isPositionValid(position: Vector2): boolean {
    return (
        position.x >= -GAME_CONSTANTS.MAP_WIDTH / 2 &&
        position.x <= GAME_CONSTANTS.MAP_WIDTH / 2 &&
        position.y >= -GAME_CONSTANTS.MAP_HEIGHT / 2 &&
        position.y <= GAME_CONSTANTS.MAP_HEIGHT / 2
    );
}

function validateMovement(player: Player, newPosition: Vector2, timestamp: number): boolean {
    const deltaTime = (timestamp - player.lastUpdate) / 1000; // Convert to seconds

    if (deltaTime <= 0) return true; // First update or time sync issue

    const deltaDistance = distance(player.position, newPosition);
    const speed = deltaDistance / deltaTime;

    // Check if speed is within allowed limits
    if (speed > GAME_CONSTANTS.MAX_SPEED) {
        console.warn(`⚠️ Speed hack detected from ${player.username}: ${speed.toFixed(2)} px/s`);
        return false;
    }

    // Check if position change is reasonable
    if (deltaDistance > GAME_CONSTANTS.MAX_POSITION_DELTA) {
        console.warn(`⚠️ Teleport detected from ${player.username}: ${deltaDistance.toFixed(2)} px`);
        return false;
    }

    // Check if position is within map bounds
    if (!isPositionValid(newPosition)) {
        console.warn(`⚠️ Out of bounds from ${player.username}`);
        return false;
    }

    return true;
}

function broadcastToRoom(roomId: string, event: string, data: any, exceptSocketId?: string): void {
    const room = rooms.get(roomId);
    if (!room) return;

    room.playerIds.forEach((playerId) => {
        if (playerId !== exceptSocketId) {
            io.to(playerId).emit(event, data);
        }
    });
}

function getPlayersInRoom(roomId: string): Player[] {
    const room = rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.playerIds)
        .map((id) => players.get(id))
        .filter((p): p is Player => p !== undefined);
}

// ============================================
// ROUTES API
// ============================================

app.get('/', (req, res) => {
    res.json({
        name: 'MechaPizzAI MMORPG Server',
        version: '0.2.0',
        status: 'online',
        playersOnline: players.size,
        rooms: rooms.size,
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.get('/api/players', (req, res) => {
    const playerList = Array.from(players.values()).map((p) => ({
        id: p.id,
        username: p.username,
        room: p.room,
        level: p.level,
    }));
    res.json(playerList);
});

app.get('/api/rooms', (req, res) => {
    const roomList = Array.from(rooms.values()).map((r) => ({
        id: r.id,
        name: r.name,
        playerCount: r.playerIds.size,
        maxPlayers: r.maxPlayers,
    }));
    res.json(roomList);
});

// ============================================
// SOCKET.IO EVENTS
// ============================================

io.on('connection', (socket) => {
    console.log(`🔌 Nouvelle connexion: ${socket.id}`);

    // ========================================
    // PLAYER INITIALIZATION
    // ========================================

    const player: Player = {
        id: socket.id,
        username: `Agent ${socket.id.slice(0, 6)}`,
        position: { x: 1000, y: 1000 },
        velocity: { x: 0, y: 0 },
        room: GAME_CONSTANTS.DEFAULT_ROOM,
        lastUpdate: Date.now(),
        connectedAt: Date.now(),
        level: 1,
        health: GAME_CONSTANTS.PLAYER_MAX_HEALTH,
        maxHealth: GAME_CONSTANTS.PLAYER_MAX_HEALTH,
    };

    players.set(socket.id, player);

    // ========================================
    // AUTHENTICATION
    // ========================================

    // Handle authentication with JWT token
    socket.on('auth:login', async (data: { token: string; characterId?: string }) => {
        try {
            const user = await getUserFromToken(data.token);

            if (!user) {
                socket.emit('auth:error', { message: 'Invalid token' });
                return;
            }

            player.userId = user.id;
            player.username = user.username;

            // Load character if specified
            if (data.characterId) {
                const character = await prisma.character.findFirst({
                    where: {
                        id: data.characterId,
                        userId: user.id,
                    },
                });

                if (character) {
                    player.characterId = character.id;
                    player.username = character.name;
                    player.position = { x: character.posX, y: character.posY };
                    player.room = character.roomId;
                    player.level = character.level;
                    player.health = character.health;
                    player.maxHealth = character.maxHealth;
                }
            }

            socket.emit('auth:success', {
                userId: user.id,
                username: player.username,
                characterId: player.characterId,
            });

            console.log(`🔐 ${player.username} authenticated (User: ${user.id})`);
        } catch (error) {
            console.error('Auth error:', error);
            socket.emit('auth:error', { message: 'Authentication failed' });
        }
    });

    // Add to default room
    const defaultRoom = rooms.get(GAME_CONSTANTS.DEFAULT_ROOM)!;
    defaultRoom.playerIds.add(socket.id);
    socket.join(GAME_CONSTANTS.DEFAULT_ROOM);

    console.log(`👤 ${player.username} a rejoint ${defaultRoom.name}`);

    // Send current room's player list to new player
    const existingPlayers = getPlayersInRoom(player.room).filter((p) => p.id !== socket.id);
    socket.emit('players:list', existingPlayers);

    // Notify other players in the room
    socket.to(player.room).emit('player:joined', {
        id: player.id,
        username: player.username,
        position: player.position,
        level: player.level,
        health: player.health,
        maxHealth: player.maxHealth,
    });

    // ========================================
    // PLAYER EVENTS
    // ========================================

    // Set username
    socket.on('player:setUsername', (data: { username: string }) => {
        const p = players.get(socket.id);
        if (!p) return;

        // Validate username
        const username = data.username.trim().slice(0, 20);
        if (username.length < 2) {
            socket.emit('error', { message: 'Username must be at least 2 characters' });
            return;
        }

        const oldUsername = p.username;
        p.username = username;

        console.log(`📝 ${oldUsername} est maintenant ${username}`);

        // Notify room of username change
        socket.to(p.room).emit('player:updated', {
            playerId: socket.id,
            username: username,
        });

        socket.emit('player:usernameSet', { username });
    });

    // Player movement with anti-cheat
    socket.on('player:move', (data: { x: number; y: number; timestamp?: number }) => {
        const p = players.get(socket.id);
        if (!p) return;

        const newPosition = { x: data.x, y: data.y };
        const timestamp = data.timestamp || Date.now();

        // Anti-cheat validation
        if (!validateMovement(p, newPosition, timestamp)) {
            // Reject movement and send back valid position
            socket.emit('player:positionCorrected', {
                x: p.position.x,
                y: p.position.y,
                reason: 'Invalid movement detected',
            });
            return;
        }

        // Update player position
        p.position = newPosition;
        p.lastUpdate = timestamp;

        // Broadcast to other players in the same room
        socket.to(p.room).emit('player:moved', {
            playerId: socket.id,
            x: data.x,
            y: data.y,
            timestamp: timestamp,
        });
    });

    // Velocity update (for smoother interpolation)
    socket.on('player:velocity', (data: { vx: number; vy: number }) => {
        const p = players.get(socket.id);
        if (!p) return;

        // Validate velocity
        const speed = Math.sqrt(data.vx * data.vx + data.vy * data.vy);
        if (speed > GAME_CONSTANTS.MAX_SPEED) {
            return; // Ignore invalid velocity
        }

        p.velocity = { x: data.vx, y: data.vy };

        // Broadcast velocity for prediction
        socket.to(p.room).emit('player:velocity', {
            playerId: socket.id,
            vx: data.vx,
            vy: data.vy,
        });
    });

    // ========================================
    // CHAT EVENTS
    // ========================================

    socket.on('chat:message', (data: { message: string; channel?: string }) => {
        const p = players.get(socket.id);
        if (!p) return;

        // Rate limiting
        const now = Date.now();
        const lastMessage = lastChatTime.get(socket.id) || 0;
        if (now - lastMessage < GAME_CONSTANTS.CHAT_COOLDOWN) {
            socket.emit('error', { message: 'Please wait before sending another message' });
            return;
        }

        // Validate message
        let message = data.message.trim();
        if (message.length === 0) return;
        if (message.length > GAME_CONSTANTS.CHAT_MAX_LENGTH) {
            message = message.slice(0, GAME_CONSTANTS.CHAT_MAX_LENGTH);
        }

        // Update last chat time
        lastChatTime.set(socket.id, now);

        const chatMsg: ChatMessage = {
            id: generateId(),
            playerId: socket.id,
            username: p.username,
            message: message,
            timestamp: now,
            room: p.room,
        };

        // Store in history
        const roomHistory = chatHistory.get(p.room) || [];
        roomHistory.push(chatMsg);
        if (roomHistory.length > 100) roomHistory.shift(); // Keep last 100 messages
        chatHistory.set(p.room, roomHistory);

        console.log(`💬 [${p.room}] ${p.username}: ${message}`);

        // Broadcast to room
        io.to(p.room).emit('chat:message', {
            id: chatMsg.id,
            playerId: socket.id,
            username: p.username,
            message: message,
            timestamp: now,
        });
    });

    // Get chat history
    socket.on('chat:history', () => {
        const p = players.get(socket.id);
        if (!p) return;

        const history = chatHistory.get(p.room) || [];
        socket.emit('chat:history', history.slice(-50)); // Send last 50 messages
    });

    // ========================================
    // ROOM EVENTS
    // ========================================

    socket.on('room:join', (data: { roomId: string }) => {
        const p = players.get(socket.id);
        if (!p) return;

        const targetRoom = rooms.get(data.roomId);
        if (!targetRoom) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (targetRoom.playerIds.size >= targetRoom.maxPlayers) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }

        // Leave current room
        const currentRoom = rooms.get(p.room);
        if (currentRoom) {
            currentRoom.playerIds.delete(socket.id);
            socket.leave(p.room);
            socket.to(p.room).emit('player:left', { playerId: socket.id });
        }

        // Join new room
        p.room = data.roomId;
        targetRoom.playerIds.add(socket.id);
        socket.join(data.roomId);

        console.log(`🏠 ${p.username} a rejoint la room: ${targetRoom.name}`);

        // Send room's player list
        const roomPlayers = getPlayersInRoom(data.roomId).filter((pl) => pl.id !== socket.id);
        socket.emit('room:joined', {
            roomId: data.roomId,
            roomName: targetRoom.name,
            players: roomPlayers,
        });

        // Notify other players
        socket.to(data.roomId).emit('player:joined', {
            id: p.id,
            username: p.username,
            position: p.position,
            level: p.level,
            health: p.health,
            maxHealth: p.maxHealth,
        });
    });

    socket.on('room:leave', (data: { roomId: string }) => {
        const p = players.get(socket.id);
        if (!p || p.room !== data.roomId) return;

        const room = rooms.get(data.roomId);
        if (room) {
            room.playerIds.delete(socket.id);
        }

        socket.leave(data.roomId);
        socket.to(data.roomId).emit('player:left', { playerId: socket.id });

        // Move to default room
        const defaultRoom = rooms.get(GAME_CONSTANTS.DEFAULT_ROOM)!;
        p.room = GAME_CONSTANTS.DEFAULT_ROOM;
        defaultRoom.playerIds.add(socket.id);
        socket.join(GAME_CONSTANTS.DEFAULT_ROOM);

        console.log(`🚪 ${p.username} a quitté la room: ${data.roomId}`);

        socket.emit('room:left', { roomId: data.roomId });
    });

    socket.on('room:list', () => {
        const roomList = Array.from(rooms.values()).map((r) => ({
            id: r.id,
            name: r.name,
            playerCount: r.playerIds.size,
            maxPlayers: r.maxPlayers,
        }));
        socket.emit('room:list', roomList);
    });

    // ========================================
    // GAME EVENTS
    // ========================================

    socket.on('player:action', (data: { action: string; data?: any }) => {
        const p = players.get(socket.id);
        if (!p) return;

        console.log(`🎮 Action de ${p.username}: ${data.action}`);

        // Broadcast action to room
        socket.to(p.room).emit('player:action', {
            playerId: socket.id,
            action: data.action,
            data: data.data,
        });
    });

    // ========================================
    // PING / LATENCY
    // ========================================

    socket.on('ping', (timestamp: number) => {
        socket.emit('pong', timestamp);
    });

    socket.on('player:getLatency', () => {
        socket.emit('player:latency', { timestamp: Date.now() });
    });

    // ========================================
    // DISCONNECTION
    // ========================================

    socket.on('disconnect', async (reason) => {
        console.log(`🔌 Déconnexion: ${socket.id} (${reason})`);

        const p = players.get(socket.id);
        if (p) {
            // Save character position to database if authenticated
            if (p.characterId && p.userId) {
                try {
                    await prisma.character.update({
                        where: { id: p.characterId },
                        data: {
                            posX: p.position.x,
                            posY: p.position.y,
                            roomId: p.room,
                            health: p.health,
                        },
                    });
                    console.log(`💾 Position sauvegardée pour ${p.username}`);
                } catch (error) {
                    console.error('Error saving character position:', error);
                }
            }

            // Remove from room
            const room = rooms.get(p.room);
            if (room) {
                room.playerIds.delete(socket.id);
                socket.to(p.room).emit('player:left', { playerId: socket.id });
            }

            // Clean up
            players.delete(socket.id);
            lastChatTime.delete(socket.id);

            console.log(`👤 ${p.username} s'est déconnecté`);
        }
    });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log('🚀 ==========================================');
    console.log('🎮  MechaPizzAI MMORPG Server');
    console.log('🍕  Version: 0.2.0');
    console.log(`🌐  Port: ${PORT}`);
    console.log('🤖  Multiplayer Enabled!');
    console.log('============================================');
});

export { app, io };
