const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const { body, query, validationResult } = require('express-validator');
const { getRedisClient } = require('../config/redis');

// In-memory fallback for nonces if Redis is unavailable
const memoryNonceStore = new Map();
const NONCE_TTL_SECONDS = 300; // 5 minutes validity

// BSC Chain IDs
const BSC_MAINNET_ID = 56;
const BSC_TESTNET_ID = 97;

/**
 * Helper: Store nonce with expiration
 */
async function storeNonce(address, nonce) {
    const key = `nonce:${address.toLowerCase()}`;
    try {
        const redis = getRedisClient();
        await redis.setex(key, NONCE_TTL_SECONDS, nonce);
    } catch {
        // Fallback to in-memory store
        memoryNonceStore.set(key, {
            nonce,
            expiresAt: Date.now() + NONCE_TTL_SECONDS * 1000
        });
    }
}

/**
 * Helper: Get and immediately burn (delete) nonce for single-use replay protection
 */
async function getAndBurnNonce(address) {
    const key = `nonce:${address.toLowerCase()}`;
    let storedNonce = null;

    try {
        const redis = getRedisClient();
        storedNonce = await redis.get(key);
        if (storedNonce) {
            await redis.del(key); // Burn immediately
        }
    } catch {
        const item = memoryNonceStore.get(key);
        if (item) {
            memoryNonceStore.delete(key); // Burn immediately
            if (Date.now() <= item.expiresAt) {
                storedNonce = item.nonce;
            }
        }
    }

    return storedNonce;
}

/**
 * Format the standard cryptographic challenge message
 */
function formatChallengeMessage(address, nonce, chainId) {
    return [
        'Welcome to BLove-Krack!',
        '',
        'Sign this message to authenticate your wallet with zero gas fees.',
        'This signature verifies your ownership of this wallet address.',
        '',
        `Wallet: ${address.toLowerCase()}`,
        `Chain ID: ${chainId} (Binance Smart Chain)`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`
    ].join('\n');
}

/**
 * GET /api/auth/nonce
 * Issues a cryptographically random, single-use challenge nonce for the specified wallet.
 */
router.get('/nonce', [
    query('address').isEthereumAddress().withMessage('Valid Ethereum/BSC address required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const address = req.query.address.toLowerCase();
        const chainId = parseInt(process.env.BSC_CHAIN_ID, 10) || BSC_MAINNET_ID;

        // Generate 32-byte cryptographically secure random nonce
        const nonce = crypto.randomBytes(32).toString('hex');

        // Store nonce with 5-minute TTL
        await storeNonce(address, nonce);

        // Build human-readable challenge message
        const message = formatChallengeMessage(address, nonce, chainId);

        res.json({
            success: true,
            address,
            nonce,
            chainId,
            message,
            expiresIn: NONCE_TTL_SECONDS
        });
    } catch (error) {
        console.error('Nonce generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate authentication challenge' });
    }
});

/**
 * POST /api/auth/verify
 * Verifies the signed message against the issued nonce.
 * Enforces single-use nonce burning (replay protection) and issues a scoped JWT.
 */
router.post('/verify', [
    body('address').isEthereumAddress().withMessage('Valid Ethereum/BSC address required'),
    body('signature').matches(/^0x[a-fA-F0-9]{130}$/).withMessage('Valid signature required (65-byte hex)'),
    body('message').notEmpty().withMessage('Original signed challenge message required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { address, signature, message } = req.body;
        const normalizedAddress = address.toLowerCase();

        // ── 1. Replay & Nonce Check ──
        // Retrieve and immediately burn the nonce
        const storedNonce = await getAndBurnNonce(normalizedAddress);

        if (!storedNonce) {
            return res.status(401).json({
                success: false,
                message: 'Challenge expired or already used. Please request a new nonce.'
            });
        }

        // Verify that the message includes the exact stored nonce
        if (!message.includes(storedNonce)) {
            return res.status(401).json({
                success: false,
                message: 'Challenge message does not match current valid nonce'
            });
        }

        // ── 2. Cryptographic Elliptic Curve Recovery ──
        let recoveredAddress;
        try {
            recoveredAddress = ethers.verifyMessage(message, signature);
        } catch (sigErr) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature encoding or format'
            });
        }

        if (recoveredAddress.toLowerCase() !== normalizedAddress) {
            return res.status(401).json({
                success: false,
                message: 'Signature does not match the claimed wallet address'
            });
        }

        // ── 3. Issue Scoped Wallet Session Token ──
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ success: false, message: 'Server authentication configuration missing' });
        }

        const jti = crypto.randomUUID();
        const token = jwt.sign(
            {
                walletAddress: normalizedAddress,
                chainId: parseInt(process.env.BSC_CHAIN_ID, 10) || BSC_MAINNET_ID,
                type: 'wallet_auth',
                jti
            },
            jwtSecret,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            message: 'Wallet authenticated successfully',
            walletAddress: normalizedAddress,
            token,
            expiresIn: '12h'
        });
    } catch (error) {
        console.error('Wallet verification error:', error);
        res.status(500).json({ success: false, message: 'Authentication verification failed' });
    }
});

module.exports = router;
