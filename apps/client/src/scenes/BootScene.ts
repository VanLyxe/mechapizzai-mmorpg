import Phaser from 'phaser';

/**
 * BootScene - Scène de démarrage
 * 
 * S'occupe de :
 * - Vérifier la configuration
 * - Préparer le chargement des assets
 * - Afficher un écran de chargement initial
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        // Création d'un écran de chargement minimal
        this.createLoadingScreen();

        // Chargement des assets essentiels pour le preload
        this.load.setPath('assets/');

        // Ici on chargera le logo, la barre de progression, etc.
        // Pour l'instant, on crée des graphics programmatiques
    }

    create(): void {
        console.log('🚀 BootScene: Démarrage...');

        // Transition vers la scène de préchargement
        this.scene.start('PreloadScene');
    }

    private createLoadingScreen(): void {
        const { width, height } = this.cameras.main;

        // Fond
        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x0A0E1A
        );

        // Logo texte (temporaire, sera remplacé par un vrai logo)
        const logoText = this.add.text(width / 2, height / 2 - 50, '🍕 MechaPizzAI', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '32px',
            color: '#00D4FF',
        });
        logoText.setOrigin(0.5);

        // Effet glow sur le logo
        logoText.setShadow(0, 0, '#00D4FF', 10, true, true);

        // Sous-titre
        const subtitleText = this.add.text(width / 2, height / 2 + 20, 'Chargement...', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#9CA3AF',
        });
        subtitleText.setOrigin(0.5);

        // Animation du logo
        this.tweens.add({
            targets: logoText,
            scale: { from: 0.9, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Barre de progression
        const progressBar = this.add.rectangle(
            width / 2,
            height / 2 + 80,
            300,
            10,
            0x1F2937
        );
        progressBar.setOrigin(0.5);

        const progressFill = this.add.rectangle(
            width / 2 - 145,
            height / 2 + 80,
            0,
            6,
            0x00D4FF
        );
        progressFill.setOrigin(0, 0.5);

        // Animation de la barre de progression
        this.tweens.add({
            targets: progressFill,
            width: 290,
            duration: 2000,
            ease: 'Power2',
        });

        // Événements de chargement
        this.load.on('progress', (value: number) => {
            progressFill.width = 290 * value;
        });
    }
}