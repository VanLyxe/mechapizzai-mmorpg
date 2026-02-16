/**
 * @mechapizzai/shared
 * 
 * Types et utilitaires partagés entre le client et le serveur
 */

// ============================================
// Types de base
// ============================================

export interface Vector2 {
    x: number;
    y: number;
}

export interface Player {
    id: string;
    username: string;
    position: Vector2;
    level: number;
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    room?: string;
    guild?: string;
}

export interface ChatMessage {
    id: string;
    playerId: string;
    username: string;
    message: string;
    timestamp: number;
    channel: 'global' | 'guild' | 'private';
    targetId?: string;
}

// ============================================
// Types de réseau
// ============================================

export interface ServerToClientEvents {
    'player:joined': (player: Player) => void;
    'player:left': (data: { playerId: string }) => void;
    'player:moved': (data: { playerId: string; x: number; y: number }) => void;
    'chat:message': (data: { playerId: string; username: string; message: string }) => void;
    'players:list': (players: Player[]) => void;
    'pong': (timestamp: number) => void;
}

export interface ClientToServerEvents {
    'player:move': (data: { x: number; y: number }) => void;
    'chat:message': (data: { message: string }) => void;
    'player:action': (data: { action: string; data?: any }) => void;
    'room:join': (data: { roomId: string }) => void;
    'room:leave': (data: { roomId: string }) => void;
    'ping': (timestamp: number) => void;
}

// ============================================
// Types de jeu
// ============================================

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'delivery' | 'collection' | 'combat' | 'social';
    rewards: {
        experience: number;
        credits: number;
        items?: string[];
    };
    requirements?: {
        level?: number;
        items?: string[];
        completedQuests?: string[];
    };
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: 'consumable' | 'equipment' | 'material' | 'quest';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    icon: string;
    stackable: boolean;
    maxStack?: number;
}

export interface Guild {
    id: string;
    name: string;
    tag: string;
    description: string;
    leaderId: string;
    members: string[];
    level: number;
    experience: number;
}

// ============================================
// Constantes
// ============================================

export const GAME_CONSTANTS = {
    // Map
    TILE_SIZE: 32,
    MAP_WIDTH: 2000,
    MAP_HEIGHT: 2000,

    // Joueur
    PLAYER_SPEED: 200,
    PLAYER_MAX_HEALTH: 100,
    PLAYER_MAX_ENERGY: 100,

    // Réseau
    POSITION_UPDATE_RATE: 50, // ms
    CHAT_MAX_LENGTH: 200,
    MAX_PLAYERS_PER_ROOM: 100,

    // Quêtes
    MAX_ACTIVE_QUESTS: 10,
    QUEST_RESET_TIME: 24 * 60 * 60 * 1000, // 24h
} as const;

// ============================================
// Utilitaires
// ============================================

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

export function distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

// ============================================
// Validation
// ============================================

export function isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

export function isValidMessage(message: string): boolean {
    return message.length > 0 && message.length <= GAME_CONSTANTS.CHAT_MAX_LENGTH;
}

export function sanitizeString(str: string): string {
    return str
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, GAME_CONSTANTS.CHAT_MAX_LENGTH);
}