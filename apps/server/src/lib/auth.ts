import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

export interface JWTPayload {
    userId: string;
    username: string;
    iat?: number;
    exp?: number;
}

export interface AuthResult {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        username: string;
        email: string;
    };
    error?: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Register a new user
 */
export async function registerUser(
    username: string,
    email: string,
    password: string
): Promise<AuthResult> {
    try {
        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            return { success: false, error: 'Username already taken' };
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            return { success: false, error: 'Email already registered' };
        }

        // Validate password strength
        if (password.length < 8) {
            return { success: false, error: 'Password must be at least 8 characters' };
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        // Generate token
        const token = generateToken({
            userId: user.id,
            username: user.username,
        });

        return {
            success: true,
            token,
            user,
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Registration failed' };
    }
}

/**
 * Login a user
 */
export async function loginUser(
    usernameOrEmail: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    try {
        // Find user by username or email
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
        });

        if (!user) {
            // Log failed attempt
            await prisma.loginHistory.create({
                data: {
                    userId: 'unknown',
                    ipAddress,
                    userAgent,
                    success: false,
                    reason: 'User not found',
                },
            });
            return { success: false, error: 'Invalid credentials' };
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.passwordHash);

        if (!isValidPassword) {
            // Log failed attempt
            await prisma.loginHistory.create({
                data: {
                    userId: user.id,
                    ipAddress,
                    userAgent,
                    success: false,
                    reason: 'Invalid password',
                },
            });
            return { success: false, error: 'Invalid credentials' };
        }

        // Check if user is active
        if (!user.isActive) {
            await prisma.loginHistory.create({
                data: {
                    userId: user.id,
                    ipAddress,
                    userAgent,
                    success: false,
                    reason: 'Account deactivated',
                },
            });
            return { success: false, error: 'Account deactivated' };
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Log successful login
        await prisma.loginHistory.create({
            data: {
                userId: user.id,
                ipAddress,
                userAgent,
                success: true,
            },
        });

        // Generate token
        const token = generateToken({
            userId: user.id,
            username: user.username,
        });

        return {
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
    }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token: string) {
    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
            characters: {
                select: {
                    id: true,
                    name: true,
                    level: true,
                    posX: true,
                    posY: true,
                    roomId: true,
                },
            },
        },
    });

    if (!user || !user.isActive) return null;

    return user;
}
