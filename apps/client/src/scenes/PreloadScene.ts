import Phaser from 'phaser';

/**
 * PreloadScene - Scène de préchargement des assets
 *
 * Charge tous les assets PNG générés par NanoBanana Pro :
 * - Sprites personnages (4 classes)
 * - Tilesets environnement (5)
 * - UI/HUD (5)
 * - Effets et particules (5)
 * - Items et objets (5)
 * - Logo et titre (3)
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
        // SPRITES PERSONNAGES (4 classes)
        // ====================

        // Chevalier Pizza (Tank) - Spritesheet 512x512, frames 64x64
        this.load.spritesheet('player-knight', 'characters/player-knight.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Mage Tomate (Mage) - Spritesheet 512x512, frames 64x64
        this.load.spritesheet('player-mage', 'characters/player-mage.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Rôdeur Fromage (DPS) - Spritesheet 512x512, frames 64x64
        this.load.spritesheet('player-rogue', 'characters/player-rogue.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Ingénieur Pâte (Support) - Spritesheet 512x512, frames 64x64
        this.load.spritesheet('player-engineer', 'characters/player-engineer.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // ====================
        // TILESETS ENVIRONNEMENT (5)
        // ====================

        // Tileset Sol Urbain Cyberpunk
        this.load.image('tileset-urban-ground', 'tilesets/tileset-urban-ground.png');

        // Tileset Murs et Bâtiments
        this.load.image('tileset-urban-walls', 'tilesets/tileset-urban-walls.png');

        // Tileset Intérieur Pizzeria
        this.load.image('tileset-interior', 'tilesets/tileset-interior.png');

        // Tileset Donjon Four Ancien
        this.load.image('tileset-dungeon-oven', 'tilesets/tileset-dungeon-oven.png');

        // Tileset Donjon Frigo Infini
        this.load.image('tileset-dungeon-fridge', 'tilesets/tileset-dungeon-fridge.png');

        // ====================
        // UI ET HUD (5)
        // ====================

        // Barres de PV/MP
        this.load.image('ui-bars', 'ui/ui-bars.png');

        // Boutons Menu
        this.load.image('ui-buttons', 'ui/ui-buttons.png');

        // Inventaire Grille
        this.load.image('ui-inventory', 'ui/ui-inventory.png');

        // Minimap Radar
        this.load.image('ui-minimap', 'ui/ui-minimap.png');

        // Police Bitmap
        this.load.image('ui-font', 'ui/ui-font.png');

        // ====================
        // EFFETS ET PARTICULES (5)
        // ====================

        // Particules Magie - Feu
        this.load.spritesheet('effects-fire', 'effects/effects-fire.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Particules Magie - Glace
        this.load.spritesheet('effects-ice', 'effects/effects-ice.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Particules Soin et Buffs
        this.load.spritesheet('effects-heal', 'effects/effects-heal.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Explosions et Impacts
        this.load.spritesheet('effects-impacts', 'effects/effects-impacts.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Aura de Personnage et Traînées
        this.load.spritesheet('effects-auras', 'effects/effects-auras.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // ====================
        // ITEMS ET OBJETS (5)
        // ====================

        // Armes - Épées et Bâtons
        this.load.image('items-weapons', 'items/items-weapons.png');

        // Armures et Équipement
        this.load.image('items-armor', 'items/items-armor.png');

        // Potions et Consommables
        this.load.image('items-consumables', 'items/items-consumables.png');

        // Clés et Objets de Quête
        this.load.image('items-quest', 'items/items-quest.png');

        // Pizza Magique (Buffs)
        this.load.image('items-pizza-buffs', 'items/items-pizza-buffs.png');

        // ====================
        // LOGO ET TITRE (3)
        // ====================

        // Logo MechaPizzAI
        this.load.image('logo-game', 'logo/logo-game.png');

        // Écran Titre
        this.load.image('title-screen', 'logo/title-screen.png');

        // Icônes de Classe
        this.load.image('class-icons', 'logo/class-icons.png');

        // ====================
        // ASSETS LEGACY (SVG)
        // ====================
        // Gardés pour compatibilité

        // Joueur robot (64x96)
        this.load.svg('player', 'player.svg', { width: 64, height: 96 });

        // PNJ client (64x96)
        this.load.svg('npc-customer', 'npc-customer.svg', { width: 64, height: 96 });

        // Tileset de sol (128x128 avec 16 tiles)
        this.load.svg('tileset-floor', 'tileset-floor.svg', { width: 128, height: 128 });

        // Logo du jeu (400x200)
        this.load.svg('logo', 'logo.svg', { width: 400, height: 200 });

        // Icônes UI (256x256 avec 16 icônes)
        this.load.svg('ui-icons', 'ui-icons.svg', { width: 256, height: 256 });

        // Item pizza (32x32)
        this.load.svg('pizza-item', 'pizza-item.svg', { width: 32, height: 32 });

        console.log('📦 PreloadScene: Chargement des assets PNG (NanoBanana Pro)...');
    }

    create(): void {
        console.log('✅ PreloadScene: Assets chargés !');

        // Création des animations pour les spritesheets
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
        // ====================
        // ANIMATIONS DES PERSONNAGES
        // ====================

        const characterClasses = ['knight', 'mage', 'rogue', 'engineer'];
        const directions = ['down', 'left', 'right', 'up'];
        const animations = ['idle', 'walk', 'attack', 'skill'];

        // Pour chaque classe de personnage
        characterClasses.forEach((charClass, classIndex) => {
            const spriteKey = `player-${charClass}`;

            // Vérifier si le spritesheet existe
            if (!this.textures.exists(spriteKey)) return;

            // Calculer l'offset de base pour cette classe (chaque classe a 256 frames)
            // Format: 8 directions × 8 frames × 4 animations = 256 frames par classe
            const baseFrameOffset = classIndex * 256;

            directions.forEach((direction, dirIndex) => {
                animations.forEach((anim, animIndex) => {
                    const animKey = `${charClass}-${anim}-${direction}`;
                    const startFrame = baseFrameOffset + (animIndex * 64) + (dirIndex * 8);
                    const endFrame = startFrame + 7;

                    this.anims.create({
                        key: animKey,
                        frames: this.anims.generateFrameNumbers(spriteKey, {
                            start: startFrame,
                            end: endFrame
                        }),
                        frameRate: anim === 'walk' ? 12 : 8,
                        repeat: anim === 'idle' || anim === 'walk' ? -1 : 0
                    });
                });
            });
        });

        // ====================
        // ANIMATIONS DES EFFETS
        // ====================

        // Effets de feu
        if (this.textures.exists('effects-fire')) {
            this.anims.create({
                key: 'fireball',
                frames: this.anims.generateFrameNumbers('effects-fire', { start: 0, end: 7 }),
                frameRate: 12,
                repeat: 0
            });

            this.anims.create({
                key: 'fire-explosion',
                frames: this.anims.generateFrameNumbers('effects-fire', { start: 8, end: 15 }),
                frameRate: 12,
                repeat: 0
            });
        }

        // Effets de glace
        if (this.textures.exists('effects-ice')) {
            this.anims.create({
                key: 'ice-shard',
                frames: this.anims.generateFrameNumbers('effects-ice', { start: 0, end: 7 }),
                frameRate: 12,
                repeat: 0
            });

            this.anims.create({
                key: 'ice-explosion',
                frames: this.anims.generateFrameNumbers('effects-ice', { start: 8, end: 15 }),
                frameRate: 12,
                repeat: 0
            });
        }

        // Effets de soin
        if (this.textures.exists('effects-heal')) {
            this.anims.create({
                key: 'heal-effect',
                frames: this.anims.generateFrameNumbers('effects-heal', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: 0
            });
        }

        // Effets d'impact
        if (this.textures.exists('effects-impacts')) {
            this.anims.create({
                key: 'impact-slash',
                frames: this.anims.generateFrameNumbers('effects-impacts', { start: 0, end: 7 }),
                frameRate: 15,
                repeat: 0
            });

            this.anims.create({
                key: 'impact-explosion',
                frames: this.anims.generateFrameNumbers('effects-impacts', { start: 8, end: 15 }),
                frameRate: 12,
                repeat: 0
            });
        }

        // Auras de personnage
        if (this.textures.exists('effects-auras')) {
            this.anims.create({
                key: 'aura-knight',
                frames: this.anims.generateFrameNumbers('effects-auras', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: 'aura-mage',
                frames: this.anims.generateFrameNumbers('effects-auras', { start: 8, end: 15 }),
                frameRate: 8,
                repeat: -1
            });
        }

        console.log('🎬 Animations créées');
    }
}
