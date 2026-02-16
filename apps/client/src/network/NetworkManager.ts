/**
 * NetworkManager - Gestionnaire de connexion réseau temps réel
 * 
 * Gère :
 * - La connexion Socket.io au serveur
 * - La synchronisation des joueurs (positions, actions)
 * - Le chat en temps réel
 * - La gestion des rooms
 * - L'anti-cheat côté client
 */

import type { Socket } from 'socket.io-client';

interface Vector2 {
    x: number;
    y: number;
}

interface PlayerData {
    id: string;
    username: string;
    position: Vector2;
    velocity?: Vector2;
    level?: number;
    health?: number;
    maxHealth?: number;
}

interface ChatMessageData {
    id: string;
    playerId: string;
    username: string;
    message: string;
    timestamp: number;
}

interface RoomInfo {
    id: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
}

export class NetworkManager {
    private socket: Socket | null = null;
    private serverUrl: string;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private playerId: string | null = null;
    private currentRoom: string = 'main';
    private latency: number = 0;
    private lastPositionUpdate: number = 0;
    private positionUpdateRate: number = 50; // ms

    // Callbacks
    public onPlayerJoined: ((playerId: string, data: PlayerData) => void) | null = null;
    public onPlayerLeft: ((playerId: string) => void) | null = null;
    public onPlayerMoved: ((playerId: string, x: number, y: number, timestamp?: number) => void) | null = null;
    public onPlayerVelocity: ((playerId: string, vx: number, vy: number) => void) | null = null;
    public onPlayerUpdated: ((playerId: string, data: Partial<PlayerData>) => void) | null = null;
    public onPlayerAction: ((playerId: string, action: string, data?: any) => void) | null = null;
    public onChatMessage: ((data: ChatMessageData) => void) | null = null;
    public onChatHistory: ((messages: ChatMessageData[]) => void) | null = null;
    public onConnect: (() => void) | null = null;
    public onDisconnect: ((reason: string) => void) | null = null;
    public onError: ((error: any) => void) | null = null;
    public onRoomJoined: ((roomId: string, roomName: string, players: PlayerData[]) => void) | null = null;
    public onRoomLeft: ((roomId: string) => void) | null = null;
    public onRoomList: ((rooms: RoomInfo[]) => void) | null = null;
    public onPositionCorrected: ((x: number, y: number, reason: string) => void) | null = null;
    public onLatencyUpdate: ((latency: number) => void) | null = null;
    public onAuthSuccess: ((data: { userId: string; username: string; characterId?: string }) => void) | null = null;
    public onAuthError: ((error: { message: string }) => void) | null = null;

    constructor(serverUrl: string = 'http://localhost:3002') {
        this.serverUrl = serverUrl;
        console.log('🌐 NetworkManager initialisé');
    }

    /**
     * Connecte au serveur
     */
    public async connect(): Promise<boolean> {
        try {
            // Import dynamique de socket.io-client
            const { io } = await import('socket.io-client');

            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
            });

            this.setupEventHandlers();

            return new Promise((resolve) => {
                this.socket!.on('connect', () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.playerId = this.socket!.id || null;
                    console.log('✅ Connecté au serveur:', this.socket!.id);
                    if (this.onConnect) this.onConnect();
                    resolve(true);
                });

                this.socket!.on('connect_error', (error: any) => {
                    console.error('❌ Erreur de connexion:', error);
                    this.reconnectAttempts++;
                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        console.error('❌ Nombre max de tentatives atteint');
                        if (this.onError) this.onError(error);
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
            if (this.onError) this.onError(error);
            return false;
        }
    }

    /**
     * Configure les gestionnaires d'événements
     */
    private setupEventHandlers(): void {
        if (!this.socket) return;

        // Déconnexion
        this.socket.on('disconnect', (reason: string) => {
            console.log('🔌 Déconnecté:', reason);
            this.isConnected = false;
            if (this.onDisconnect) this.onDisconnect(reason);
        });

        // Nouveau joueur dans la room
        this.socket.on('player:joined', (data: PlayerData) => {
            console.log('👤 Joueur connecté:', data.username);
            if (this.onPlayerJoined) this.onPlayerJoined(data.id, data);
        });

        // Joueur parti
        this.socket.on('player:left', (data: { playerId: string }) => {
            console.log('👤 Joueur déconnecté:', data.playerId);
            if (this.onPlayerLeft) this.onPlayerLeft(data.playerId);
        });

        // Mise à jour d'un joueur (username, etc.)
        this.socket.on('player:updated', (data: { playerId: string; username: string }) => {
            if (this.onPlayerUpdated) {
                this.onPlayerUpdated(data.playerId, { username: data.username });
            }
        });

        // Mouvement d'un joueur
        this.socket.on('player:moved', (data: { playerId: string; x: number; y: number; timestamp?: number }) => {
            if (data.playerId !== this.playerId && this.onPlayerMoved) {
                this.onPlayerMoved(data.playerId, data.x, data.y, data.timestamp);
            }
        });

        // Vélocité d'un joueur (pour prédiction)
        this.socket.on('player:velocity', (data: { playerId: string; vx: number; vy: number }) => {
            if (data.playerId !== this.playerId && this.onPlayerVelocity) {
                this.onPlayerVelocity(data.playerId, data.vx, data.vy);
            }
        });

        // Action d'un joueur
        this.socket.on('player:action', (data: { playerId: string; action: string; data?: any }) => {
            if (data.playerId !== this.playerId && this.onPlayerAction) {
                this.onPlayerAction(data.playerId, data.action, data.data);
            }
        });

        // Correction de position (anti-cheat)
        this.socket.on('player:positionCorrected', (data: { x: number; y: number; reason: string }) => {
            console.warn('⚠️ Position corrigée par le serveur:', data.reason);
            if (this.onPositionCorrected) {
                this.onPositionCorrected(data.x, data.y, data.reason);
            }
        });

        // Message de chat
        this.socket.on('chat:message', (data: ChatMessageData) => {
            if (this.onChatMessage) {
                this.onChatMessage(data);
            }
        });

        // Historique du chat
        this.socket.on('chat:history', (messages: ChatMessageData[]) => {
            if (this.onChatHistory) {
                this.onChatHistory(messages);
            }
        });

        // Liste des joueurs existants
        this.socket.on('players:list', (players: PlayerData[]) => {
            console.log('📋 Liste des joueurs reçue:', players.length);
            players.forEach((player) => {
                if (player.id !== this.playerId && this.onPlayerJoined) {
                    this.onPlayerJoined(player.id, player);
                }
            });
        });

        // Room rejointe
        this.socket.on('room:joined', (data: { roomId: string; roomName: string; players: PlayerData[] }) => {
            this.currentRoom = data.roomId;
            console.log(`🏠 Room rejointe: ${data.roomName}`);
            if (this.onRoomJoined) {
                this.onRoomJoined(data.roomId, data.roomName, data.players);
            }
        });

        // Room quittée
        this.socket.on('room:left', (data: { roomId: string }) => {
            console.log(`🚪 Room quittée: ${data.roomId}`);
            if (this.onRoomLeft) {
                this.onRoomLeft(data.roomId);
            }
        });

        // Liste des rooms
        this.socket.on('room:list', (rooms: RoomInfo[]) => {
            if (this.onRoomList) {
                this.onRoomList(rooms);
            }
        });

        // Username défini
        this.socket.on('player:usernameSet', (data: { username: string }) => {
            console.log('📝 Username défini:', data.username);
        });

        // Ping/Pong pour la latence
        this.socket.on('pong', (timestamp: number) => {
            this.latency = Date.now() - timestamp;
            if (this.onLatencyUpdate) {
                this.onLatencyUpdate(this.latency);
            }
        });

        // Erreurs
        this.socket.on('error', (error: { message: string }) => {
            console.error('❌ Erreur serveur:', error.message);
            if (this.onError) this.onError(error);
        });

        // Authentification réussie
        this.socket.on('auth:success', (data: { userId: string; username: string; characterId?: string }) => {
            console.log('✅ Authentification réussie:', data.username);
            if (this.onAuthSuccess) this.onAuthSuccess(data);
        });

        // Erreur d'authentification
        this.socket.on('auth:error', (error: { message: string }) => {
            console.error('❌ Erreur d\'authentification:', error.message);
            if (this.onAuthError) this.onAuthError(error);
        });
    }

    /**
     * Authentifie le joueur avec un token JWT
     */
    public authenticate(token: string, characterId?: string): void {
        if (!this.isConnected || !this.socket) {
            console.error('❌ Non connecté au serveur');
            return;
        }
        this.socket.emit('auth:login', { token, characterId });
    }

    /**
     * Définit le username du joueur
     */
    public setUsername(username: string): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('player:setUsername', { username });
    }

    /**
     * Envoie la position du joueur (avec rate limiting)
     */
    public sendPlayerPosition(x: number, y: number): void {
        if (!this.isConnected || !this.socket) return;

        const now = Date.now();
        if (now - this.lastPositionUpdate < this.positionUpdateRate) {
            return; // Rate limiting
        }
        this.lastPositionUpdate = now;

        this.socket.emit('player:move', { x, y, timestamp: now });
    }

    /**
     * Envoie la vélocité du joueur
     */
    public sendPlayerVelocity(vx: number, vy: number): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('player:velocity', { vx, vy });
    }

    /**
     * Envoie un message de chat
     */
    public sendChatMessage(message: string): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('chat:message', { message });
    }

    /**
     * Demande l'historique du chat
     */
    public requestChatHistory(): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('chat:history');
    }

    /**
     * Envoie une action de joueur
     */
    public sendPlayerAction(action: string, data?: any): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('player:action', { action, data });
    }

    /**
     * Rejoint une room
     */
    public joinRoom(roomId: string): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('room:join', { roomId });
    }

    /**
     * Quitte une room
     */
    public leaveRoom(roomId: string): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('room:leave', { roomId });
    }

    /**
     * Demande la liste des rooms
     */
    public requestRoomList(): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('room:list');
    }

    /**
     * Envoie un ping pour mesurer la latence
     */
    public ping(): void {
        if (!this.isConnected || !this.socket) return;
        this.socket.emit('ping', Date.now());
    }

    /**
     * Démarre le ping régulier pour mesurer la latence
     */
    public startLatencyCheck(interval: number = 5000): number {
        return window.setInterval(() => {
            this.ping();
        }, interval);
    }

    /**
     * Arrête le ping régulier
     */
    public stopLatencyCheck(intervalId: number): void {
        window.clearInterval(intervalId);
    }

    /**
     * Déconnecte du serveur
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.playerId = null;
            console.log('🔌 Déconnexion manuelle');
        }
    }

    /**
     * Vérifie si connecté
     */
    public getIsConnected(): boolean {
        return this.isConnected;
    }

    /**
     * Retourne l'ID du joueur
     */
    public getPlayerId(): string | null {
        return this.playerId;
    }

    /**
     * Retourne la room actuelle
     */
    public getCurrentRoom(): string {
        return this.currentRoom;
    }

    /**
     * Retourne la latence actuelle
     */
    public getLatency(): number {
        return this.latency;
    }

    /**
     * Change l'URL du serveur
     */
    public setServerUrl(url: string): void {
        this.serverUrl = url;
    }

    /**
     * Change le rate limiting des positions
     */
    public setPositionUpdateRate(rate: number): void {
        this.positionUpdateRate = rate;
    }
}
