import Phaser from 'phaser';

/**
 * MenuScene - Scène du menu principal améliorée
 * 
 * Design moderne avec :
 * - Logo SVG animé
 * - Boutons stylisés avec glow
 * - Particules d'ambiance
 * - Animation de fond
 */
export class MenuScene extends Phaser.Scene {
    private buttons: Phaser.GameObjects.Container[] = [];
    private selectedButton: number = 0;
    private logo!: Phaser.GameObjects.Image;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload(): void {
        // Charger le logo SVG
        this.load.svg('logo', 'assets/logo.svg', { width: 400, height: 200 });
    }

    create(): void {
        console.log('🎮 MenuScene: Menu principal');

        this.createBackground();
        this.createParticles();
        this.createLogo();
        this.createMenuButtons();
        this.createVersionText();
        this.setupInput();

        // Animation d'entrée
        this.cameras.main.fadeIn(800, 10, 14, 26);
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        // Fond dégradé
        const graphics = this.add.graphics();

        // Création d'un dégradé vertical subtil
        for (let y = 0; y < height; y++) {
            const ratio = y / height;
            const r = Math.floor(10 + ratio * 8);
            const g = Math.floor(14 + ratio * 12);
            const b = Math.floor(26 + ratio * 18);

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            graphics.fillRect(0, y, width, 1);
        }

        // Grille cyberpunk subtile
        this.createGrid();

        // Cercles décoratifs
        this.createDecorativeCircles();
    }

    private createGrid(): void {
        const { width, height } = this.cameras.main;
        const graphics = this.add.graphics();

        graphics.lineStyle(1, 0x00D4FF, 0.08);

        // Lignes verticales
        for (let x = 0; x < width; x += 60) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }

        // Lignes horizontales
        for (let y = 0; y < height; y += 60) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }

        graphics.strokePath();
    }

    private createDecorativeCircles(): void {
        const { width, height } = this.cameras.main;

        // Cercle cyan en haut à gauche
        const circle1 = this.add.circle(100, 100, 150, 0x00D4FF, 0.03);
        const circle2 = this.add.circle(100, 100, 100, 0x00D4FF, 0.05);

        // Cercle orange en bas à droite
        const circle3 = this.add.circle(width - 100, height - 100, 200, 0xFF6B35, 0.02);
        const circle4 = this.add.circle(width - 100, height - 100, 120, 0xFF6B35, 0.04);

        // Animation pulsante
        this.tweens.add({
            targets: [circle1, circle3],
            scale: { from: 1, to: 1.1 },
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.tweens.add({
            targets: [circle2, circle4],
            scale: { from: 1, to: 0.9 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private createParticles(): void {
        // Créer une texture pour les particules
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x00D4FF, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);

        // Émetteur de particules
        this.particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height },
            lifespan: 4000,
            speedY: { min: -20, max: -5 },
            speedX: { min: -5, max: 5 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            quantity: 1,
            frequency: 200,
            blendMode: 'ADD',
        });
    }

    private createLogo(): void {
        const { width, height } = this.cameras.main;

        // Logo SVG
        this.logo = this.add.image(width / 2, height / 2 - 80, 'logo');
        this.logo.setScale(0.8);

        // Animation flottante
        this.tweens.add({
            targets: this.logo,
            y: height / 2 - 70,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Glow effect avec un sprite derrière
        const glow = this.add.image(width / 2, height / 2 - 80, 'logo');
        glow.setScale(0.85);
        glow.setAlpha(0.3);
        glow.setTint(0x00D4FF);

        this.tweens.add({
            targets: glow,
            alpha: { from: 0.1, to: 0.4 },
            scale: { from: 0.82, to: 0.88 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private createMenuButtons(): void {
        const { width, height } = this.cameras.main;
        const buttonY = height / 2 + 60;
        const buttonSpacing = 65;

        const menuItems = [
            { text: '🔐 CONNEXION', scene: 'AuthScene', color: 0x00D4FF },
            { text: '🎮 JOUER', scene: 'GameScene', color: 0x00D4FF },
            { text: '⚙️ OPTIONS', scene: null, color: 0x9CA3AF },
            { text: '📖 CRÉDITS', scene: null, color: 0x9CA3AF },
            { text: '❌ QUITTER', scene: null, color: 0xEF4444 },
        ];

        menuItems.forEach((item, index) => {
            const y = buttonY + index * buttonSpacing;
            this.createStyledButton(width / 2, y, item.text, item.scene, item.color, index);
        });

        // Sélection du premier bouton par défaut
        this.selectButton(0);
    }

    private createStyledButton(
        x: number,
        y: number,
        text: string,
        scene: string | null,
        color: number,
        index: number
    ): void {
        const container = this.add.container(x, y);

        // Fond du bouton avec gradient
        const buttonWidth = 280;
        const buttonHeight = 50;

        // Glow externe
        const glow = this.add.rectangle(0, 0, buttonWidth + 10, buttonHeight + 10, color, 0.2);
        glow.setInteractive({ useHandCursor: true });
        (glow as any).glowEffect = true;

        // Fond principal
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x111827, 0.95);
        bg.setStrokeStyle(2, color, 0.6);
        bg.setInteractive({ useHandCursor: true });

        // Ligne décorative en haut
        const topLine = this.add.rectangle(0, -buttonHeight / 2 + 2, buttonWidth - 20, 2, color, 0.8);

        // Texte du bouton
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '18px',
            color: '#FFFFFF',
            fontStyle: 'bold',
        });
        buttonText.setOrigin(0.5);

        container.add([glow, bg, topLine, buttonText]);

        // Stockage des données
        (container as any).menuData = { text, scene };
        (container as any).index = index;
        (container as any).elements = { glow, bg, topLine, text: buttonText };

        // Événements
        bg.on('pointerover', () => {
            this.selectButton(index);
            this.animateButtonHover(container, true, color);
        });

        bg.on('pointerout', () => {
            if (this.selectedButton !== index) {
                this.animateButtonHover(container, false, color);
            }
        });

        bg.on('pointerdown', () => {
            this.animateButtonClick(container);
            this.time.delayedCall(150, () => {
                this.handleButtonClick({ text, scene });
            });
        });

        this.buttons.push(container);
    }

    private animateButtonHover(container: Phaser.GameObjects.Container, isHover: boolean, color: number): void {
        const elements = (container as any).elements;

        if (isHover) {
            this.tweens.add({
                targets: [elements.bg],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Power2',
            });

            this.tweens.add({
                targets: [elements.glow],
                alpha: { from: 0.2, to: 0.6 },
                scaleX: { from: 1, to: 1.1 },
                scaleY: { from: 1, to: 1.1 },
                duration: 200,
                ease: 'Power2',
            });

            elements.bg.setStrokeStyle(3, color, 1);
            elements.text.setColor('#00D4FF');
        } else {
            this.tweens.add({
                targets: [elements.bg],
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Power2',
            });

            this.tweens.add({
                targets: [elements.glow],
                alpha: 0.2,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2',
            });

            elements.bg.setStrokeStyle(2, color, 0.6);
            elements.text.setColor('#FFFFFF');
        }
    }

    private animateButtonClick(container: Phaser.GameObjects.Container): void {
        this.tweens.add({
            targets: container,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            yoyo: true,
            ease: 'Power2',
        });
    }

    private selectButton(index: number): void {
        // Réinitialiser l'ancien bouton
        if (this.buttons[this.selectedButton]) {
            const oldElements = (this.buttons[this.selectedButton] as any).elements;
            oldElements.text.setColor('#FFFFFF');
        }

        this.selectedButton = index;

        // Mettre en évidence le nouveau bouton
        if (this.buttons[index]) {
            const newElements = (this.buttons[index] as any).elements;
            newElements.text.setColor('#00D4FF');
        }
    }

    private handleButtonClick(item: { text: string; scene: string | null }): void {
        console.log(`🖱️ Clic sur: ${item.text}`);

        if (item.scene) {
            // Transition vers la scène avec effet
            this.cameras.main.fadeOut(500, 10, 14, 26);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(item.scene);
            });
        } else {
            // Message temporaire pour les options non implémentées
            this.showTemporaryMessage('Bientôt disponible !');
        }
    }

    private showTemporaryMessage(message: string): void {
        const { width, height } = this.cameras.main;

        const text = this.add.text(width / 2, height - 80, message, {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '16px',
            color: '#FF6B35',
            backgroundColor: '#111827',
            padding: { x: 16, y: 8 },
        });
        text.setOrigin(0.5);
        text.setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            y: height - 100,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: text,
                        alpha: 0,
                        y: height - 80,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => text.destroy(),
                    });
                });
            },
        });
    }

    private createVersionText(): void {
        const { width, height } = this.cameras.main;

        const versionText = this.add.text(width - 20, height - 20, 'v0.1.0 - Alpha', {
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '12px',
            color: '#6B7280',
        });
        versionText.setOrigin(1, 1);
    }

    private setupInput(): void {
        // Navigation clavier
        this.input.keyboard?.on('keydown-UP', () => {
            const newIndex = (this.selectedButton - 1 + this.buttons.length) % this.buttons.length;
            this.selectButton(newIndex);
        });

        this.input.keyboard?.on('keydown-DOWN', () => {
            const newIndex = (this.selectedButton + 1) % this.buttons.length;
            this.selectButton(newIndex);
        });

        this.input.keyboard?.on('keydown-ENTER', () => {
            const button = this.buttons[this.selectedButton];
            if (button && (button as any).menuData) {
                this.animateButtonClick(button);
                this.time.delayedCall(150, () => {
                    this.handleButtonClick((button as any).menuData);
                });
            }
        });
    }
}