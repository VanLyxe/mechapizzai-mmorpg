import Phaser from 'phaser';

/**
 * MenuScene - Scène du menu principal
 * 
 * Affiche :
 * - Logo du jeu
 * - Boutons : Jouer, Options, Crédits
 * - Animation de fond
 */
export class MenuScene extends Phaser.Scene {
    private buttons: Phaser.GameObjects.Text[] = [];
    private selectedButton: number = 0;

    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        console.log('🎮 MenuScene: Menu principal');

        this.createBackground();
        this.createLogo();
        this.createMenuButtons();
        this.createVersionText();
        this.setupInput();

        // Animation d'entrée
        this.cameras.main.fadeIn(500, 10, 14, 26);
    }

    private createBackground(): void {
        const { width, height } = this.cameras.main;

        // Fond avec dégradé
        const graphics = this.add.graphics();

        // Création d'un dégradé vertical
        for (let y = 0; y < height; y++) {
            const ratio = y / height;
            const r = Math.floor(10 + ratio * 5);
            const g = Math.floor(14 + ratio * 10);
            const b = Math.floor(26 + ratio * 15);

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            graphics.fillRect(0, y, width, 1);
        }

        // Particules/étoiles en arrière-plan
        this.createStars();

        // Grille cyberpunk
        this.createGrid();
    }

    private createStars(): void {
        const { width, height } = this.cameras.main;

        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);

            const star = this.add.circle(x, y, size, 0xFFFFFF, alpha);

            // Animation de scintillement
            this.tweens.add({
                targets: star,
                alpha: { from: alpha, to: alpha * 0.3 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }
    }

    private createGrid(): void {
        const { width, height } = this.cameras.main;
        const graphics = this.add.graphics();

        graphics.lineStyle(1, 0x00D4FF, 0.1);

        // Lignes verticales
        for (let x = 0; x < width; x += 50) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }

        // Lignes horizontales
        for (let y = 0; y < height; y += 50) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }

        graphics.strokePath();
    }

    private createLogo(): void {
        const { width, height } = this.cameras.main;

        // Logo principal
        const logoContainer = this.add.container(width / 2, 150);

        // Icône pizza
        const pizzaIcon = this.add.text(0, -40, '🍕', {
            fontSize: '64px',
        });
        pizzaIcon.setOrigin(0.5);

        // Texte MechaPizzAI
        const logoText = this.add.text(0, 30, 'MECHAPIZZAI', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '48px',
            color: '#00D4FF',
        });
        logoText.setOrigin(0.5);
        logoText.setShadow(0, 0, '#00D4FF', 20, true, true);

        // Sous-titre
        const subtitleText = this.add.text(0, 80, 'MMORPG', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            color: '#FF6B35',
            fontStyle: 'bold',
        });
        subtitleText.setOrigin(0.5);

        logoContainer.add([pizzaIcon, logoText, subtitleText]);

        // Animation flottante
        this.tweens.add({
            targets: logoContainer,
            y: 150 + 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private createMenuButtons(): void {
        const { width, height } = this.cameras.main;
        const buttonY = height / 2 + 50;
        const buttonSpacing = 70;

        const menuItems = [
            { text: '🎮 JOUER', scene: 'GameScene' },
            { text: '⚙️ OPTIONS', scene: null },
            { text: '👥 MULTIJOUEUR', scene: null },
            { text: '❌ QUITTER', scene: null },
        ];

        menuItems.forEach((item, index) => {
            const y = buttonY + index * buttonSpacing;

            // Fond du bouton
            const buttonBg = this.add.rectangle(
                width / 2,
                y,
                300,
                50,
                0x111827,
                0.8
            );
            buttonBg.setStrokeStyle(2, 0x00D4FF, 0.5);
            buttonBg.setInteractive({ useHandCursor: true });

            // Texte du bouton
            const buttonText = this.add.text(width / 2, y, item.text, {
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                color: '#FFFFFF',
                fontStyle: 'bold',
            });
            buttonText.setOrigin(0.5);

            // Stockage des données
            (buttonBg as any).menuData = item;
            (buttonBg as any).textObject = buttonText;

            // Événements
            buttonBg.on('pointerover', () => {
                this.selectButton(index);
                buttonBg.setFillStyle(0x00D4FF, 0.2);
                buttonBg.setStrokeStyle(2, 0x00D4FF, 1);
                buttonText.setColor('#00D4FF');
            });

            buttonBg.on('pointerout', () => {
                if (this.selectedButton !== index) {
                    buttonBg.setFillStyle(0x111827, 0.8);
                    buttonBg.setStrokeStyle(2, 0x00D4FF, 0.5);
                    buttonText.setColor('#FFFFFF');
                }
            });

            buttonBg.on('pointerdown', () => {
                this.handleButtonClick(item);
            });

            this.buttons.push(buttonBg as any);
        });

        // Sélection du premier bouton par défaut
        this.selectButton(0);
    }

    private selectButton(index: number): void {
        this.selectedButton = index;
    }

    private handleButtonClick(item: { text: string; scene: string | null }): void {
        console.log(`🖱️ Clic sur: ${item.text}`);

        // Effet sonore (à implémenter)
        // this.sound.play('sfx_click');

        if (item.scene) {
            // Transition vers la scène
            this.cameras.main.fadeOut(300, 10, 14, 26);
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

        const text = this.add.text(width / 2, height - 100, message, {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#FF6B35',
        });
        text.setOrigin(0.5);
        text.setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            y: height - 120,
            duration: 300,
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: text,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => text.destroy(),
                    });
                });
            },
        });
    }

    private createVersionText(): void {
        const { width, height } = this.cameras.main;

        const versionText = this.add.text(width - 20, height - 20, 'v0.1.0 - Alpha', {
            fontFamily: 'Inter, sans-serif',
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
            // Simuler le hover sur le nouveau bouton
            this.buttons[newIndex].emit('pointerover');
            if (this.buttons[(newIndex + 1) % this.buttons.length]) {
                this.buttons[(newIndex + 1) % this.buttons.length].emit('pointerout');
            }
        });

        this.input.keyboard?.on('keydown-DOWN', () => {
            const newIndex = (this.selectedButton + 1) % this.buttons.length;
            this.selectButton(newIndex);
            // Simuler le hover sur le nouveau bouton
            this.buttons[newIndex].emit('pointerover');
            if (this.buttons[(newIndex - 1 + this.buttons.length) % this.buttons.length]) {
                this.buttons[(newIndex - 1 + this.buttons.length) % this.buttons.length].emit('pointerout');
            }
        });

        this.input.keyboard?.on('keydown-ENTER', () => {
            const button = this.buttons[this.selectedButton];
            if (button && button.menuData) {
                this.handleButtonClick(button.menuData);
            }
        });
    }
}