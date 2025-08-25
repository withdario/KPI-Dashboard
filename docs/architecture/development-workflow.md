# Development Workflow

## Development Environment

### Local Setup

```bash
# Clone repository
git clone https://github.com/your-org/kpi-dashboard.git
cd kpi-dashboard

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your Supabase credentials

# No Docker required - database runs in Supabase cloud
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev:backend  # Backend on :3000
npm run dev:frontend # Frontend on :3001
```

### Environment Configuration

```bash
# Development environment
NODE_ENV=development
# Supabase database with connection pooling
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true
# Direct connection for migrations
DIRECT_URL=postgresql://postgres:[PASSWORD]@aws-1-eu-central-2.supabase.com:5432/postgres
# Test schema for isolated testing
TEST_SCHEMA=test
# Local Redis for caching/sessions
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-dev-secret-key
GOOGLE_ANALYTICS_CLIENT_ID=your-ga-client-id
GOOGLE_ANALYTICS_CLIENT_SECRET=your-ga-client-secret

# Production environment
NODE_ENV=production
# Same Supabase database (different credentials)
DATABASE_URL=postgresql://postgres:[PROD-PASSWORD]@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PROD-PASSWORD]@aws-1-eu-central-2.supabase.com:5432/postgres
# Production Redis (cloud-based)
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=your-production-secret-key
```

## Development Workflow

### Git Workflow

```
main branch (production)
    ↑
develop branch (staging)
    ↑
feature branches (development)
    ↑
bugfix branches (hotfixes)
```

### Development Process

1. **Feature Development**
   - Create feature branch from develop
   - Implement feature with tests
   - Create pull request to develop
   - Code review and approval
   - Merge to develop

2. **Release Process**
   - Create release branch from develop
   - Final testing and bug fixes
   - Merge to main for production
   - Tag release version
   - Deploy to production

3. **Hotfix Process**
   - Create hotfix branch from main
   - Fix critical issue
   - Test thoroughly
   - Merge to main and develop
   - Deploy immediately

## Supabase Development Benefits

### Database Management

- **No Local Setup**: Database runs in Supabase cloud
- **Automatic Migrations**: Prisma handles schema changes
- **Test Isolation**: Test schema prevents data conflicts
- **Production Parity**: Development matches production exactly
- **Team Collaboration**: Shared database for team development

### Development Workflow Advantages

- **Faster Setup**: No Docker containers to manage
- **Consistent Environment**: Same database across all environments
- **Real-time Features**: Built-in real-time subscriptions
- **Built-in Security**: Row-level security, authentication
- **Automatic Backups**: Daily automated backups

## Code Standards

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Code Style Guidelines

- **Naming Conventions:** camelCase for variables, PascalCase for classes
- **File Organization:** Feature-based folder structure
- **Import Order:** Third-party, internal, relative imports
- **Documentation:** JSDoc comments for public APIs
- **Error Handling:** Consistent error handling patterns
