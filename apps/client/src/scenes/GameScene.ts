import Phaser from 'phaser';
import { NetworkManager } from '../network/NetworkManager';

/**
 * GameScene - Version Multijoueur
 * 
 * Features :
 * - Personnage SVG stylisé
 * - Environnement cyberpunk avec néons
 * - Multijoueur temps réel
 * - Chat intégré
 * - Minimap avec positions des joueurs
 */

interface OtherPlayer {
    container: Phaser.GameObjects.Container;
    targetX: number;
    targetY: number;
    velocityX: number;
    velocityY: number;
    username: string;
    lastUpdate: number;
}

interface ChatMessage {
    id: string;
    playerId: string;
    username: string;
    message: string;
    timestamp: number;
}

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Container;
    private playerSprite!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private otherPlayers: Map<string, OtherPlayer> = new Map();
    private isPaused: boolean = false;
    private mapContainer!: Phaser.GameObjects.Container;

    // Network
    private networkManager: NetworkManager | null = null;
    private isConnected: boolean = false;
    private latencyCheckInterval: number | null = null;
    private lastPositionSend: number = 0;
    private positionSendRate: number = 50; // ms

    // Chat
    private chatContainer!: Phaser.GameObjects.Container;
    private chatMessages: ChatMessage[] = [];
    private chatVisible: boolean = false;
    private chatInput: HTMLInputElement | null = null;

    // Minimap
    private minimapPlayers: Map<string, Phaser.GameObjects.Rectangle> = new Map();

    // Username
    private playerUsername: string = 'Agent You';

    // Player Class Selection
    private playerClass: 'knight' | 'mage' | 'rogue' | 'engineer' = 'knight';
    private isMoving: boolean = false;
    private lastDirection: string = 'down';

    constructor() {
        super({ key: 'GameScene' });
    }

    preload(): void {
        // Les assets sont déjà chargés dans PreloadScene
        // On ne recharge que si nécessaire (fallback)

        // Sprites personnages - vérifier si déjà chargés
        if (!this.textures.exists('player-knight')) {
            this.load.spritesheet('player-knight', '/assets/characters/player-knight.png', {
                frameWidth: 64,
                frameHeight: 64
            });
        }
        if (!this.textures.exists('player-mage')) {
            this.load.spritesheet('player-mage', '/assets/characters/player-mage.png', {
                frameWidth: 64,
                frameHeight: 64
            });
        }
        if (!this.textures.exists('player-rogue')) {
            this.load.spritesheet('player-rogue', '/assets/characters/player-rogue.png', {
                frameWidth: 64,
                frameHeight: 64
            });
        }
        if (!this.textures.exists('player-engineer')) {
            this.load.spritesheet('player-engineer', '/assets/characters/player-engineer.png', {
                frameWidth: 64,
                frameHeight: 64
            });
        }

        // Tilesets
        if (!this.textures.exists('tileset-urban-ground')) {
            this.load.image('tileset-urban-ground', '/assets/tilesets/tileset-urban-ground.png');
        }
        if (!this.textures.exists('tileset-urban-walls')) {
            this.load.image('tileset-urban-walls', '/assets/tilesets/tileset-urban-walls.png');
        }

        // UI - seulement ce qui existe
        if (!this.textures.exists('ui-buttons')) {
            this.load.image('ui-buttons', '/assets/ui/ui-buttons.png');
        }
        if (!this.textures.exists('ui-minimap')) {
            this.load.image('ui-minimap', '/assets/ui/ui-minimap.png');
        }

        // Logo
        if (!this.textures.exists('logo-game')) {
            this.load.image('logo-game', '/assets/logo/logo-game.png');
        }

        // Assets legacy SVG - fallback
        if (!this.textures.exists('player')) {
            this.load.svg('player', '/assets/player.svg', { width: 64, height: 96 });
        }
        if (!this.textures.exists('logo')) {
            this.load.svg('logo', '/assets/logo.svg', { width: 200, height: 100 });
        }
    }

    create(): void {
        console.log('🎮 GameScene: Début du jeu multijoueur !');

        this.createEnvironment();
        this.createPlayer();
        this.setupControls();
        this.createHUD();
        this.createMinimap();
        this.createChatUI();
        this.setupNetwork();

        // Animation d'entrée
        this.cameras.main.fadeIn(500, 10, 14, 26);

        // Message de bienvenue
        this.showWelcomeMessage();
    }

    update(time: number, delta: number): void {
        if (this.isPaused) return;

        this.handlePlayerMovement();
        this.updateEnvironmentAnimations();
        this.updateOtherPlayers(delta);
        this.sendPlayerPosition();
        this.updateMinimap();
    }

    // ============================================
    // NETWORK SETUP
    // ============================================

    private setupNetwork(): void {
        // Get network manager from window (set in main.ts)
        this.networkManager = (window as any).networkManager as NetworkManager;

        if (!this.networkManager) {
            console.warn('⚠️ NetworkManager non disponible, création d\'une nouvelle instance');
            this.networkManager = new NetworkManager();
            (window as any).networkManager = this.networkManager;
        }

        // Setup callbacks
        this.networkManager.onPlayerJoined = (playerId, data) => {
            this.addOtherPlayer(playerId, data);
        };

        this.networkManager.onPlayerLeft = (playerId) => {
            this.removeOtherPlayer(playerId);
        };

        this.networkManager.onPlayerMoved = (playerId, x, y, timestamp) => {
            this.updateOtherPlayerPosition(playerId, x, y, timestamp);
        };

        this.networkManager.onPlayerVelocity = (playerId, vx, vy) => {
            this.updateOtherPlayerVelocity(playerId, vx, vy);
        };

        this.networkManager.onPlayerUpdated = (playerId, data) => {
            if (data.username) {
                this.updateOtherPlayerUsername(playerId, data.username);
            }
        };

        this.networkManager.onChatMessage = (data) => {
            this.addChatMessage(data);
        };

        this.networkManager.onPositionCorrected = (x, y, reason) => {
            console.log('Position corrigée:', reason);
            this.player.setPosition(x, y);
        };

        this.networkManager.onConnect = () => {
            this.isConnected = true;
            this.showNotification('✅ Connecté au serveur');

            // Start latency check
            this.latencyCheckInterval = this.networkManager!.startLatencyCheck(5000);

            // Request chat history
            this.networkManager!.requestChatHistory();
        };

        this.networkManager.onDisconnect = (reason) => {
            this.isConnected = false;
            this.showNotification('🔌 Déconnecté: ' + reason);
            if (this.latencyCheckInterval) {
                this.networkManager!.stopLatencyCheck(this.latencyCheckInterval);
            }
        };

        // Connect if not already connected
        if (!this.networkManager.getIsConnected()) {
            this.networkManager.connect().then((success) => {
                if (success) {
                    // Set username if we have one stored
                    const storedUsername = localStorage.getItem('playerUsername');
                    if (storedUsername) {
                        this.playerUsername = storedUsername;
                        this.networkManager!.setUsername(storedUsername);
                        this.updatePlayerUsername(storedUsername);
                    }
                }
            });
        } else {
            this.isConnected = true;
            this.networkManager.requestChatHistory();
        }
    }

    private sendPlayerPosition(): void {
        if (!this.isConnected || !this.networkManager) return;

        const now = Date.now();
        if (now - this.lastPositionSend < this.positionSendRate) return;
        this.lastPositionSend = now;

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        this.networkManager.sendPlayerPosition(this.player.x, this.player.y);

        // Also send velocity for prediction
        this.networkManager.sendPlayerVelocity(body.velocity.x, body.velocity.y);
    }

    // ============================================
    // OTHER PLAYERS MANAGEMENT
    // ============================================

    private addOtherPlayer(playerId: string, data: any): void {
        if (this.otherPlayers.has(playerId)) return;

        console.log('👤 Ajout du joueur:', data.username || playerId);

        const container = this.add.container(data.position?.x || 0, data.position?.y || 0);

        // Ombre
        const shadow = this.add.ellipse(0, 45, 40, 15, 0x000000, 0.3);
        container.add(shadow);

        // Sprite (plus petit pour différencier)
        const sprite = this.add.image(0, 0, 'player');
        sprite.setScale(0.7);
        sprite.setTint(0x00D4FF); // Teinte bleue pour les autres joueurs
        container.add(sprite);

        // Nom
        const nameText = this.add.text(0, -60, data.username || `Agent ${playerId.slice(0, 6)}`, {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#00D4FF',
            backgroundColor: '#00000080',
            padding: { x: 8, y: 4 },
        });
        nameText.setOrigin(0.5);
        container.add(nameText);

        // Niveau
        const levelBadge = this.add.text(25, -50, String(data.level || 1), {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '11px',
            color: '#0A0E1A',
            backgroundColor: '#00D4FF',
            padding: { x: 6, y: 2 },
        });
        levelBadge.setOrigin(0.5);
        container.add(levelBadge);

        // Animation idle
        this.tweens.add({
            targets: sprite,
            y: { from: 0, to: -3 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.mapContainer.add(container);

        this.otherPlayers.set(playerId, {
            container,
            targetX: data.position?.x || 0,
            targetY: data.position?.y || 0,
            velocityX: 0,
            velocityY: 0,
            username: data.username || `Agent ${playerId.slice(0, 6)}`,
            lastUpdate: Date.now(),
        });

        // Notification
        this.showNotification(`👤 ${data.username || 'Un agent'} a rejoint`);
    }

    private removeOtherPlayer(playerId: string): void {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (!otherPlayer) return;

        console.log('👤 Suppression du joueur:', playerId);

        otherPlayer.container.destroy();
        this.otherPlayers.delete(playerId);

        // Remove from minimap
        const minimapDot = this.minimapPlayers.get(playerId);
        if (minimapDot) {
            minimapDot.destroy();
            this.minimapPlayers.delete(playerId);
        }
    }

    private updateOtherPlayerPosition(playerId: string, x: number, y: number, timestamp?: number): void {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (!otherPlayer) {
            // Player not found, request might be pending
            return;
        }

        otherPlayer.targetX = x;
        otherPlayer.targetY = y;
        otherPlayer.lastUpdate = timestamp || Date.now();
    }

    private updateOtherPlayerVelocity(playerId: string, vx: number, vy: number): void {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (!otherPlayer) return;

        otherPlayer.velocityX = vx;
        otherPlayer.velocityY = vy;
    }

    private updateOtherPlayerUsername(playerId: string, username: string): void {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (!otherPlayer) return;

        otherPlayer.username = username;

        // Update name text
        const container = otherPlayer.container;
        const nameText = container.list.find((child) =>
            child instanceof Phaser.GameObjects.Text && child.y === -60
        ) as Phaser.GameObjects.Text;

        if (nameText) {
            nameText.setText(username);
        }
    }

    private updateOtherPlayers(delta: number): void {
        const now = Date.now();
        const deltaSeconds = delta / 1000;

        this.otherPlayers.forEach((otherPlayer, playerId) => {
            const container = otherPlayer.container;

            // Interpolation avec prédiction
            const timeSinceUpdate = (now - otherPlayer.lastUpdate) / 1000;

            // Position prédite basée sur la vélocité
            const predictedX = otherPlayer.targetX + otherPlayer.velocityX * timeSinceUpdate;
            const predictedY = otherPlayer.targetY + otherPlayer.velocityY * timeSinceUpdate;

            // Interpolation douce vers la position prédite
            const lerpFactor = 0.15;
            const newX = container.x + (predictedX - container.x) * lerpFactor;
            const newY = container.y + (predictedY - container.y) * lerpFactor;

            container.setPosition(newX, newY);

            // Flip sprite based on movement direction
            const sprite = container.list.find((child) =>
                child instanceof Phaser.GameObjects.Image
            ) as Phaser.GameObjects.Image;

            if (sprite && otherPlayer.velocityX !== 0) {
                sprite.setFlipX(otherPlayer.velocityX < 0);
            }
        });
    }

    // ============================================
    // CHAT SYSTEM
    // ============================================

    private createChatUI(): void {
        const { width, height } = this.cameras.main;

        // Chat container
        this.chatContainer = this.add.container(20, height - 250);
        this.chatContainer.setScrollFactor(0);
        this.chatContainer.setDepth(1000);
        this.chatContainer.setVisible(false);

        // Chat background
        const bg = this.add.rectangle(0, 0, 350, 220, 0x111827, 0.9);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(1, 0x00D4FF, 0.3);
        this.chatContainer.add(bg);

        // Chat title
        const title = this.add.text(10, 10, '💬 Chat', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#00D4FF',
            fontStyle: 'bold',
        });
        this.chatContainer.add(title);

        // Close button
        const closeBtn = this.add.text(330, 10, '✕', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#6B7280',
        });
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.toggleChat());
        closeBtn.on('pointerover', () => closeBtn.setColor('#EF4444'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#6B7280'));
        this.chatContainer.add(closeBtn);

        // Create HTML input for chat
        this.createChatInput();

        // Chat toggle button
        const chatBtn = this.add.text(width - 100, height - 40, '💬 Chat (T)', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '12px',
            color: '#6B7280',
            backgroundColor: '#111827',
            padding: { x: 10, y: 5 },
        });
        chatBtn.setScrollFactor(0);
        chatBtn.setDepth(1000);
        chatBtn.setInteractive({ useHandCursor: true });
        chatBtn.on('pointerdown', () => this.toggleChat());
        chatBtn.on('pointerover', () => chatBtn.setColor('#00D4FF'));
        chatBtn.on('pointerout', () => chatBtn.setColor('#6B7280'));
    }

    private createChatInput(): void {
        // Remove existing input if any
        if (this.chatInput) {
            this.chatInput.remove();
        }

        // Create HTML input element
        this.chatInput = document.createElement('input');
        this.chatInput.type = 'text';
        this.chatInput.placeholder = 'Tapez votre message...';
        this.chatInput.style.position = 'absolute';
        this.chatInput.style.left = '40px';
        this.chatInput.style.bottom = '40px';
        this.chatInput.style.width = '310px';
        this.chatInput.style.padding = '8px 12px';
        this.chatInput.style.backgroundColor = '#1F2937';
        this.chatInput.style.border = '1px solid #00D4FF';
        this.chatInput.style.borderRadius = '4px';
        this.chatInput.style.color = '#FFFFFF';
        this.chatInput.style.fontFamily = 'Segoe UI, sans-serif';
        this.chatInput.style.fontSize = '14px';
        this.chatInput.style.outline = 'none';
        this.chatInput.style.display = 'none';
        this.chatInput.style.zIndex = '10000';

        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            } else if (e.key === 'Escape') {
                this.toggleChat();
            }
        });

        document.getElementById('game-container')?.appendChild(this.chatInput);
    }

    private toggleChat(): void {
        this.chatVisible = !this.chatVisible;
        this.chatContainer.setVisible(this.chatVisible);

        if (this.chatInput) {
            this.chatInput.style.display = this.chatVisible ? 'block' : 'none';
            if (this.chatVisible) {
                this.chatInput.focus();
            } else {
                this.chatInput.blur();
            }
        }

        // Pause game when chat is open
        this.isPaused = this.chatVisible;
    }

    private sendChatMessage(): void {
        if (!this.chatInput || !this.networkManager) return;

        const message = this.chatInput.value.trim();
        if (message.length === 0) return;

        this.networkManager.sendChatMessage(message);
        this.chatInput.value = '';
    }

    private addChatMessage(data: ChatMessage): void {
        this.chatMessages.push(data);
        if (this.chatMessages.length > 50) {
            this.chatMessages.shift();
        }

        this.updateChatDisplay();

        // Show notification if chat is closed
        if (!this.chatVisible) {
            this.showNotification(`💬 ${data.username}: ${data.message.slice(0, 30)}${data.message.length > 30 ? '...' : ''}`);
        }
    }

    private updateChatDisplay(): void {
        // Remove old message texts
        const oldMessages = this.chatContainer.list.filter((child) =>
            child instanceof Phaser.GameObjects.Text && child.y > 30 && child.y < 200
        );
        oldMessages.forEach((msg) => msg.destroy());

        // Display last 8 messages
        const messagesToShow = this.chatMessages.slice(-8);
        const { width, height } = this.cameras.main;

        messagesToShow.forEach((msg, index) => {
            const y = 40 + index * 22;
            const isLocalPlayer = msg.playerId === this.networkManager?.getPlayerId();
            const color = isLocalPlayer ? '#00D4FF' : '#9CA3AF';

            const text = this.add.text(10, y, `${msg.username}: ${msg.message}`, {
                fontFamily: '"Segoe UI", sans-serif',
                fontSize: '12px',
                color: color,
                wordWrap: { width: 330 },
            });
            this.chatContainer.add(text);
        });
    }

    // ============================================
    // ENVIRONMENT
    // ============================================

    private createEnvironment(): void {
        const { width, height } = this.cameras.main;

        this.mapContainer = this.add.container(0, 0);

        // Sol avec tileset ou grille de fallback
        this.createGround();

        // Bâtiments cyberpunk avec tileset ou rectangles
        this.createBuildings();

        // Néons et lumières
        this.createNeonLights();

        // Configuration de la caméra
        this.cameras.main.setBounds(-1000, -1000, 2000, 2000);
    }

    private createGround(): void {
        // Fallback: grille simple - le tileset est trop grand pour être utilisé comme tuiles
        const gridGraphics = this.add.graphics();

        // Fond sombre
        const bg = this.add.rectangle(0, 0, 2000, 2000, 0x0A0E1A);
        this.mapContainer.add(bg);

        // Grille cyberpunk
        gridGraphics.lineStyle(1, 0x1F2937, 0.5);

        for (let x = -1000; x <= 1000; x += 50) {
            gridGraphics.moveTo(x, -1000);
            gridGraphics.lineTo(x, 1000);
        }
        for (let y = -1000; y <= 1000; y += 50) {
            gridGraphics.moveTo(-1000, y);
            gridGraphics.lineTo(1000, y);
        }
        gridGraphics.strokePath();
        this.mapContainer.add(gridGraphics);

        // Ajouter quelques dalles décoratives au sol
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 1800;
            const y = (Math.random() - 0.5) * 1800;
            const size = 50 + Math.random() * 100;

            const dalle = this.add.rectangle(x, y, size, size, 0x1F2937, 0.3);
            dalle.setStrokeStyle(1, 0x00D4FF, 0.2);
            this.mapContainer.add(dalle);
        }
    }

    private createBuildings(): void {
        // Vérifier si le tileset de murs existe
        if (this.textures.exists('tileset-urban-walls')) {
            this.createBuildingsWithTileset();
        } else {
            this.createCyberpunkBuildingsFallback();
        }
    }

    private createBuildingsWithTileset(): void {
        // Le tileset est trop grand, utiliser le fallback
        this.createCyberpunkBuildingsFallback();
    }

    private createCyberpunkBuildingsFallback(): void {
        const buildingPositions = [
            { x: -400, y: -300, w: 120, h: 200, color: 0x111827 },
            { x: 300, y: -400, w: 100, h: 250, color: 0x1F2937 },
            { x: -200, y: 350, w: 140, h: 180, color: 0x111827 },
            { x: 450, y: 200, w: 90, h: 220, color: 0x1F2937 },
            { x: -500, y: 150, w: 110, h: 190, color: 0x111827 },
            { x: 150, y: -250, w: 130, h: 210, color: 0x1F2937 },
        ];

        buildingPositions.forEach((pos, index) => {
            const building = this.createStyledBuildingFallback(pos.x, pos.y, pos.w, pos.h, pos.color, index);
            this.mapContainer.add(building);
        });
    }

    private createStyledBuildingFallback(x: number, y: number, w: number, h: number, color: number, index: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Corps du bâtiment
        const body = this.add.rectangle(0, 0, w, h, color);
        body.setStrokeStyle(2, 0x00D4FF, 0.3);
        container.add(body);

        // Bande lumineuse en haut
        const topLight = this.add.rectangle(0, -h / 2 + 5, w - 10, 6, 0x00D4FF, 0.8);
        container.add(topLight);

        // Fenêtres avec lumières aléatoires
        const rows = Math.floor(h / 30);
        const cols = Math.floor(w / 25);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (Math.random() > 0.4) {
                    const winX = (col - cols / 2 + 0.5) * 20;
                    const winY = (row - rows / 2 + 0.5) * 25;
                    const isLit = Math.random() > 0.6;
                    const winColor = isLit ? (Math.random() > 0.5 ? 0x00D4FF : 0xFF6B35) : 0x374151;
                    const winAlpha = isLit ? 0.9 : 0.3;

                    const windowRect = this.add.rectangle(winX, winY, 12, 16, winColor, winAlpha);
                    container.add(windowRect);

                    // Animation clignotante pour certaines fenêtres
                    if (isLit && Math.random() > 0.8) {
                        this.tweens.add({
                            targets: windowRect,
                            alpha: { from: winAlpha, to: winAlpha * 0.3 },
                            duration: 1000 + Math.random() * 2000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut',
                        });
                    }
                }
            }
        }

        return container;
    }

    private createNeonLights(): void {
        const neonPositions = [
            { x: -300, y: -200, color: 0x00D4FF, radius: 80 },
            { x: 400, y: -100, color: 0xFF6B35, radius: 100 },
            { x: -100, y: 300, color: 0x00D4FF, radius: 60 },
            { x: 300, y: 400, color: 0xFF6B35, radius: 90 },
        ];

        neonPositions.forEach((neon) => {
            // Cercle de lumière
            const light = this.add.circle(neon.x, neon.y, neon.radius, neon.color, 0.1);
            this.mapContainer.add(light);

            // Point lumineux central
            const core = this.add.circle(neon.x, neon.y, 8, neon.color, 0.9);
            this.mapContainer.add(core);

            // Animation pulsante
            this.tweens.add({
                targets: light,
                scale: { from: 1, to: 1.2 },
                alpha: { from: 0.1, to: 0.2 },
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });

            this.tweens.add({
                targets: core,
                alpha: { from: 0.9, to: 0.5 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        });
    }

    // ============================================
    // PLAYER
    // ============================================

    private createPlayer(): void {
        // Récupérer la classe sélectionnée depuis le localStorage
        const storedClass = localStorage.getItem('playerClass') as 'knight' | 'mage' | 'rogue' | 'engineer';
        if (storedClass && ['knight', 'mage', 'rogue', 'engineer'].includes(storedClass)) {
            this.playerClass = storedClass;
        }

        this.player = this.add.container(0, 0);

        // Ombre sous le personnage
        const shadow = this.add.ellipse(0, 25, 40, 15, 0x000000, 0.3);
        this.player.add(shadow);

        // Sprite du joueur avec spritesheet NanoBanana
        const spriteKey = `player-${this.playerClass}`;
        console.log(`🔍 Vérification du sprite: ${spriteKey}, existe: ${this.textures.exists(spriteKey)}`);

        if (this.textures.exists(spriteKey)) {
            // Créer le sprite avec la première frame
            this.playerSprite = this.add.sprite(0, 0, spriteKey);
            this.playerSprite.setScale(1.5); // Légèrement plus grand pour meilleure visibilité
            this.player.add(this.playerSprite);

            console.log(`✅ Sprite créé pour ${spriteKey}`);

            // Démarrer l'animation idle si elle existe
            const animKey = `${this.playerClass}-idle-down`;
            if (this.anims.exists(animKey)) {
                this.playerSprite.play(animKey, true);
                console.log(`🎬 Animation démarrée: ${animKey}`);
            } else {
                console.warn(`⚠️ Animation non trouvée: ${animKey}`);
                // Afficher la frame 0 par défaut
                this.playerSprite.setFrame(0);
            }
        } else {
            // Fallback sur l'ancien sprite SVG
            console.warn(`⚠️ Spritesheet non trouvé: ${spriteKey}, utilisation du fallback`);
            const fallbackSprite = this.add.image(0, 0, 'player');
            fallbackSprite.setScale(0.8);
            this.player.add(fallbackSprite);
        }

        // Nom du joueur
        const nameText = this.add.text(0, -55, this.playerUsername, {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#FFFFFF',
            backgroundColor: '#00000080',
            padding: { x: 8, y: 4 },
        });
        nameText.setOrigin(0.5);
        nameText.setName('playerName');
        this.player.add(nameText);

        // Indicateur de niveau avec couleur selon la classe
        const classColors = {
            knight: '#00D4FF', // Cyan
            mage: '#FF1493',   // Rose
            rogue: '#00FF00',  // Vert
            engineer: '#FF6B35' // Orange
        };
        const levelBadge = this.add.text(30, -45, '1', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '11px',
            color: '#0A0E1A',
            backgroundColor: classColors[this.playerClass],
            padding: { x: 6, y: 2 },
        });
        levelBadge.setOrigin(0.5);
        this.player.add(levelBadge);

        // Caméra suit le joueur
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Physics
        this.physics.world.enable(this.player);
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setSize(32, 32);
    }

    /**
     * Joue une animation sur le sprite du joueur
     */
    private playAnimation(animType: 'idle' | 'walk' | 'attack' | 'skill', direction: string): void {
        if (!this.playerSprite) return;

        const animKey = `${this.playerClass}-${animType}-${direction}`;
        if (this.anims.exists(animKey)) {
            this.playerSprite.play(animKey, true);
        }
    }

    /**
     * Définit la classe du joueur
     */
    public setPlayerClass(playerClass: 'knight' | 'mage' | 'rogue' | 'engineer'): void {
        this.playerClass = playerClass;
        localStorage.setItem('playerClass', playerClass);

        // Mettre à jour le sprite si possible
        const spriteKey = `player-${playerClass}`;
        if (this.playerSprite && this.textures.exists(spriteKey)) {
            this.playerSprite.setTexture(spriteKey);
            this.playAnimation('idle', 'down');
        }
    }

    private updatePlayerUsername(username: string): void {
        this.playerUsername = username;
        const nameText = this.player.getByName('playerName') as Phaser.GameObjects.Text;
        if (nameText) {
            nameText.setText(username);
        }
    }

    // ============================================
    // CONTROLS
    // ============================================

    private setupControls(): void {
        // Flèches directionnelles
        this.cursors = this.input.keyboard!.createCursorKeys();

        // WASD
        this.wasd = {
            W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // Touche Échap pour le menu pause
        this.input.keyboard!.on('keydown-ESC', () => {
            if (this.chatVisible) {
                this.toggleChat();
            } else {
                this.togglePause();
            }
        });

        // Touche T pour le chat
        this.input.keyboard!.on('keydown-T', () => {
            if (!this.chatVisible) {
                this.toggleChat();
            }
        });

        // Touche Entrée pour envoyer un message
        this.input.keyboard!.on('keydown-ENTER', () => {
            if (this.chatVisible && document.activeElement !== this.chatInput) {
                this.toggleChat();
            }
        });
    }

    private handlePlayerMovement(): void {
        const speed = 200;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        // Reset velocity
        body.setVelocity(0);

        let moving = false;
        let direction = this.lastDirection;

        // Mouvement horizontal
        if (this.cursors.left?.isDown || this.wasd.A.isDown) {
            body.setVelocityX(-speed);
            direction = 'left';
            moving = true;
        } else if (this.cursors.right?.isDown || this.wasd.D.isDown) {
            body.setVelocityX(speed);
            direction = 'right';
            moving = true;
        }

        // Mouvement vertical
        if (this.cursors.up?.isDown || this.wasd.W.isDown) {
            body.setVelocityY(-speed);
            direction = 'up';
            moving = true;
        } else if (this.cursors.down?.isDown || this.wasd.S.isDown) {
            body.setVelocityY(speed);
            direction = 'down';
            moving = true;
        }

        // Normalisation pour éviter la vitesse plus rapide en diagonale
        body.velocity.normalize().scale(speed);

        // Gérer les animations du sprite
        if (this.playerSprite) {
            if (moving) {
                if (!this.isMoving || direction !== this.lastDirection) {
                    this.playAnimation('walk', direction);
                    this.isMoving = true;
                    this.lastDirection = direction;
                }
                // Flip sprite si on va à gauche
                this.playerSprite.setFlipX(direction === 'left');
            } else {
                if (this.isMoving) {
                    this.playAnimation('idle', this.lastDirection);
                    this.isMoving = false;
                }
            }
        } else {
            // Fallback pour l'ancien sprite Image
            const playerImage = this.player.list.find((child) =>
                child instanceof Phaser.GameObjects.Image
            ) as Phaser.GameObjects.Image;
            if (playerImage && body.velocity.x !== 0) {
                playerImage.setFlipX(body.velocity.x < 0);
            }
        }
    }

    private updateEnvironmentAnimations(): void {
        // Mettre à jour les animations d'environnement si nécessaire
    }

    // ============================================
    // HUD
    // ============================================

    private createHUD(): void {
        const { width, height } = this.cameras.main;

        // HUD Container (fixe à l'écran)
        const hudContainer = this.add.container(0, 0);
        hudContainer.setScrollFactor(0);
        hudContainer.setDepth(1000);

        // Barre de vie stylisée
        this.createStyledBar(hudContainer, 20, 20, 200, 24, 0xEF4444, 1, 'HP: 100/100');

        // Barre d'énergie
        this.createStyledBar(hudContainer, 20, 50, 200, 24, 0x00D4FF, 0.75, 'EN: 75/100');

        // Bouton pause
        const pauseBtn = this.add.text(width - 30, 30, '⏸️', {
            fontSize: '24px',
        }).setInteractive({ useHandCursor: true });
        pauseBtn.setOrigin(0.5);
        pauseBtn.on('pointerdown', () => this.togglePause());
        hudContainer.add(pauseBtn);

        // Instructions
        const instructions = this.add.text(20, height - 40, 'WASD / Flèches pour bouger • ESC pour pause • T pour chat', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '12px',
            color: '#6B7280',
        });
        hudContainer.add(instructions);

        // Connection status
        const statusText = this.add.text(width - 150, 20, '🟡 Connexion...', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '12px',
            color: '#6B7280',
        });
        statusText.setName('connectionStatus');
        statusText.setScrollFactor(0);
        statusText.setDepth(1000);

        // Update status periodically
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                const status = this.isConnected ? '🟢 En ligne' : '🔴 Hors ligne';
                const color = this.isConnected ? '#22C55E' : '#EF4444';
                statusText.setText(status);
                statusText.setColor(color);
            },
            loop: true,
        });
    }

    private createStyledBar(
        container: Phaser.GameObjects.Container,
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        fillPercent: number,
        label: string
    ): void {
        // Fond
        const bg = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x1F2937, 0.9);
        bg.setStrokeStyle(1, color, 0.3);
        container.add(bg);

        // Remplissage
        const fillWidth = (width - 4) * fillPercent;
        const fill = this.add.rectangle(x + 2 + fillWidth / 2, y + height / 2, fillWidth, height - 4, color, 0.9);
        container.add(fill);

        // Label
        const text = this.add.text(x + width / 2, y + height / 2, label, {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '11px',
            color: '#FFFFFF',
        });
        text.setOrigin(0.5);
        container.add(text);
    }

    // ============================================
    // MINIMAP
    // ============================================

    private createMinimap(): void {
        const { width, height } = this.cameras.main;

        const mapSize = 150;
        const mapX = width - mapSize - 20;
        const mapY = height - mapSize - 20;

        // Fond
        const bg = this.add.rectangle(mapX + mapSize / 2, mapY + mapSize / 2, mapSize, mapSize, 0x111827, 0.9);
        bg.setStrokeStyle(2, 0x00D4FF, 0.5);
        bg.setScrollFactor(0);
        bg.setDepth(1000);

        // Bordure néon
        const neon = this.add.rectangle(mapX + mapSize / 2, mapY + mapSize / 2, mapSize + 4, mapSize + 4, 0x00D4FF, 0.2);
        neon.setScrollFactor(0);
        neon.setDepth(999);

        // Label
        const label = this.add.text(mapX + mapSize / 2, mapY + mapSize / 2, 'MINIMAP', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '12px',
            color: '#6B7280',
        });
        label.setOrigin(0.5);
        label.setScrollFactor(0);
        label.setDepth(1001);

        // Player dot (will be updated)
        const playerDot = this.add.rectangle(mapX + mapSize / 2, mapY + mapSize / 2, 6, 6, 0xFF6B35);
        playerDot.setScrollFactor(0);
        playerDot.setDepth(1002);
        playerDot.setName('minimapPlayer');
    }

    private updateMinimap(): void {
        const mapSize = 150;
        const mapX = this.cameras.main.width - mapSize - 20;
        const mapY = this.cameras.main.height - mapSize - 20;
        const scale = mapSize / 2000; // Map is 2000x2000

        // Update player dot
        const playerDot = this.children.getByName('minimapPlayer') as Phaser.GameObjects.Rectangle;
        if (playerDot) {
            const x = mapX + mapSize / 2 + this.player.x * scale;
            const y = mapY + mapSize / 2 + this.player.y * scale;
            playerDot.setPosition(
                Phaser.Math.Clamp(x, mapX + 3, mapX + mapSize - 3),
                Phaser.Math.Clamp(y, mapY + 3, mapY + mapSize - 3)
            );
        }

        // Update other players dots
        this.otherPlayers.forEach((otherPlayer, playerId) => {
            let dot = this.minimapPlayers.get(playerId);
            if (!dot) {
                dot = this.add.rectangle(0, 0, 4, 4, 0x00D4FF);
                dot.setScrollFactor(0);
                dot.setDepth(1001);
                this.minimapPlayers.set(playerId, dot);
            }

            const x = mapX + mapSize / 2 + otherPlayer.container.x * scale;
            const y = mapY + mapSize / 2 + otherPlayer.container.y * scale;
            dot.setPosition(
                Phaser.Math.Clamp(x, mapX + 2, mapX + mapSize - 2),
                Phaser.Math.Clamp(y, mapY + 2, mapY + mapSize - 2)
            );
            dot.setVisible(true);
        });
    }

    // ============================================
    // UI HELPERS
    // ============================================

    private showWelcomeMessage(): void {
        const { width, height } = this.cameras.main;

        const container = this.add.container(width / 2, height / 2);
        container.setScrollFactor(0);
        container.setDepth(2000);

        // Fond
        const bg = this.add.rectangle(0, 0, 400, 150, 0x111827, 0.95);
        bg.setStrokeStyle(2, 0x00D4FF, 0.5);
        container.add(bg);

        // Titre
        const title = this.add.text(0, -30, 'Bienvenue à Neo-Pizzapolis !', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '24px',
            color: '#00D4FF',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);
        container.add(title);

        // Message
        const message = this.add.text(0, 10, 'Utilise WASD ou les flèches pour te déplacer\nAppuie sur T pour discuter avec les autres agents !', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#9CA3AF',
            align: 'center',
        });
        message.setOrigin(0.5);
        container.add(message);

        // Animation d'entrée
        container.setScale(0);
        container.setAlpha(0);

        this.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut',
        });

        // Disparition après 4 secondes
        this.time.delayedCall(4000, () => {
            this.tweens.add({
                targets: container,
                alpha: 0,
                scale: 0.8,
                duration: 300,
                ease: 'Power2',
                onComplete: () => container.destroy(),
            });
        });
    }

    private showNotification(text: string): void {
        const { width, height } = this.cameras.main;

        const notification = this.add.text(width / 2, 100, text, {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '16px',
            color: '#FFFFFF',
            backgroundColor: '#111827',
            padding: { x: 20, y: 10 },
        });
        notification.setOrigin(0.5);
        notification.setScrollFactor(0);
        notification.setDepth(3000);
        notification.setAlpha(0);

        this.tweens.add({
            targets: notification,
            alpha: 1,
            y: 80,
            duration: 300,
            ease: 'Power2',
        });

        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: notification,
                alpha: 0,
                y: 60,
                duration: 300,
                ease: 'Power2',
                onComplete: () => notification.destroy(),
            });
        });
    }

    // ============================================
    // PAUSE MENU
    // ============================================

    private togglePause(): void {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.showPauseMenu();
        } else {
            this.hidePauseMenu();
        }
    }

    private showPauseMenu(): void {
        const { width, height } = this.cameras.main;

        // Overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setScrollFactor(0);
        overlay.setDepth(2000);
        (this as any).pauseOverlay = overlay;

        // Menu
        const menuBg = this.add.rectangle(width / 2, height / 2, 350, 350, 0x111827, 0.95);
        menuBg.setStrokeStyle(2, 0x00D4FF, 0.5);
        menuBg.setScrollFactor(0);
        menuBg.setDepth(2001);
        (this as any).pauseMenu = menuBg;

        // Titre
        const title = this.add.text(width / 2, height / 2 - 130, 'PAUSE', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '32px',
            color: '#00D4FF',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(2001);

        // Username input
        const usernameLabel = this.add.text(width / 2, height / 2 - 80, 'Votre nom:', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#9CA3AF',
        });
        usernameLabel.setOrigin(0.5);
        usernameLabel.setScrollFactor(0);
        usernameLabel.setDepth(2001);

        // Create username input
        this.createUsernameInput();

        // Options
        const options = [
            { text: 'Reprendre', action: () => this.togglePause() },
            { text: 'Chat (T)', action: () => { this.togglePause(); this.toggleChat(); } },
            { text: 'Retour au menu', action: () => this.scene.start('MenuScene') },
        ];

        options.forEach((opt, i) => {
            const y = height / 2 + i * 50;
            const btn = this.add.text(width / 2, y, opt.text, {
                fontFamily: '"Segoe UI", sans-serif',
                fontSize: '20px',
                color: '#FFFFFF',
            });
            btn.setOrigin(0.5);
            btn.setScrollFactor(0);
            btn.setDepth(2001);
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#00D4FF'));
            btn.on('pointerout', () => btn.setColor('#FFFFFF'));
            btn.on('pointerdown', opt.action);
        });
    }

    private createUsernameInput(): void {
        // Remove existing input if any
        const existingInput = document.getElementById('username-input');
        if (existingInput) existingInput.remove();

        const input = document.createElement('input');
        input.id = 'username-input';
        input.type = 'text';
        input.value = this.playerUsername;
        input.placeholder = 'Entrez votre nom';
        input.style.position = 'absolute';
        input.style.left = '50%';
        input.style.top = '50%';
        input.style.transform = 'translate(-50%, -50%) translateY(-45px)';
        input.style.width = '200px';
        input.style.padding = '8px 12px';
        input.style.backgroundColor = '#1F2937';
        input.style.border = '1px solid #00D4FF';
        input.style.borderRadius = '4px';
        input.style.color = '#FFFFFF';
        input.style.fontFamily = 'Segoe UI, sans-serif';
        input.style.fontSize = '14px';
        input.style.outline = 'none';
        input.style.zIndex = '10000';

        input.addEventListener('change', () => {
            const newUsername = input.value.trim();
            if (newUsername.length >= 2) {
                this.playerUsername = newUsername;
                localStorage.setItem('playerUsername', newUsername);
                this.updatePlayerUsername(newUsername);
                if (this.networkManager) {
                    this.networkManager.setUsername(newUsername);
                }
            }
        });

        document.getElementById('game-container')?.appendChild(input);
        input.focus();
    }

    private hidePauseMenu(): void {
        if ((this as any).pauseOverlay) {
            (this as any).pauseOverlay.destroy();
        }

        // Remove username input
        const usernameInput = document.getElementById('username-input');
        if (usernameInput) usernameInput.remove();

        // Nettoyer tous les éléments de pause
        this.children.list
            .filter((child: any) => child.depth >= 2000)
            .forEach((child: any) => child.destroy());
    }

    // ============================================
    // CLEANUP
    // ============================================

    shutdown(): void {
        // Clean up chat input
        if (this.chatInput) {
            this.chatInput.remove();
        }

        // Remove username input
        const usernameInput = document.getElementById('username-input');
        if (usernameInput) usernameInput.remove();

        // Stop latency check
        if (this.latencyCheckInterval && this.networkManager) {
            this.networkManager.stopLatencyCheck(this.latencyCheckInterval);
        }

        console.log('🎮 GameScene: Shutdown');
    }
}
