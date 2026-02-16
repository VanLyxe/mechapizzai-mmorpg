import Phaser from 'phaser';

/**
 * PreloadScene - Scène de préchargement des assets
 *
 * Charge tous les assets SVG nécessaires au jeu :
 * - Sprites (joueur, PNJ)
 * - Tilesets (sol)
 * - UI (icônes)
 * - Items (pizza)
 * - Logo
 */
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload(): void {
        this.createLoadingUI();
        this.setupLoadingEvents();

        // Configuration du chemin des assets
        this.load.setPath('assets/');

        // ====================
        // SPRITES SVG
        // ====================

        // Joueur robot (64x96)
        this.load.svg('player', 'player.svg', { width: 64, height: 96 });

        // PNJ client (64x96)
        this.load.svg('npc-customer', 'npc-customer.svg', { width: 64, height: 96 });

        // ====================
        // TILESETS
        // ====================

        // Tileset de sol (128x128 avec 16 tiles)
        this.load.svg('tileset-floor', 'tileset-floor.svg', { width: 128, height: 128 });

        // ====================
        // UI
        // ====================

        // Logo du jeu (400x200)
        this.load.svg('logo', 'logo.svg', { width: 400, height: 200 });

        // Icônes UI (256x256 avec 16 icônes)
        this.load.svg('ui-icons', 'ui-icons.svg', { width: 256, height: 256 });

        // ====================
        // ITEMS
        // ====================

        // Item pizza (32x32)
        this.load.svg('pizza-item', 'pizza-item.svg', { width: 32, height: 32 });

        console.log('📦 PreloadScene: Chargement des assets SVG...');
    }

    create(): void {
        console.log('✅ PreloadScene: Assets chargés !');

        // Création des textures dérivées des SVG
        this.createDerivedTextures();

        // Création des animations
        this.createAnimations();

        // Transition vers le menu principal après un court délai
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }

    private createLoadingUI(): void {
        const { width, height } = this.cameras.main;

        // Fond
        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x0A0E1A
        );

        // Titre
        const titleText = this.add.text(width / 2, height / 2 - 100, 'MECHAPIZZAI', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '48px',
            color: '#00D4FF',
        });
        titleText.setOrigin(0.5);
        titleText.setShadow(0, 0, '#00D4FF', 15, true, true);

        // Sous-titre
        const subtitleText = this.add.text(width / 2, height / 2 - 40, 'MMORPG', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            color: '#FF6B35',
            fontStyle: 'bold',
        });
        subtitleText.setOrigin(0.5);

        // Container de la barre de progression
        const progressBox = this.add.rectangle(
            width / 2,
            height / 2 + 50,
            400,
            30,
            0x1F2937
        );
        progressBox.setOrigin(0.5);
        progressBox.setStrokeStyle(2, 0x00D4FF);

        // Barre de progression
        const progressBar = this.add.rectangle(
            width / 2 - 190,
            height / 2 + 50,
            0,
            20,
            0x00D4FF
        );
        progressBar.setOrigin(0, 0.5);

        // Texte de progression
        const progressText = this.add.text(width / 2, height / 2 + 100, '0%', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            color: '#FFFFFF',
        });
        progressText.setOrigin(0.5);

        // Texte d'info
        const infoText = this.add.text(width / 2, height / 2 + 140, 'Chargement des ressources...', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#9CA3AF',
        });
        infoText.setOrigin(0.5);

        // Stockage des références pour les événements
        (this as any).progressBar = progressBar;
        (this as any).progressText = progressText;
        (this as any).infoText = infoText;
    }

    private setupLoadingEvents(): void {
        const progressBar = (this as any).progressBar;
        const progressText = (this as any).progressText;
        const infoText = (this as any).infoText;

        // Progression du chargement
        this.load.on('progress', (value: number) => {
            const percentage = Math.round(value * 100);
            progressBar.width = 380 * value;
            progressText.setText(`${percentage}%`);
        });

        // Fichier en cours de chargement
        this.load.on('fileprogress', (file: Phaser.Loader.File) => {
            infoText.setText(`Chargement: ${file.key}...`);
        });

        // Chargement terminé
        this.load.on('complete', () => {
            infoText.setText('Prêt !');
            progressText.setText('100%');

            // Animation de fin
            this.tweens.add({
                targets: [progressBar, progressText, infoText],
                alpha: 0,
                duration: 300,
            });
        });

        // Gestion des erreurs
        this.load.on('loaderror', (file: Phaser.Loader.File) => {
            console.warn(`⚠️ Erreur de chargement: ${file.key}`);
            infoText.setText(`Erreur: ${file.key}`);
            infoText.setColor('#EF4444');
        });
    }

    private createDerivedTextures(): void {
        // Créer des textures pour les tiles individuels à partir du tileset
        const tilesetTexture = this.textures.get('tileset-floor');
        if (tilesetTexture) {
            // Le tileset est 128x128 avec 16 tiles de 32x32
            const tileSize = 32;
            const tilesPerRow = 4;

            for (let i = 0; i < 16; i++) {
                const x = (i % tilesPerRow) * tileSize;
                const y = Math.floor(i / tilesPerRow) * tileSize;

                // Créer une frame pour chaque tile
                tilesetTexture.add(`tile-${i}`, 0, x, y, tileSize, tileSize);
            }

            console.log('🎨 Textures de tiles créées');
        }

        // Créer des textures pour les icônes UI à partir de ui-icons.svg
        const uiTexture = this.textures.get('ui-icons');
        if (uiTexture) {
            // Le sprite UI est 256x256 avec 16 icônes de 64x64
            const iconSize = 64;
            const iconsPerRow = 4;

            for (let i = 0; i < 16; i++) {
                const x = (i % iconsPerRow) * iconSize;
                const y = Math.floor(i / iconsPerRow) * iconSize;

                uiTexture.add(`ui-icon-${i}`, 0, x, y, iconSize, iconSize);
            }

            console.log('🎨 Textures d\'icônes UI créées');
        }
    }

    private createAnimations(): void {
        // Animation de pulsation pour le joueur (idle)
        this.tweens.add({
            targets: {},
            duration: 1000,
        });

        console.log('🎬 Animations créées');
    }
}
