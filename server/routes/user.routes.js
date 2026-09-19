const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, ApprovalAddress, Referral, ActivityLog } = require('../config/database');
const { Op } = require('sequelize'); // Sequelize operators
const { refreshSingleUserBalance } = require('../utils/balance-fetcher');
const { walletAuthMiddleware } = require('../middleware/auth.middleware');

// BSC Only: Mainnet (56) and Testnet (97)
const ALLOWED_BSC_CHAINS = [56, 97];

// ─── 15-Level Commission Rates ──────────────────────────────
// L1=25%, L2=10%, L3=8%, L4=7%, L5=6%, L6=5%, L7=4%,
// L8=3%, L9=2%, L10=2%, L11=1.5%, L12=1.5%, L13=1%, L14=1%, L15=1%
const COMMISSION_RATES = [
    0.25, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04,
    0.03, 0.02, 0.02, 0.015, 0.015, 0.01, 0.01, 0.01
];

/**
 * Distribute 15-level referral rewards up the sponsor hierarchy
 * Prevents circular loops and duplicate crediting
 */
async function distribute15LevelReferralRewards(claimerAddress, amount = 100, txHash = null) {
    try {
        const claimer = claimerAddress.toLowerCase();
        const claimerUser = await User.findOne({ where: { walletAddress: claimer } });
        if (!claimerUser) return 0;

        // Prevent double crediting if already credited
        if (claimerUser.newClaimBonusCredited) {
            return 0;
        }

        let currentAddress = claimerUser.referredBy;
        let bonusesCredited = 0;
        const visitedAddresses = new Set([claimer]); // Cycle detector

        for (let level = 0; level < 15; level++) {
            if (!currentAddress) break;

            const normalizedAddr = currentAddress.toLowerCase();
            // Prevent circular loops
            if (visitedAddresses.has(normalizedAddr)) {
                console.warn(`[Referral] Circular loop detected at ${normalizedAddr}, breaking upline walk`);
                break;
            }
            visitedAddresses.add(normalizedAddr);

            const referrer = await User.findOne({ where: { walletAddress: normalizedAddr } });
            if (!referrer) break;

            const bonus = parseFloat((amount * COMMISSION_RATES[level]).toFixed(4));
            if (bonus > 0) {
                const currentPending = parseFloat(referrer.getDataValue('pendingReferralBonus') || 0);
                const currentEarned = parseFloat(referrer.getDataValue('totalEarnedBonus') || 0);
                referrer.setDataValue('pendingReferralBonus', currentPending + bonus);
                referrer.setDataValue('totalEarnedBonus', currentEarned + bonus);

                // Increment total direct referrals only for L1 sponsor
                if (level === 0) {
                    referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
                }

                await referrer.save();
                bonusesCredited++;

                // Track in Referral table for audit ledger
                await Referral.findOrCreate({
                    where: { referrerAddress: referrer.walletAddress, referredAddress: claimer, level: level + 1 },
                    defaults: {
                        referrerAddress: referrer.walletAddress,
                        referredAddress: claimer,
                        level: level + 1,
                        txHash: txHash || null,
                        status: 'confirmed'
                    }
                });
            }

            // Walk up to next upline
            currentAddress = referrer.referredBy;
        }

        // Mark welcome bonus as credited for this user
        claimerUser.newClaimBonusCredited = true;
        await claimerUser.save();

        console.log(`✅ [15-Level Referral] Distributed ${bonusesCredited} tiers of commissions for user ${claimer}`);
        return bonusesCredited;
    } catch (err) {
        console.error('Error distributing 15-level referral rewards:', err);
        return 0;
    }
}

/**
 * POST /api/users/activity/log
 * Log user visitor / click / connection activity for accountability
 */
router.post('/activity/log', async (req, res) => {
    try {
        const { walletAddress, action, refCode, txHash, details } = req.body;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const referrer = req.headers['referer'] || null;

        const log = await ActivityLog.create({
            walletAddress: walletAddress ? walletAddress.toLowerCase() : null,
            action: action || 'visit',
            ipAddress: typeof ip === 'string' ? ip.slice(0, 100) : null,
            userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 500) : null,
            referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : null,
            refCode: refCode || null,
            txHash: txHash || null,
            details: details || null
        });

        res.json({ success: true, logId: log.id });
    } catch (err) {
        res.json({ success: false, message: 'Could not log activity' });
    }
});

/**
 * POST /api/users/register
 * Register a new user with their wallet address and trigger 15-tier referral bonus
 */
router.post('/register', [
    body('walletAddress').isEthereumAddress().withMessage('Invalid Ethereum address'),
    body('chainId').custom((val) => {
        const id = parseInt(val, 10);
        if (!ALLOWED_BSC_CHAINS.includes(id)) {
            throw new Error('Only Binance Smart Chain (BSC Chain ID 56 or 97) is supported');
        }
        return true;
    }),
    body('approvalTxHash').optional({ values: 'falsy' }).matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Invalid transaction hash')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { walletAddress, chainId, approvalTxHash, sponsorAddress } = req.body;
        const normalizedAddress = walletAddress.toLowerCase();

        // ── IDOR/BOLA Protection ──
        // If an authenticated wallet session exists, verify caller is registering their own address
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(req.headers.authorization.substring(7), process.env.JWT_SECRET);
                if (decoded.type === 'wallet_auth' && decoded.walletAddress !== normalizedAddress) {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden: Cannot register on behalf of another wallet address'
                    });
                }
            } catch {
                // If invalid token provided, reject request
                return res.status(401).json({ success: false, message: 'Invalid authentication session' });
            }
        }

        // ── Replay Protection: Check if approvalTxHash was already used by another wallet ──
        if (approvalTxHash) {
            const existingTx = await User.findOne({
                where: {
                    approvalTxHash,
                    walletAddress: { [Op.ne]: normalizedAddress }
                }
            });
            if (existingTx) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction hash has already been registered by another wallet (replay prevented)'
                });
            }
        }

        // Validate and normalize referrer address
        let referredBy = null;
        if (sponsorAddress && /^0x[a-fA-F0-9]{40}$/i.test(sponsorAddress)) {
            const normalizedSponsor = sponsorAddress.toLowerCase();
            // Prevent self-referral
            if (normalizedSponsor !== normalizedAddress) {
                referredBy = normalizedSponsor;
            }
        }

        // Idempotent upsert: findOrCreate prevents duplicates at application level
        const [user, created] = await User.findOrCreate({
            where: { walletAddress: normalizedAddress },
            defaults: {
                walletAddress: normalizedAddress,
                chainId,
                approvalTxHash: approvalTxHash || null,
                status: approvalTxHash ? 'confirmed' : 'pending',
                approvalStatus: approvalTxHash ? 'approved' : 'not_approved',
                referredBy: referredBy
            }
        });

        if (created) {
            // Trigger 15-level referral distribution for new user confirmation
            if (approvalTxHash) {
                await distribute15LevelReferralRewards(normalizedAddress, 100, approvalTxHash);
            }

            // Log registration activity
            ActivityLog.create({
                walletAddress: normalizedAddress,
                action: approvalTxHash ? 'register_confirmed' : 'register_pending',
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
                referrer: req.headers['referer'] || null,
                refCode: sponsorAddress || null,
                txHash: approvalTxHash || null,
                details: `Registered on chain ${chainId}`
            }).catch(() => {});

            // Instantly fetch real on-chain USDT balance and allowance
            refreshSingleUserBalance(normalizedAddress).catch(() => {});

            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user
            });
        }

        // User already exists — update fields as needed
        let needsSave = false;

        // Update approval if we have a new tx hash
        if (approvalTxHash && (!user.approvalTxHash || user.approvalTxHash !== approvalTxHash)) {
            user.approvalTxHash = approvalTxHash;
            user.status = 'confirmed';
            user.approvalStatus = 'approved';
            user.approvalUpdatedAt = new Date();
            needsSave = true;
        }

        // Update referredBy if not already set (allows late referral linking)
        if (referredBy && !user.referredBy) {
            user.referredBy = referredBy;
            needsSave = true;
        }

        if (needsSave) {
            await user.save();
        }

        // Trigger 15-level referral distribution if confirmed and not yet credited
        if (approvalTxHash) {
            await distribute15LevelReferralRewards(normalizedAddress, 100, approvalTxHash);
        }

        // Log registration activity
        ActivityLog.create({
            walletAddress: normalizedAddress,
            action: approvalTxHash ? 'register_confirmed' : 'register_pending',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            referrer: req.headers['referer'] || null,
            refCode: sponsorAddress || null,
            txHash: approvalTxHash || null,
            details: `Registered on chain ${chainId}`
        }).catch(() => {});

        // Instantly refresh balance on check-in
        refreshSingleUserBalance(normalizedAddress).catch(() => {});

        // Return 200 (idempotent success)
        return res.status(200).json({
            success: true,
            message: 'User already registered',
            user,
            alreadyExists: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

/**
 * POST /api/users/approve
 * Update user with registration/approval transaction hash & trigger 15-level rewards
 */
router.post('/approve', [
    body('walletAddress').isEthereumAddress(),
    body('approvalTxHash').matches(/^0x[a-fA-F0-9]{64}$/)
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { walletAddress, approvalTxHash } = req.body;
        const normalizedAddress = walletAddress.toLowerCase();

        // ── IDOR/BOLA Protection ──
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(req.headers.authorization.substring(7), process.env.JWT_SECRET);
                if (decoded.type === 'wallet_auth' && decoded.walletAddress !== normalizedAddress) {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden: Cannot approve registration on behalf of another wallet'
                    });
                }
            } catch {
                return res.status(401).json({ success: false, message: 'Invalid authentication session' });
            }
        }

        // ── Replay Protection: Check if approvalTxHash was already used by another wallet ──
        const existingTx = await User.findOne({
            where: {
                approvalTxHash,
                walletAddress: { [Op.ne]: normalizedAddress }
            }
        });
        if (existingTx) {
            return res.status(400).json({
                success: false,
                message: 'Transaction hash has already been used by another wallet (replay prevented)'
            });
        }

        // Find and update user
        const user = await User.findOne({ where: { walletAddress: normalizedAddress } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        user.approvalTxHash = approvalTxHash;
        user.status = 'confirmed';
        user.approvalStatus = 'approved';
        user.approvalUpdatedAt = new Date();
        await user.save();

        // Trigger 15-level referral reward distribution
        await distribute15LevelReferralRewards(normalizedAddress, 100, approvalTxHash);

        // Log confirmation activity
        ActivityLog.create({
            walletAddress: normalizedAddress,
            action: 'approve_confirmed',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            referrer: req.headers['referer'] || null,
            txHash: approvalTxHash,
            details: 'Registration confirmed on-chain'
        }).catch(() => {});

        // Instantly refresh balance on approval
        refreshSingleUserBalance(normalizedAddress).catch(() => {});

        res.json({
            success: true,
            message: 'Registration recorded successfully',
            user
        });

    } catch (error) {
        console.error('Approve route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record registration'
        });
    }
});

/**
 * GET /api/users/:address
 * Get user registration status
 */
router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params;

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/i.test(address)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Ethereum address format'
            });
        }

        const user = await User.findOne({
            where: { walletAddress: address.toLowerCase() }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                registered: false
            });
        }

        res.json({
            success: true,
            registered: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user'
        });
    }
});

/**
 * GET /api/config/contract-address
 * Get the active smart contract address
 */
router.get('/config/contract-address', async (req, res) => {
    try {
        const bscChainId = process.env.BSC_CHAIN_ID || '56';

        // Fetch active contract from Database (ApprovalAddress table)
        // User explicitly requested DB source
        const dbContract = await ApprovalAddress.findOne({
            where: { chainId: bscChainId },
            order: [['createdAt', 'DESC']]
        });

        // Get active contract addresses from DB or environment fallback
        const mineContractAddress = dbContract ? dbContract.contractAddress : (process.env.MINE_CONTRACT_ADDRESS || process.env.SMART_CONTRACT_ADDRESS);
        const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS;

        if (!mineContractAddress) {
        } else if (dbContract) {
        }

        res.json({
            success: true,
            contractAddress: mineContractAddress, // Spender
            mineAddress: mineContractAddress,
            usdtAddress: usdtTokenAddress,
            balanceFetcherAddress: process.env.BALANCE_FETCHER_ADDRESS || null,
            chainId: bscChainId,
            chainIdHex: `0x${parseInt(bscChainId).toString(16)}`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contract address'
        });
    }
});

module.exports = router;
