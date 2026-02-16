/**
 * NetworkManager - Gestionnaire de connexion réseau
 * 
 * Gère :
 * - La connexion Socket.io au serveur
 * - La synchronisation des joueurs
 * - Le chat en temps réel
 * - Les événements de jeu
 */
export class NetworkManager {
    private socket: any = null;
    private serverUrl: string;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private playerId: string | null = null;

    // Callbacks
    public onPlayerJoined: ((playerId: string, data: any) => void) | null = null;
    public onPlayerLeft: ((playerId: string) => void) | null = null;
    public onPlayerMoved: ((playerId: string, x: number, y: number) => void) | null = null;
    public onChatMessage: ((playerId: string, username: string, message: string) => void) | null = null;
    public onConnect: (() => void) | null = null;
    public onDisconnect: (() => void) | null = null;
    public onError: ((error: any) => void) | null = null;

    constructor(serverUrl: string = 'http://localhost:3001') {
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
                this.socket.on('connect', () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    console.log('✅ Connecté au serveur:', this.socket.id);
                    this.playerId = this.socket.id;
                    if (this.onConnect) this.onConnect();
                    resolve(true);
                });

                this.socket.on('connect_error', (error: any) => {
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
            if (this.onDisconnect) this.onDisconnect();
        });

        // Nouveau joueur
        this.socket.on('player:joined', (data: { playerId: string; username: string; x: number; y: number }) => {
            console.log('👤 Joueur connecté:', data.username);
            if (this.onPlayerJoined) this.onPlayerJoined(data.playerId, data);
        });

        // Joueur parti
        this.socket.on('player:left', (data: { playerId: string }) => {
            console.log('👤 Joueur déconnecté:', data.playerId);
            if (this.onPlayerLeft) this.onPlayerLeft(data.playerId);
        });

        // Mouvement d'un joueur
        this.socket.on('player:moved', (data: { playerId: string; x: number; y: number }) => {
            if (data.playerId !== this.playerId && this.onPlayerMoved) {
                this.onPlayerMoved(data.playerId, data.x, data.y);
            }
        });

        // Message de chat
        this.socket.on('chat:message', (data: { playerId: string; username: string; message: string }) => {
            if (this.onChatMessage) {
                this.onChatMessage(data.playerId, data.username, data.message);
            }
        });

        // Liste des joueurs existants
        this.socket.on('players:list', (players: any[]) => {
            console.log('📋 Liste des joueurs:', players);
            players.forEach((player) => {
                if (player.id !== this.playerId && this.onPlayerJoined) {
                    this.onPlayerJoined(player.id, player);
                }
            });
        });

        // Ping/Pong pour la latence
        this.socket.on('pong', (timestamp: number) => {
            const latency = Date.now() - timestamp;
            console.log('📊 Latence:', latency, 'ms');
        });
    }

    /**
     * Envoie la position du joueur
     */
    public sendPlayerPosition(x: number, y: number): void {
        if (!this.isConnected || !this.socket) return;

        this.socket.emit('player:move', { x, y });
    }

    /**
     * Envoie un message de chat
     */
    public sendChatMessage(message: string): void {
        if (!this.isConnected || !this.socket) return;

        this.socket.emit('chat:message', { message });
    }

    /**
     * Envoie une action de joueur
     */
    public sendPlayerAction(action: string, data?: any): void {
        if (!this.isConnected || !this.socket) return;

        this.socket.emit('player:action', { action, data });
    }

    /**
     * Rejoint une room/guilde
     */
    public joinRoom(roomId: string): void {
        if (!this.isConnected || !this.socket) return;

        this.socket.emit('room:join', { roomId });
    }

    /**
     * Quitte une room/guilde
     */
    public leaveRoom(roomId: string): void {
        if (!this.isConnected || !this.socket) return;

        this.socket.emit('room:leave', { roomId });
    }

    /**
     * Envoie un ping pour mesurer la latence
     */
    public ping(): void {
        if (!this.isConnected || !this.socket) return;

        this.socket.emit('ping', Date.now());
    }

    /**
     * Déconnecte du serveur
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
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
     * Change l'URL du serveur
     */
    public setServerUrl(url: string): void {
        this.serverUrl = url;
    }
}