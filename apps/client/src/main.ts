import './styles/main.css';
import { Game } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { AuthScene } from './scenes/AuthScene';
import { GameScene } from './scenes/GameScene';
import { UIManager } from './ui/UIManager';
import { NetworkManager } from './network/NetworkManager';

// Configuration du jeu MechaPizzAI
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0A0E1A',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: import.meta.env.DEV,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, MenuScene, AuthScene, GameScene],
};

// Initialisation du jeu
const initGame = () => {
    console.log('🎮 Initialisation de MechaPizzAI MMORPG...');
    console.log('🍕 Agents, Pizza & Aventure!');
    console.log('🤖 Powered by Phaser 3 + TypeScript');

    // Création de l'instance du jeu
    const game = new Game(config);

    // Initialisation des managers
    const uiManager = new UIManager();
    const networkManager = new NetworkManager();

    // Exposition globale pour debug (en dev uniquement)
    if (import.meta.env.DEV) {
        (window as any).game = game;
        (window as any).uiManager = uiManager;
        (window as any).networkManager = networkManager;
    }

    return { game, uiManager, networkManager };
};

// Démarrage quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    try {
        initGame();
    } catch (error) {
        console.error('❌ Erreur lors du démarrage du jeu:', error);
    }
});

// Gestion du redimensionnement
window.addEventListener('resize', () => {
    // Le scale manager de Phaser gère automatiquement le redimensionnement
});

export { initGame };