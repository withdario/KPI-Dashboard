# Business Intelligence Platform

A modern, scalable business intelligence platform built with Node.js, React, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 9+

### Development Setup

1. **Clone and Install Dependencies**

   ```bash
   git clone <repository-url>
   cd business-intelligence-platform
   npm run setup
   ```

2. **Environment Configuration**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Environment**

   ```bash
   # Start all services (PostgreSQL, Redis, Backend, Frontend)
   docker-compose up -d

   # Or start just the databases
   docker-compose up -d postgres redis

   # Then start services individually
   npm run dev:backend    # Backend on :3000
   npm run dev:frontend   # Frontend on :3001
   ```

4. **Database Setup**
   ```bash
   cd packages/backend
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

## 🏗️ Project Structure

```
├── packages/
│   ├── backend/          # Node.js + Express API
│   ├── frontend/         # React + TypeScript
│   └── shared/           # Shared utilities and types
├── docs/                 # Project documentation
├── docker-compose.yml    # Development environment
└── package.json          # Root workspace configuration
```

## 📚 Available Scripts

### Root Level

- `npm run dev` - Start both backend and frontend
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

### Backend (`packages/backend/`)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Frontend (`packages/frontend/`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run test` - Run tests with Vitest

## 🔧 Development Tools

- **TypeScript** - Strict mode enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks
- **Jest** - Backend testing
- **Vitest** - Frontend testing
- **Prisma** - Database ORM
- **Tailwind CSS** - Utility-first CSS framework

## 🐳 Docker Development

The project includes Docker Compose for easy development setup:

- **PostgreSQL 15** - Main database
- **Redis 7** - Caching and sessions
- **Backend** - Node.js API service
- **Frontend** - React development server

## 📖 API Documentation

Once the backend is running, visit:

- **Health Check**: `http://localhost:3000/api/health`
- **API Base**: `http://localhost:3000/api`

## 🧪 Testing

### Backend Tests

```bash
cd packages/backend
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Frontend Tests

```bash
cd packages/frontend
npm run test              # Run tests
npm run test:ui           # UI test runner
npm run test:coverage     # Coverage report
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

**Database Connection Issues**

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

**Node Modules Issues**

```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules
npm run setup
```

## 📞 Support

For development questions or issues:

1. Check the troubleshooting section above
2. Review the project documentation
3. Create an issue in the project repository

---

**Happy Coding! 🎉**
