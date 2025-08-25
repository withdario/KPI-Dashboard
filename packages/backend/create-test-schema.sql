-- Create test schema for isolated testing
CREATE SCHEMA IF NOT EXISTS test;

-- Grant necessary permissions
GRANT ALL ON SCHEMA test TO postgres;
GRANT USAGE ON SCHEMA test TO postgres;

-- Set search path for test schema
SET search_path TO test, public;

-- You can also create test-specific tables here if needed
-- For now, we'll just create the schema
