import Phaser from 'phaser';

/**
 * PreloadScene - Scène de préchargement des assets
 * 
 * Charge tous les assets nécessaires au jeu :
 * - Sprites et animations
 * - Tilesets
 * - Audio
 * - Fonts
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
        // SPRITES
        // ====================

        // Player sprites (à remplacer par de vrais assets)
        // this.load.spritesheet('player_idle', 'sprites/player/idle.png', {
        //   frameWidth: 32,
        //   frameHeight: 48,
        // });
        // this.load.spritesheet('player_walk', 'sprites/player/walk.png', {
        //   frameWidth: 32,
        //   frameHeight: 48,
        // });

        // NPC sprites
        // this.load.spritesheet('npc_agent', 'sprites/npcs/agent.png', {
        //   frameWidth: 32,
        //   frameHeight: 48,
        // });

        // ====================
        // TILESETS
        // ====================

        // this.load.image('tileset_city', 'tilesets/city.png');
        // this.load.image('tileset_interior', 'tilesets/interior.png');

        // ====================
        // UI
        // ====================

        // this.load.image('ui_panel', 'ui/panel.png');
        // this.load.image('ui_button_cyan', 'ui/button_cyan.png');
        // this.load.image('ui_button_orange', 'ui/button_orange.png');
        // this.load.image('icon_pizza', 'ui/icons/pizza.png');
        // this.load.image('icon_agent', 'ui/icons/agent.png');

        // ====================
        // AUDIO
        // ====================

        // this.load.audio('bgm_main', 'audio/music/main_theme.mp3');
        // this.load.audio('sfx_click', 'audio/sfx/click.mp3');
        // this.load.audio('sfx_hover', 'audio/sfx/hover.mp3');

        // ====================
        // MAPS (Tiled)
        // ====================

        // this.load.tilemapTiledJSON('map_spawn', 'maps/spawn.json');
        // this.load.tilemapTiledJSON('map_city', 'maps/city.json');

        console.log('📦 PreloadScene: Chargement des assets...');
    }

    create(): void {
        console.log('✅ PreloadScene: Assets chargés !');

        // Création des animations globales
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

    private createAnimations(): void {
        // Animations du joueur
        // this.anims.create({
        //   key: 'player_idle',
        //   frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
        //   frameRate: 8,
        //   repeat: -1,
        // });

        // this.anims.create({
        //   key: 'player_walk_down',
        //   frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
        //   frameRate: 12,
        //   repeat: -1,
        // });

        console.log('🎬 Animations créées');
    }
}