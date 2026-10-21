require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'fortune_protocol_g',
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
});

console.log('Connecting to PostgreSQL database:', client.connectionParameters.database);

client.connect()
    .then(() => {
        console.log('✅ Connected successfully to', client.connectionParameters.database);
        return client.query('SELECT 1 as test');
    })
    .then(res => {
        console.log('Result:', res.rows[0]);
        client.end();
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
        client.end().catch(() => {});
    });
