-- Initialize Keycloak database
CREATE DATABASE keycloak;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE keycloak TO academy;

-- Create extensions for academy database
\c academy;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create initial tables (basic structure)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'STUDENT',
    municipality_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default admin user (will be replaced by Keycloak sync)
INSERT INTO users (keycloak_id, email, name, role) 
VALUES ('admin', 'admin@extrata.gov.br', 'Administrador', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Create a simple health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy';
END;
$$ LANGUAGE plpgsql;

-- Log initialization
INSERT INTO users (keycloak_id, email, name, role) 
VALUES ('system', 'system@extrata.gov.br', 'Sistema', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

