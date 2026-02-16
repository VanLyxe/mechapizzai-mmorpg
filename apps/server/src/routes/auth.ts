import { Router } from 'express';
import { registerUser, loginUser, getUserFromToken } from '../lib/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required',
            });
        }

        // Validate username format
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            return res.status(400).json({
                success: false,
                error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }

        const result = await registerUser(username, email, password);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error) {
        console.error('Register endpoint error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        // Validate input
        if (!usernameOrEmail || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username/email and password are required',
            });
        }

        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        const result = await loginUser(usernameOrEmail, password, ipAddress, userAgent);

        if (!result.success) {
            return res.status(401).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Login endpoint error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout a user (client-side token removal)
 */
router.post('/logout', async (req, res) => {
    // In a JWT-based system, logout is handled client-side by removing the token
    // We could also implement a token blacklist here if needed
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

/**
 * GET /api/auth/me
 * Get current user info from token
 */
router.get('/me', async (req, res) => {
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

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Me endpoint error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
