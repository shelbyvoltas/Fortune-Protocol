require('dotenv').config();
const { connectDatabase, AdminUser, ApprovalAddress, sequelize } = require('./config/database');
const bcrypt = require('bcryptjs');

/**
 * Initialize Database with Default Admin User and Contract Address
 * Run this script once to set up the database
 * 
 * Usage: node server/init-db.js
 */

async function initializeDatabase() {
    try {

        // Connect and Sync Database (creates tables)
        await connectDatabase();

        // Create initial admin user if credentials provided in environment
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
            console.log('[Init-DB] ADMIN_USERNAME and ADMIN_PASSWORD must be configured in .env to create admin user.');
        } else {
            const existingAdmin = await AdminUser.findOne({ where: { username: adminUsername } });

            if (!existingAdmin) {
                const salt = await bcrypt.genSalt(12);
                const passwordHash = await bcrypt.hash(adminPassword, salt);

                await AdminUser.create({
                    username: adminUsername,
                    passwordHash,
                    email: process.env.ADMIN_EMAIL || 'admin@cryptofortune.live',
                    role: 'superadmin',
                    isActive: true
                });
                console.log(`[Init-DB] Superadmin "${adminUsername}" created successfully.`);
            } else {
                console.log(`[Init-DB] Admin user "${adminUsername}" already exists.`);
            }
        }

        // Add smart contract address if provided
        const contractAddress = process.env.SMART_CONTRACT_ADDRESS || process.env.MINE_CONTRACT_ADDRESS;

        if (contractAddress && contractAddress.startsWith('0x')) {
            const existingContract = await ApprovalAddress.findOne({
                where: { contractAddress: contractAddress.toLowerCase() }
            });

            if (!existingContract) {
                await ApprovalAddress.create({
                    contractAddress: contractAddress.toLowerCase(),
                    description: 'Fortune Protocol G - Main Contract',
                    chainId: parseInt(process.env.BSC_CHAIN_ID) || 56,
                    isActive: true,
                    addedBy: 'system'
                });
                console.log('[Init-DB] Contract address registered.');
            }
        }
            }
        }

        process.exit(0);

    } catch (error) {
        process.exit(1);
    }
}

// Run initialization
initializeDatabase();
