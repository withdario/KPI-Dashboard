# Deployment Architecture

## Cloud-Native Architecture

### Supabase Database Infrastructure

The project uses Supabase PostgreSQL as the primary database, eliminating the need for local Docker containers and providing enterprise-grade database management.

#### Database Configuration

```typescript
// Database connection configuration
const databaseConfig = {
  // Production connection with connection pooling
  DATABASE_URL: "postgresql://postgres:[PASSWORD]@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true",
  
  // Direct connection for migrations and direct access
  DIRECT_URL: "postgresql://postgres:[PASSWORD]@aws-1-eu-central-2.supabase.com:5432/postgres",
  
  // Test schema for isolated testing
  TEST_SCHEMA: "test"
};
```

#### Database Schema Structure

```sql
-- Main production schema (postgres)
-- Contains all production data and business logic

-- Test schema for isolated testing
CREATE SCHEMA IF NOT EXISTS test;
GRANT ALL ON SCHEMA test TO postgres;
GRANT USAGE ON SCHEMA test TO postgres;
```

### Application Deployment

#### Backend Deployment

```typescript
// Backend service configuration
const backendConfig = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    testSchema: process.env.TEST_SCHEMA
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
};
```

#### Frontend Deployment

```typescript
// Frontend configuration
const frontendConfig = {
  port: 3001,
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development'
};
```

## Development Environment

### Local Development Setup

```bash
# No Docker required - database runs in Supabase cloud
# Only need Node.js and environment variables

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your Supabase credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev:backend  # Backend on port 3000
npm run dev:frontend # Frontend on port 3001
```

### Testing Environment

```bash
# Tests use the test schema in Supabase
# Isolated from production data

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern=metrics
```

## Production Deployment

### Supabase Production Database

- **Host**: aws-1-eu-central-2.pooler.supabase.com
- **Port**: 6543 (pooled), 5432 (direct)
- **Database**: postgres
- **Schema**: postgres (production), test (testing)
- **Connection Pooling**: Enabled via pgbouncer
- **Backup**: Automated daily backups
- **Monitoring**: Built-in Supabase monitoring

### Application Deployment

```yaml
# Example deployment configuration (Kubernetes/Cloud)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kpi-dashboard-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kpi-dashboard-backend
  template:
    metadata:
      labels:
        app: kpi-dashboard-backend
    spec:
      containers:
        - name: backend
          image: kpi-dashboard/backend:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: supabase-secret
                  key: database-url
            - name: DIRECT_URL
              valueFrom:
                secretKeyRef:
                  name: supabase-secret
                  key: direct-url
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run Tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          DIRECT_URL: ${{ secrets.TEST_DIRECT_URL }}

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Application
        run: npm run build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Deploy to your cloud platform
          # Database is already running in Supabase
```

## Infrastructure Benefits

### Supabase Advantages

- **No Local Database Setup**: Database runs in cloud
- **Automatic Scaling**: Handles traffic spikes automatically
- **Built-in Security**: Row-level security, authentication
- **Real-time Features**: Built-in real-time subscriptions
- **Backup & Recovery**: Automated daily backups
- **Monitoring**: Built-in performance monitoring
- **Connection Pooling**: Optimized database connections

### Development Benefits

- **Faster Setup**: No Docker containers to manage
- **Consistent Environment**: Same database in dev/staging/prod
- **Team Collaboration**: Shared database for team development
- **Testing Isolation**: Test schema prevents data conflicts
- **Production Parity**: Development matches production exactly
