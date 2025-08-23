-- Create the business_intelligence database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable)

-- Create the UserRole enum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'BUSINESS_OWNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create business_entities table
CREATE TABLE IF NOT EXISTS business_entities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT UNIQUE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isEmailVerified" BOOLEAN DEFAULT false,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP,
    "lastLogin" TIMESTAMP,
    "isActive" BOOLEAN DEFAULT true,
    role "UserRole" DEFAULT 'USER',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "businessEntityId" TEXT REFERENCES business_entities(id),
    "createdBy" TEXT,
    "updatedBy" TEXT
);

-- Create user_audit_logs table
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    action TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_entities_domain ON business_entities(domain);
CREATE INDEX IF NOT EXISTS idx_business_entities_is_active ON business_entities("isActive");
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users("isActive");
CREATE INDEX IF NOT EXISTS idx_users_business_entity_id ON users("businessEntityId");
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_user_id ON user_audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_performed_at ON user_audit_logs("performedAt");

-- Grant permissions to postgres user for external connections
GRANT ALL PRIVILEGES ON DATABASE business_intelligence TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Grant permissions to bi_user for application access
GRANT USAGE ON SCHEMA public TO bi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bi_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO bi_user;

-- Grant permissions on future tables to bi_user
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO bi_user;
