import Phaser from 'phaser';

/**
 * GameScene - Scène principale du jeu
 * 
 * Gère :
 * - La carte/level
 * - Le joueur local
 * - Les autres joueurs (multijoueur)
 * - Les interactions
 * - Le HUD
 */
export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Container;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private otherPlayers: Map<string, Phaser.GameObjects.Container> = new Map();
    private map!: Phaser.Tilemaps.Tilemap;
    private isPaused: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void {
        console.log('🎮 GameScene: Début du jeu !');

        // Création de la carte
        this.createMap();

        // Création du joueur
        this.createPlayer();

        // Configuration des contrôles
        this.setupControls();

        // Création du HUD
        this.createHUD();

        // Connexion au serveur (à implémenter)
        this.connectToServer();

        // Animation d'entrée
        this.cameras.main.fadeIn(500, 10, 14, 26);
    }

    update(time: number, delta: number): void {
        if (this.isPaused) return;

        this.handlePlayerMovement();
    }

    private createMap(): void {
        const { width, height } = this.cameras.main;

        // Pour l'instant, on crée une carte procédurale simple
        // Plus tard, on chargera des cartes Tiled

        // Fond
        this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x1F2937);

        // Grille de référence
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x374151, 0.5);

        for (let x = -1000; x <= 1000; x += 64) {
            graphics.moveTo(x, -1000);
            graphics.lineTo(x, 1000);
        }

        for (let y = -1000; y <= 1000; y += 64) {
            graphics.moveTo(-1000, y);
            graphics.lineTo(1000, y);
        }

        graphics.strokePath();

        // Quelques éléments décoratifs
        this.createDecorations();

        // Configuration de la caméra
        this.cameras.main.setBounds(-1000, -1000, 2000, 2000);
    }

    private createDecorations(): void {
        // Bâtiments/structures simples
        const colors = [0x111827, 0x1F2937, 0x374151];

        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(-800, 800);
            const y = Phaser.Math.Between(-800, 800);
            const width = Phaser.Math.Between(64, 192);
            const height = Phaser.Math.Between(64, 192);
            const color = Phaser.Utils.Array.GetRandom(colors);

            const building = this.add.rectangle(x, y, width, height, color);
            building.setStrokeStyle(2, 0x00D4FF, 0.3);

            // Lumière sur le bâtiment
            const light = this.add.circle(x, y - height / 2, 5, 0x00D4FF, 0.8);

            // Animation de la lumière
            this.tweens.add({
                targets: light,
                alpha: { from: 0.8, to: 0.3 },
                duration: Phaser.Math.Between(1000, 2000),
                yoyo: true,
                repeat: -1,
            });
        }
    }

    private createPlayer(): void {
        // Container pour le joueur (sprite + nom)
        this.player = this.add.container(0, 0);

        // Sprite du joueur (carré temporaire, sera remplacé par un vrai sprite)
        const playerSprite = this.add.rectangle(0, 0, 32, 48, 0x00D4FF);
        playerSprite.setStrokeStyle(2, 0xFFFFFF);

        // Nom du joueur
        const nameText = this.add.text(0, -35, 'Agent You', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#00000080',
            padding: { x: 4, y: 2 },
        });
        nameText.setOrigin(0.5);

        // Indicateur de niveau
        const levelBadge = this.add.text(20, -25, '1', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            color: '#0A0E1A',
            backgroundColor: '#FF6B35',
            padding: { x: 4, y: 1 },
        });
        levelBadge.setOrigin(0.5);

        this.player.add([playerSprite, nameText, levelBadge]);

        // Caméra suit le joueur
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Physics
        this.physics.world.enable(this.player);
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setSize(32, 48);
    }

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
            this.togglePause();
        });

        // Touche T pour le chat
        this.input.keyboard!.on('keydown-T', () => {
            this.openChat();
        });
    }

    private handlePlayerMovement(): void {
        const speed = 200;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        // Reset velocity
        body.setVelocity(0);

        // Mouvement horizontal
        if (this.cursors.left?.isDown || this.wasd.A.isDown) {
            body.setVelocityX(-speed);
        } else if (this.cursors.right?.isDown || this.wasd.D.isDown) {
            body.setVelocityX(speed);
        }

        // Mouvement vertical
        if (this.cursors.up?.isDown || this.wasd.W.isDown) {
            body.setVelocityY(-speed);
        } else if (this.cursors.down?.isDown || this.wasd.S.isDown) {
            body.setVelocityY(speed);
        }

        // Normalisation pour éviter la vitesse plus rapide en diagonale
        body.velocity.normalize().scale(speed);

        // Envoi de la position au serveur (à implémenter)
        // this.networkManager.sendPlayerPosition(this.player.x, this.player.y);
    }

    private createHUD(): void {
        const { width, height } = this.cameras.main;

        // HUD Container (fixe à l'écran)
        const hudContainer = this.add.container(0, 0);
        hudContainer.setScrollFactor(0);
        hudContainer.setDepth(1000);

        // Barre de vie
        const healthBarBg = this.add.rectangle(20, 20, 200, 20, 0x1F2937);
        healthBarBg.setOrigin(0, 0);
        const healthBarFill = this.add.rectangle(22, 22, 196, 16, 0xEF4444);
        healthBarFill.setOrigin(0, 0);

        // Barre d'énergie
        const energyBarBg = this.add.rectangle(20, 45, 200, 20, 0x1F2937);
        energyBarBg.setOrigin(0, 0);
        const energyBarFill = this.add.rectangle(22, 47, 150, 16, 0x00D4FF);
        energyBarFill.setOrigin(0, 0);

        // Texte infos
        const infoText = this.add.text(20, 70, 'HP: 100/100 | EN: 75/100', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#9CA3AF',
        });

        // Mini-carte (placeholder)
        const minimapBg = this.add.rectangle(width - 110, height - 110, 200, 200, 0x111827, 0.9);
        minimapBg.setStrokeStyle(2, 0x00D4FF, 0.5);
        const minimapText = this.add.text(width - 110, height - 110, 'MINIMAP', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#6B7280',
        });
        minimapText.setOrigin(0.5);

        // Bouton pause
        const pauseBtn = this.add.text(width - 40, 20, '⏸️', {
            fontSize: '24px',
        }).setInteractive({ useHandCursor: true });
        pauseBtn.on('pointerdown', () => this.togglePause());

        hudContainer.add([
            healthBarBg, healthBarFill,
            energyBarBg, energyBarFill,
            infoText,
            minimapBg, minimapText,
            pauseBtn,
        ]);
    }

    private togglePause(): void {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            // Afficher le menu pause
            this.showPauseMenu();
        } else {
            // Cacher le menu pause
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
        const menuBg = this.add.rectangle(width / 2, height / 2, 300, 250, 0x111827);
        menuBg.setStrokeStyle(2, 0x00D4FF);
        menuBg.setScrollFactor(0);
        menuBg.setDepth(2001);
        (this as any).pauseMenu = menuBg;

        // Titre
        const title = this.add.text(width / 2, height / 2 - 80, 'PAUSE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '24px',
            color: '#00D4FF',
        });
        title.setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(2001);

        // Options
        const options = ['Reprendre', 'Options', 'Quitter'];
        options.forEach((opt, i) => {
            const y = height / 2 - 20 + i * 50;
            const text = this.add.text(width / 2, y, opt, {
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                color: '#FFFFFF',
            });
            text.setOrigin(0.5);
            text.setScrollFactor(0);
            text.setDepth(2001);
            text.setInteractive({ useHandCursor: true });

            text.on('pointerover', () => text.setColor('#00D4FF'));
            text.on('pointerout', () => text.setColor('#FFFFFF'));
            text.on('pointerdown', () => {
                if (opt === 'Reprendre') this.togglePause();
                if (opt === 'Quitter') this.scene.start('MenuScene');
            });
        });
    }

    private hidePauseMenu(): void {
        if ((this as any).pauseOverlay) {
            (this as any).pauseOverlay.destroy();
        }
        if ((this as any).pauseMenu) {
            (this as any).pauseMenu.destroy();
        }

        // Nettoyer tous les éléments de pause
        this.children.list
            .filter(child => child.depth >= 2000)
            .forEach(child => child.destroy());
    }

    private openChat(): void {
        // À implémenter : ouvrir l'interface de chat
        console.log('💬 Ouverture du chat...');
    }

    private connectToServer(): void {
        // À implémenter : connexion Socket.io au serveur
        console.log('🌐 Connexion au serveur...');

        // Simulation de joueurs connectés
        this.addOtherPlayer('player_2', 200, 100, 'Agent Pizza');
        this.addOtherPlayer('player_3', -150, 200, 'Agent Bot');
    }

    private addOtherPlayer(id: string, x: number, y: number, name: string): void {
        const container = this.add.container(x, y);

        // Sprite
        const sprite = this.add.rectangle(0, 0, 32, 48, 0xFF6B35);
        sprite.setStrokeStyle(2, 0xFFFFFF);

        // Nom
        const nameText = this.add.text(0, -35, name, {
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#FFFFFF',
            backgroundColor: '#00000080',
            padding: { x: 4, y: 2 },
        });
        nameText.setOrigin(0.5);

        container.add([sprite, nameText]);
        this.otherPlayers.set(id, container);
    }
}