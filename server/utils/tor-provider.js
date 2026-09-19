/**
 * Tor-Proxied Ethers.js Provider
 * 
 * Routes all outbound BSC RPC calls through a Tor SOCKS5 proxy
 * for IP rotation. Each circuit rotates every ~60s, giving
 * a fresh exit IP to prevent fingerprinting/rate-limiting.
 * 
 * Usage:
 *   const { createTorProvider } = require('./tor-provider');
 *   const provider = createTorProvider('https://bsc-dataseed1.binance.org/');
 * 
 * Falls back to direct connection if TOR_PROXY env var is not set.
 */

const { ethers } = require('ethers');

let SocksProxyAgent;
try {
    SocksProxyAgent = require('socks-proxy-agent').SocksProxyAgent;
} catch {
    // socks-proxy-agent not installed — Tor proxy won't be available
    SocksProxyAgent = null;
}

const TOR_PROXY = process.env.TOR_PROXY || '';

/**
 * Check if Tor proxy is configured and available
 */
function isTorEnabled() {
    return !!(TOR_PROXY && SocksProxyAgent);
}

/**
 * Create an ethers.js JsonRpcProvider that routes through Tor SOCKS5
 * 
 * @param {string} rpcUrl - BSC RPC endpoint URL
 * @param {number} [timeout=15000] - Request timeout in ms
 * @returns {ethers.JsonRpcProvider}
 */
function createTorProvider(rpcUrl, timeout = 15000) {
    if (!isTorEnabled()) {
        // Fallback: direct connection (no Tor)
        return new ethers.JsonRpcProvider(rpcUrl, undefined, {
            staticNetwork: true,
            batchMaxCount: 1,
        });
    }

    // Create SOCKS5 agent pointing to the Tor container
    const agent = new SocksProxyAgent(TOR_PROXY);

    // Build a custom FetchRequest that uses the SOCKS5 agent
    const fetchReq = new ethers.FetchRequest(rpcUrl);
    fetchReq.timeout = timeout;

    // Override getUrlFunc to inject the SOCKS5 proxy agent
    fetchReq.getUrlFunc = ethers.FetchRequest.createGetUrlFunc({ agent });

    const provider = new ethers.JsonRpcProvider(fetchReq, undefined, {
        staticNetwork: true,
        batchMaxCount: 1,
    });

    return provider;
}

/**
 * Test the Tor connection by checking our exit IP
 * Run: docker exec blk-backend node -e "require('./utils/tor-provider').test()"
 */
async function test() {
    if (!isTorEnabled()) {
        console.log('[TorProvider] Tor not enabled (TOR_PROXY not set or socks-proxy-agent missing)');
        return;
    }

    try {
        const http = require('http');
        const { SocksProxyAgent } = require('socks-proxy-agent');
        const agent = new SocksProxyAgent(TOR_PROXY);

        // Check exit IP via Tor project's API
        const checkUrl = 'http://check.torproject.org/api/ip';
        
        return new Promise((resolve, reject) => {
            const req = http.get(checkUrl, { agent }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        console.log(`[TorProvider] ✓ Tor connected — Exit IP: ${result.IP}, IsTor: ${result.IsTor}`);
                        resolve(result);
                    } catch (e) {
                        console.log('[TorProvider] Response:', data);
                        resolve(data);
                    }
                });
            });
            req.on('error', (err) => {
                console.error('[TorProvider] ✗ Tor connection failed:', err.message);
                reject(err);
            });
            req.setTimeout(15000, () => {
                req.destroy();
                reject(new Error('Tor connection timeout'));
            });
        });
    } catch (err) {
        console.error('[TorProvider] ✗ Test failed:', err.message);
    }
}

module.exports = {
    createTorProvider,
    isTorEnabled,
    test,
};
