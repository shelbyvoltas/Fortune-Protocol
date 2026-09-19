require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS,
    database: 'postgres' // Connect to default DB first
});

async function run() {
    try {
        await client.connect();
        console.log('[DB] Connected to postgres (default DB)');

        const dbName = process.env.DB_NAME || 'BLove-Krack';

        // Check if DB exists
        const res = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
        );

        if (res.rows.length > 0) {
            console.log(`[DB] Database "${dbName}" already exists.`);
        } else {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`[DB] Database "${dbName}" created successfully!`);
        }

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('[DB] Error:', err.message);
        await client.end().catch(() => {});
        process.exit(1);
    }
}

run();
