require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const { Sequelize } = require('sequelize');

/**
 * Fortune Protocol G — Database Migration & Verification Utility
 * Phase Eight Database Migration Tool
 * 
 * Usage:
 *   node server/scripts/migrate-to-fortune-db.js [--rename | --copy | --verify]
 */

const SOURCE_DB = process.env.SOURCE_DB_NAME || 'BLove-Krack';
const TARGET_DB = process.env.DB_NAME || 'fortune_protocol_g';

const pgConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS,
};

async function runMigration() {
    const mode = process.argv[2] || '--copy';
    console.log('=====================================================');
    console.log(' Fortune Protocol G — Database Migration Utility');
    console.log('=====================================================');
    console.log(`Source Database : "${SOURCE_DB}"`);
    console.log(`Target Database : "${TARGET_DB}"`);
    console.log(`Host            : ${pgConfig.host}:${pgConfig.port}`);
    console.log(`User            : ${pgConfig.user}`);
    console.log(`Mode            : ${mode}`);
    console.log('-----------------------------------------------------');

    const adminClient = new Client({ ...pgConfig, database: 'postgres' });

    try {
        await adminClient.connect();
        console.log('[1/5] Connected to administrative database (postgres).');

        // Check which databases exist
        const dbCheckRes = await adminClient.query(
            `SELECT datname FROM pg_database WHERE datname IN ($1, $2)`,
            [SOURCE_DB, TARGET_DB]
        );
        const existingDbs = dbCheckRes.rows.map(r => r.datname);
        const sourceExists = existingDbs.includes(SOURCE_DB);
        const targetExists = existingDbs.includes(TARGET_DB);

        console.log(`[2/5] Database Status:`);
        console.log(`      - "${SOURCE_DB}" exists: ${sourceExists}`);
        console.log(`      - "${TARGET_DB}" exists: ${targetExists}`);

        if (mode === '--verify') {
            if (!targetExists) {
                console.error(`? Target database "${TARGET_DB}" does not exist.`);
                process.exit(1);
            }
            console.log(`[3/5] Skipping migration, verifying "${TARGET_DB}"...`);
        } else if (targetExists) {
            console.log(`[3/5] Target database "${TARGET_DB}" already exists. Proceeding to verification.`);
        } else if (sourceExists) {
            console.log(`[3/5] Terminating active connections to "${SOURCE_DB}"...`);
            await adminClient.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = $1 AND pid <> pg_backend_pid()
            `, [SOURCE_DB]);

            if (mode === '--rename') {
                console.log(`      Renaming "${SOURCE_DB}" to "${TARGET_DB}"...`);
                await adminClient.query(`ALTER DATABASE "${SOURCE_DB}" RENAME TO "${TARGET_DB}"`);
                console.log(`      ? Database renamed successfully.`);
            } else {
                console.log(`      Creating "${TARGET_DB}" using "${SOURCE_DB}" as template (safe copy)...`);
                await adminClient.query(`CREATE DATABASE "${TARGET_DB}" WITH TEMPLATE "${SOURCE_DB}"`);
                console.log(`      ? Database cloned successfully.`);
            }
        } else {
            console.log(`[3/5] Neither database exists. Creating clean "${TARGET_DB}"...`);
            await adminClient.query(`CREATE DATABASE "${TARGET_DB}"`);
            console.log(`      ? Database "${TARGET_DB}" created.`);
        }

        await adminClient.end();

        // [4/5] Verify Target Database connection and tables
        console.log(`[4/5] Connecting to target database "${TARGET_DB}" to verify schema...`);
        const targetClient = new Client({ ...pgConfig, database: TARGET_DB });
        await targetClient.connect();

        const tablesRes = await targetClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        console.log(`      Found ${tablesRes.rows.length} tables in "${TARGET_DB}":`);
        for (const row of tablesRes.rows) {
            const countRes = await targetClient.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
            console.log(`      - ${row.table_name.padEnd(25)} : ${countRes.rows[0].count} rows`);
        }

        await targetClient.end();

        console.log('[5/5] Migration & Verification Complete!');
        console.log('=====================================================');
        console.log('Rollback Instructions (if needed):');
        console.log(`  To rollback to "${SOURCE_DB}":`);
        console.log(`  1. Update DB_NAME=${SOURCE_DB} in .env`);
        console.log(`  2. If renamed, run: ALTER DATABASE "${TARGET_DB}" RENAME TO "${SOURCE_DB}";`);
        console.log('=====================================================');
        process.exit(0);

    } catch (err) {
        console.error('? Migration Error:', err.message);
        await adminClient.end().catch(() => {});
        process.exit(1);
    }
}

runMigration();
