const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDatabase } = require('./config/database');
const { getRedisClient } = require('./config/redis');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const claimRoutes = require('./routes/claim.routes');
const referralRoutes = require('./routes/referral.routes');
const authRoutes = require('./routes/auth.routes');
const { startEventIndexer } = require('./utils/event-indexer');
const { startScheduler } = require('./utils/scheduler');

const app = express();

// ─── Startup Validation ───────────────────────────────────
// Fail fast if critical env vars are missing in production
const REQUIRED_ENV = ['JWT_SECRET', 'DB_PASS', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
if (process.env.NODE_ENV === 'production') {
    const missing = REQUIRED_ENV.filter(k => !process.env[k]);
    if (missing.length > 0) {
        console.error('[STARTUP] Missing required env vars:', missing.join(', '));
        process.exit(1);
    }
}

// Even in development, warn about weak secrets
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
}

// Trust first proxy (NGINX) — required for express-rate-limit behind a reverse proxy
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",  // Required for inline Web3 scripts
                "https://cdn.jsdelivr.net",
                "https://unpkg.com",
                "https://cdnjs.cloudflare.com",
                "https://code.jquery.com",
                "https://static.cloudflareinsights.com",
            ],
            scriptSrcAttr: ["'unsafe-inline'"],  // Required for onclick= handlers in admin panel
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: [
                "'self'",
                "https://bsc-dataseed1.binance.org",
                "https://bsc-dataseed2.binance.org",
                "https://bsc-dataseed3.binance.org",
                "https://bsc-dataseed4.binance.org",
                "https://cdn.jsdelivr.net",  // Source maps
                "https://api.coingecko.com",
                "wss://*.walletconnect.org",  // WalletConnect relay
                "wss://*.walletconnect.com",
                "wss://*.bridge.walletconnect.org",
                "https://cloudflareinsights.com",
            ],
            imgSrc: ["'self'", "data:", "https:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
        },
    },
}));

// ─── CORS — Restrict to allowed origins from .env ────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. server-to-server, health checks)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow local development origins (localhost, 127.0.0.1) on any port
        if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }

        // Block all other origins
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Wallet'],
    maxAge: 86400, // Cache preflight for 24 hours
}));

// ─── Anti-Cache — prevent stale HTML via tunnels/CDNs ──
app.use((req, res, next) => {
    // Skip caching overrides for API and hashed static assets
    if (req.path.startsWith('/api') || req.path.startsWith('/assets')) return next();
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store'
    });
    next();
});

// ─── Rate Limiting ────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minute window
    max: 1500,                 // 1500 req/min (~25 TPS)
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minute window
    max: 60,                   // 60 req/min — hardened admin rate limit
    message: { success: false, message: 'Too many admin requests.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/admin', adminLimiter);
app.use('/api', apiLimiter);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Block Sensitive Files ────────────────────────────────
// Instead of serving the entire project root, we serve only specific safe files
// This replaces the old pattern of express.static(projectRoot) + blocklist

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/referrals', referralRoutes);

// ─── CoinGecko Proxy — Whitelisted paths only ────────────
const ALLOWED_COINGECKO_PATHS = [
    'simple/price',
    'simple/supported_vs_currencies',
    'coins/markets',
    'coins/list',
    'global',
];

app.get('/api/crypto/*', async (req, res) => {
    try {
        const subpath = req.params[0];

        // Sanitize: remove path traversal attempts
        const safePath = subpath.replace(/\.\./g, '').replace(/\/\//g, '/');

        // Whitelist check
        const isAllowed = ALLOWED_COINGECKO_PATHS.some(p => safePath.startsWith(p));
        if (!isAllowed) {
            return res.status(400).json({ error: 'Invalid crypto endpoint' });
        }

        const url = `https://api.coingecko.com/api/v3/${safePath}`;
        const queryString = new URLSearchParams(req.query).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        const response = await fetch(fullUrl, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(10000), // 10s timeout
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(502).json({ error: 'Failed to fetch crypto data' });
    }
});

// Health Check — minimal response (no timestamp leak)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// ─── Safe Static File Serving ─────────────────────────────
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

// Serve public static assets (images, icons)
app.use(express.static(publicDir, {
    maxAge: '1d',
    dotfiles: 'deny'
}));

// Serve built React assets if dist exists
const fs = require('fs');
if (fs.existsSync(distDir)) {
    const assetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(assetsDir)) {
        app.use('/assets', express.static(assetsDir, {
            maxAge: '1y',
            immutable: true,
            dotfiles: 'deny'
        }));
    }
    app.use(express.static(distDir, {
        index: false,
        maxAge: '1h',
        dotfiles: 'deny'
    }));
}

// Serve SPA Entry point (including React Admin Panel)
app.get(['/', '/index.html', '/swap', '/referral', '/claim', '/admin', '/ref/:address'], (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const indexPath = fs.existsSync(path.join(distDir, 'index.html'))
        ? path.join(distDir, 'index.html')
        : path.join(projectRoot, 'index.html');
    res.sendFile(indexPath);
});

// Block legacy static admin HTML/PHP files if requested directly
app.use(['/admin.html', '/admin.php'], (req, res) => {
    res.status(403).json({ success: false, message: 'Forbidden' });
});

// Block everything else — no directory listings, no source access
app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        // Fallback to React index.html for client-side routing
        const indexPath = fs.existsSync(path.join(distDir, 'index.html'))
            ? path.join(distDir, 'index.html')
            : path.join(projectRoot, 'index.html');
        return res.sendFile(indexPath);
    }
    next();
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        // Only expose error details in development
        ...(isProduction ? {} : { error: err.message }),
    });
});

// ─── Database Connection and Server Start ─────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        console.log(`[STARTUP] Starting server on port ${PORT}...`);
        console.log(`[STARTUP] DB: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

        // Connect to PostgreSQL
        await connectDatabase();
        console.log('[STARTUP] ✓ PostgreSQL connected and synced');

        // Initialize Redis
        try {
            getRedisClient();
            console.log('[STARTUP] ✓ Redis connected');
        } catch (err) {
            console.warn('[STARTUP] ⚠ Redis unavailable, using in-memory fallback:', err.message);
        }

        // Start background services
        try {
            startEventIndexer();
            console.log('[STARTUP] ✓ Event indexer started');
        } catch (err) {
            console.warn('[STARTUP] ⚠ Event indexer failed to start:', err.message);
        }

        try {
            startScheduler();
            console.log('[STARTUP] ✓ Scheduler started');
        } catch (err) {
            console.warn('[STARTUP] ⚠ Scheduler failed to start:', err.message);
        }

        // Trigger initial balance synchronization on startup
        try {
            const { refreshAllBalances } = require('./utils/balance-fetcher');
            refreshAllBalances().catch(err => console.warn('[STARTUP] Balance sync notice:', err.message));
        } catch (err) {
            console.warn('[STARTUP] Could not trigger initial balance sync:', err.message);
        }

        app.listen(PORT, () => {
            console.log(`[STARTUP] 🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('[STARTUP] ✗ Fatal startup error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

startServer();

// ─── Graceful Shutdown ────────────────────────────────────
const shutdown = async (signal) => {
    console.log(`[SHUTDOWN] Received ${signal}, shutting down gracefully...`);
    try {
        const { sequelize } = require('./config/database');
        await sequelize.close();
        console.log('[SHUTDOWN] Database connections closed');
    } catch (err) {
        console.error('[SHUTDOWN] Error closing database:', err.message);
    }
    try {
        const { getRedisClient } = require('./config/redis');
        const redis = getRedisClient();
        if (redis) await redis.quit();
        console.log('[SHUTDOWN] Redis connection closed');
    } catch (err) {
        // Redis may not be available
    }
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
