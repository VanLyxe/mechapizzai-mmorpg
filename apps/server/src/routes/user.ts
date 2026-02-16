import { Router } from 'express';
import { getUserFromToken } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Middleware to verify JWT token
async function authMiddleware(req: any, res: any, next: any) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
            });
        }

        const token = authHeader.substring(7);
        const user = await getUserFromToken(token);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
}

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get('/profile', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                lastLoginAt: true,
                characters: {
                    select: {
                        id: true,
                        name: true,
                        level: true,
                        xp: true,
                        health: true,
                        maxHealth: true,
                        money: true,
                        posX: true,
                        posY: true,
                        roomId: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { email } = req.body;

        // Validate email if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }

        // Check if email is already taken
        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already taken',
                });
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                email: email || undefined,
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * POST /api/user/characters
 * Create a new character
 */
router.post('/characters', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        // Validate name
        if (!name || !/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
            return res.status(400).json({
                success: false,
                error: 'Character name must be 3-20 characters and contain only letters, numbers, and underscores',
            });
        }

        // Check if user already has max characters (e.g., 5)
        const characterCount = await prisma.character.count({
            where: { userId },
        });

        if (characterCount >= 5) {
            return res.status(400).json({
                success: false,
                error: 'Maximum number of characters reached (5)',
            });
        }

        // Create character
        const character = await prisma.character.create({
            data: {
                userId,
                name,
                posX: 1000,
                posY: 1000,
                roomId: 'main',
                level: 1,
                xp: 0,
                health: 100,
                maxHealth: 100,
                money: 0,
            },
            select: {
                id: true,
                name: true,
                level: true,
                xp: true,
                health: true,
                maxHealth: true,
                money: true,
                posX: true,
                posY: true,
                roomId: true,
                createdAt: true,
            },
        });

        return res.status(201).json({
            success: true,
            character,
        });
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                error: 'Character name already taken for this user',
            });
        }

        console.error('Create character error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/user/characters
 * Get all user characters
 */
router.get('/characters', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;

        const characters = await prisma.character.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                level: true,
                xp: true,
                health: true,
                maxHealth: true,
                money: true,
                posX: true,
                posY: true,
                roomId: true,
                createdAt: true,
            },
        });

        return res.status(200).json({
            success: true,
            characters,
        });
    } catch (error) {
        console.error('Get characters error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * PUT /api/user/characters/:id
 * Update character (position, etc.)
 */
router.put('/characters/:id', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const characterId = req.params.id;
        const { posX, posY, roomId, health } = req.body;

        // Verify character belongs to user
        const character = await prisma.character.findFirst({
            where: {
                id: characterId,
                userId,
            },
        });

        if (!character) {
            return res.status(404).json({
                success: false,
                error: 'Character not found',
            });
        }

        // Update character
        const updatedCharacter = await prisma.character.update({
            where: { id: characterId },
            data: {
                posX: posX !== undefined ? posX : undefined,
                posY: posY !== undefined ? posY : undefined,
                roomId: roomId !== undefined ? roomId : undefined,
                health: health !== undefined ? health : undefined,
            },
            select: {
                id: true,
                name: true,
                level: true,
                xp: true,
                health: true,
                maxHealth: true,
                money: true,
                posX: true,
                posY: true,
                roomId: true,
            },
        });

        return res.status(200).json({
            success: true,
            character: updatedCharacter,
        });
    } catch (error) {
        console.error('Update character error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
