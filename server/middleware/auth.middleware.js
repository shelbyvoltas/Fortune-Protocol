const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Protects admin routes — NO fallback secret, supports token blacklisting
 */

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        // ── Require JWT_SECRET — NO fallback ──
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: 'Server misconfiguration'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);

        // ── Check JWT blacklist (if Redis available) ──
        if (decoded.jti) {
            try {
                const { getRedisClient } = require('../config/redis');
                const redis = getRedisClient();
                const isBlacklisted = await redis.get(`blacklist:${decoded.jti}`);
                if (isBlacklisted) {
                    return res.status(401).json({
                        success: false,
                        message: 'Token has been revoked. Please login again.'
                    });
                }
            } catch {
                // Redis not available — skip blacklist check (token still valid by sig)
            }
        }

        // Add user info to request
        req.admin = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            jti: decoded.jti || null,
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

/**
 * Admin Role Check Middleware
 * Must be used after authMiddleware
 */
const requireSuperAdmin = (req, res, next) => {
    if (req.admin.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super admin privileges required.'
        });
    }
    next();
};

/**
 * Wallet Authentication Middleware
 * Validates cryptographic wallet JWT session token
 */
const walletAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Wallet authentication required. Please sign in with your wallet.'
            });
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ success: false, message: 'Server misconfiguration' });
        }

        const decoded = jwt.verify(token, jwtSecret);
        if (decoded.type !== 'wallet_auth' || !decoded.walletAddress) {
            return res.status(401).json({
                success: false,
                message: 'Invalid wallet session token.'
            });
        }

        req.walletAddress = decoded.walletAddress.toLowerCase();
        req.walletChainId = decoded.chainId;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Wallet session expired. Please sign in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid or forged wallet token.' });
    }
};

/**
 * IDOR / BOLA Prevention Middleware
 * Asserts that the authenticated wallet matches the target wallet in body/params
 */
const requireWalletOwner = (paramName = 'walletAddress') => {
    return (req, res, next) => {
        const targetAddress = (req.body?.[paramName] || req.params?.[paramName] || '').toLowerCase();
        if (!targetAddress) {
            return res.status(400).json({ success: false, message: 'Target wallet address required' });
        }

        if (!req.walletAddress || req.walletAddress !== targetAddress) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: IDOR/BOLA violation. You can only perform operations on your own wallet.'
            });
        }
        next();
    };
};

module.exports = {
    authMiddleware,
    requireSuperAdmin,
    walletAuthMiddleware,
    requireWalletOwner
};

