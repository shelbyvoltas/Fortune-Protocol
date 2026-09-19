-- PVC Meta Blockchain - Database Initialization Script
-- This script runs automatically on first PostgreSQL container startup.
-- Sequelize handles table creation and migration via sync({ alter: true }).

-- Create the database (if not already created by POSTGRES_DB env var)
SELECT 'CREATE DATABASE "BLove-Krack"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'BLove-Krack')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "BLove-Krack" TO postgres;

-- Connect to the BLove-Krack database
\c "BLove-Krack"

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Log success
DO $$
BEGIN
    RAISE NOTICE '✅ PVC Meta database initialized successfully!';
END $$;
