-- Fortune Protocol G - Database Initialization Script
-- This script runs automatically on first PostgreSQL container startup.
-- Sequelize handles table creation and migration via sync({ alter: true }).

-- Create the database (if not already created by POSTGRES_DB env var)
SELECT 'CREATE DATABASE "fortune_protocol_g"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fortune_protocol_g')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "fortune_protocol_g" TO postgres;

-- Connect to the fortune_protocol_g database
\c "fortune_protocol_g"

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Log success
DO $$
BEGIN
    RAISE NOTICE '✅ Fortune Protocol G database initialized successfully!';
END $$;
