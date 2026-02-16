import Phaser from 'phaser';

/**
 * GameScene - Version Soft améliorée visuellement
 * 
 * Features :
 * - Personnage SVG stylisé
 * - Environnement cyberpunk avec néons
 * - Effets de lumière
 * - HUD moderne
 */
export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Container;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
    private otherPlayers: Map<string, Phaser.GameObjects.Container> = new Map();
    private isPaused: boolean = false;
    private mapContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload(): void {
        // Charger les assets SVG
        this.load.svg('player', 'assets/player.svg', { width: 64, height: 96 });
        this.load.svg('logo', 'assets/logo.svg', { width: 200, height: 100 });
    }

    create(): void {
        console.log('🎮 GameScene: Début du jeu !');

        this.createEnvironment();
        this.createPlayer();
        this.setupControls();
        this.createHUD();
        this.createMinimap();

        // Animation d'entrée
        this.cameras.main.fadeIn(500, 10, 14, 26);

        // Message de bienvenue
        this.showWelcomeMessage();
    }

    update(time: number, delta: number): void {
        if (this.isPaused) return;

        this.handlePlayerMovement();
        this.updateEnvironmentAnimations();
    }

    private createEnvironment(): void {
        const { width, height } = this.cameras.main;

        this.mapContainer = this.add.container(0, 0);

        // Sol avec grille
        const gridGraphics = this.add.graphics();
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

        // Bâtiments cyberpunk stylisés
        this.createCyberpunkBuildings();

        // Néons et lumières
        this.createNeonLights();

        // Configuration de la caméra
        this.cameras.main.setBounds(-1000, -1000, 2000, 2000);
    }

    private createCyberpunkBuildings(): void {
        const buildingPositions = [
            { x: -400, y: -300, w: 120, h: 200, color: 0x111827 },
            { x: 300, y: -400, w: 100, h: 250, color: 0x1F2937 },
            { x: -200, y: 350, w: 140, h: 180, color: 0x111827 },
            { x: 450, y: 200, w: 90, h: 220, color: 0x1F2937 },
            { x: -500, y: 150, w: 110, h: 190, color: 0x111827 },
            { x: 150, y: -250, w: 130, h: 210, color: 0x1F2937 },
        ];

        buildingPositions.forEach((pos, index) => {
            const building = this.createStyledBuilding(pos.x, pos.y, pos.w, pos.h, pos.color, index);
            this.mapContainer.add(building);
        });
    }

    private createStyledBuilding(x: number, y: number, w: number, h: number, color: number, index: number): Phaser.GameObjects.Container {
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

                    const window = this.add.rectangle(winX, winY, 12, 16, winColor, winAlpha);
                    container.add(window);

                    // Animation clignotante pour certaines fenêtres
                    if (isLit && Math.random() > 0.8) {
                        this.tweens.add({
                            targets: window,
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

    private createPlayer(): void {
        this.player = this.add.container(0, 0);

        // Ombre sous le personnage
        const shadow = this.add.ellipse(0, 45, 40, 15, 0x000000, 0.3);
        this.player.add(shadow);

        // Sprite du joueur
        const playerSprite = this.add.image(0, 0, 'player');
        playerSprite.setScale(0.8);
        this.player.add(playerSprite);

        // Nom du joueur
        const nameText = this.add.text(0, -60, 'Agent You', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '14px',
            color: '#FFFFFF',
            backgroundColor: '#00000080',
            padding: { x: 8, y: 4 },
        });
        nameText.setOrigin(0.5);
        this.player.add(nameText);

        // Indicateur de niveau
        const levelBadge = this.add.text(25, -50, '1', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '11px',
            color: '#0A0E1A',
            backgroundColor: '#FF6B35',
            padding: { x: 6, y: 2 },
        });
        levelBadge.setOrigin(0.5);
        this.player.add(levelBadge);

        // Animation idle
        this.tweens.add({
            targets: playerSprite,
            y: { from: 0, to: -3 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Caméra suit le joueur
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Physics
        this.physics.world.enable(this.player);
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setSize(40, 80);
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
    }

    private updateEnvironmentAnimations(): void {
        // Mettre à jour les animations d'environnement si nécessaire
    }

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
        const instructions = this.add.text(20, height - 40, 'WASD / Flèches pour bouger • ESC pour pause', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '12px',
            color: '#6B7280',
        });
        hudContainer.add(instructions);
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

        // Texte
        const label = this.add.text(mapX + mapSize / 2, mapY + mapSize / 2, 'MINIMAP', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '12px',
            color: '#6B7280',
        });
        label.setOrigin(0.5);
        label.setScrollFactor(0);
        label.setDepth(1001);
    }

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
        const message = this.add.text(0, 10, 'Utilise WASD ou les flèches pour te déplacer\nExplore la ville et livre des pizzas !', {
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
        const menuBg = this.add.rectangle(width / 2, height / 2, 350, 300, 0x111827, 0.95);
        menuBg.setStrokeStyle(2, 0x00D4FF, 0.5);
        menuBg.setScrollFactor(0);
        menuBg.setDepth(2001);
        (this as any).pauseMenu = menuBg;

        // Titre
        const title = this.add.text(width / 2, height / 2 - 100, 'PAUSE', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '32px',
            color: '#00D4FF',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(2001);

        // Options
        const options = [
            { text: 'Reprendre', action: () => this.togglePause() },
            { text: 'Options', action: () => { } },
            { text: 'Retour au menu', action: () => this.scene.start('MenuScene') },
        ];

        options.forEach((opt, i) => {
            const y = height / 2 - 30 + i * 60;
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

    private hidePauseMenu(): void {
        if ((this as any).pauseOverlay) {
            (this as any).pauseOverlay.destroy();
        }

        // Nettoyer tous les éléments de pause
        this.children.list
            .filter((child: any) => child.depth >= 2000)
            .forEach((child: any) => child.destroy());
    }
}