# 🚀 Teams CLI

> A comprehensive, production-ready CLI tool and REST API for managing GitHub teams, repositories, members, and analytics. Built with **TypeScript**, **Express**, **Prisma**, and **Redis**.

[![npm version](https://img.shields.io/npm/v/@prarthana25/teams-cli)](https://www.npmjs.com/package/@prarthana25/teams-cli)
[![Node.js](https://img.shields.io/node/v/@prarthana25/teams-cli)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Author**: [hitoriiiiiiii](https://github.com/hitoriiiiiiii) | **GitHub**: [Teams-Cli](https://github.com/hitoriiiiiiii/Teams-Cli)

---

## ✨ Features

### Core Capabilities

- 🏢 **Team Management** - Create, view, update, and manage teams
- 👥 **Member Management** - Add, remove, and list team members with role management
- 📨 **Invite System** - Send secure invites with unique codes and auto-expiration
- 📦 **Repository Management** - Add GitHub repositories, track metadata, analyze code
- 📝 **Commit Tracking** - Monitor commits, analyze contributions, and track activity
- 🔐 **GitHub OAuth** - Secure authentication with GitHub integration
- ⚡ **Rate Limiting** - Redis-backed API rate limiting for protection against abuse
- 📊 **Analytics** - Real-time team activity tracking and detailed statistics
- 🖥️ **CLI Interface** - Interactive command-line interface with intuitive commands
- 🔌 **REST API** - Full-featured REST API for programmatic access
- 🗄️ **PostgreSQL** - Enterprise-grade database with Prisma ORM and migrations

## 📦 Installation

### 🌍 Global Installation (Recommended for CLI Use)

```bash
npm install -g @prarthana25/teams-cli
teams login
```

### 📂 Local Installation (For Project Dependency)

```bash
npm install @prarthana25/teams-cli
```

### ⚡ Using npx (No Installation Required)

```bash
npx @prarthana25/teams-cli login
npx @prarthana25/teams-cli team list
```

## 🎯 Quick Start

### 1️⃣ Login with GitHub

```bash
teams login
```

### 2️⃣ Create and Manage Teams

```bash
# Create a new team
teams team create "MyAwesomeTeam"

# List your teams
teams team list

# Get team details
teams team get 1
```

### 3️⃣ Manage Team Members

```bash
# Add a member to a team
teams member add --team-id 1 --username octocat

# List team members
teams member list --team-id 1

# Remove a member
teams member remove --team-id 1 --user-id 5
```

### 4️⃣ Invite System

```bash
# Send an invite to a new user
teams invite send --team-id 1 --username newuser

# Accept an invite using code
teams invite accept --code ABC12345XYZ

# List pending invites
teams invite list --team-id 1
```

### 5️⃣ Repository Management

```bash
# Add a GitHub repository to a team
teams repo add --team-id 1 --url https://github.com/user/repo

# List repositories
teams repo list --team-id 1
```

### 6️⃣ View Analytics

```bash
# Get team activity summary
teams analytics summary --team-id 1

# View detailed analytics
teams analytics details --team-id 1
```

---

## 📚 Complete Command Reference

### Authentication

```bash
teams login              # Authenticate with GitHub
teams logout             # Sign out and clear tokens
teams whoami             # Show current logged-in user
```

### Team Operations

```bash
teams team list          # List all teams
teams team create NAME   # Create a new team
teams team get ID        # Get team details
teams team delete ID     # Delete a team
```

### Member Operations

```bash
teams member list --team-id ID       # List team members
teams member add --team-id ID --username USERNAME    # Add a member
teams member remove --team-id ID --user-id USER_ID   # Remove a member
```

### Repository Operations

```bash
teams repo list --team-id ID            # List team repositories
teams repo add --team-id ID --url URL   # Add a repository
teams repo remove --team-id ID --repo-id REPO_ID
```

### Invite Operations

```bash
teams invite list --team-id ID          # List invites
teams invite send --team-id ID --username USERNAME  # Send invite
teams invite accept --code CODE         # Accept invite
```

### Analytics

```bash
teams analytics summary --team-id ID    # Team activity summary
teams analytics commits --repo-id ID    # Commit statistics
```

### System

```bash
teams help              # Show help information
teams version           # Display version
```

---

## 🏗️ Project Structure

```
Teams-CLI/
├── src/
│   ├── api/                    # REST API server
│   │   ├── server.ts           # Express server setup
│   │   ├── redis.ts            # Redis client configuration
│   │   └── rateLimiter.ts      # Rate limiting middleware
│   │
│   ├── cli/                    # CLI command handlers
│   │   ├── command.ts          # Command registration & routing
│   │   ├── auth.ts             # Authentication commands
│   │   ├── team.ts             # Team commands
│   │   ├── github.ts           # GitHub integration
│   │   └── help.ts             # Help documentation
│   │
│   ├── controllers/            # API request handlers
│   │   ├── team.controller.ts
│   │   ├── user.controller.ts
│   │   ├── repo.controller.ts
│   │   ├── commit.controller.ts
│   │   ├── invite.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── services/               # Business logic layer
│   │   ├── github.services.ts  # GitHub API interactions
│   │   ├── npm.services.ts     # NPM operations
│   │   └── analytics.services.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── logger.ts           # Logging utility
│   │   ├── spinner.ts          # CLI spinner
│   │   ├── inquirer.ts         # Interactive prompts
│   │   └── currentUser.ts
│   │
│   ├── config/                 # Configuration
│   │   └── auth.config.ts      # Auth configuration
│   │
│   ├── core/                   # Core functionality
│   │   └── cron.analytics.ts   # Scheduled analytics
│   │
│   ├── db/                     # Database layer
│   │   └── prisma.ts           # Prisma client initialization
│   │
│   ├── test/                   # Test files
│   │   ├── teams.test.ts
│   │   ├── user.test.ts
│   │   ├── repo.test.ts
│   │   ├── commit.test.ts
│   │   └── invite.test.ts
│   │
│   ├── index.ts                # CLI entry point
│   └── api.ts                  # API entry point
│
├── prisma/                     # Database ORM
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
│
├── scripts/                    # Build & utility scripts
│   └── pre-publish-check.ts
│
├── docker-compose.yml          # Docker services (PostgreSQL, Redis)
├── Dockerfile                  # Docker image
├── jest.config.ts              # Jest testing configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** `18.0.0` or higher
- **npm** `9.0.0` or higher
- **PostgreSQL** `12+` (for database)
- **Redis** `6+` (for caching & rate limiting)
- **GitHub Account** (for OAuth)

### 🔧 Installation Steps

#### Step 1: Clone Repository

```bash
git clone https://github.com/hitoriiiiiiii/Teams-Cli.git
cd Teams-CLI
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/teams_db"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
GITHUB_TOKEN="your-github-personal-access-token"

# API Configuration
PORT=3000
NODE_ENV=development
```

**How to Get GitHub OAuth Credentials:**

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth application
3. Set Authorization callback URL to `http://localhost:3000/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env`

#### Step 4: Set Up Database

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# (Optional) Seed test data
ts-node setup-test-user.ts
```

#### Step 5: Start the Application

**For CLI Development:**

```bash
npm run dev
```

**For REST API:**

```bash
npm run api
```

**For Production:**

```bash
npm run build
npm start
```

---

## 🌐 REST API

### Server Setup

Start the API server:

```bash
npm run api
```

The server will be available at `http://localhost:3000`

### API Endpoints Overview

#### Health & Status

```
GET  /health              → Check API health
```

#### Teams

```
GET    /api/teams                    → List all teams
POST   /api/teams                    → Create new team
GET    /api/teams/:id                → Get team details
PUT    /api/teams/:id                → Update team
DELETE /api/teams/:id                → Delete team
GET    /api/teams/:id/members        → List team members
GET    /api/teams/:id/repos          → List team repositories
GET    /api/teams/:id/analytics      → Get team analytics
```

#### Users

```
GET    /api/users                    → List all users
GET    /api/users/:id                → Get user details
GET    /api/users/:id/teams          → Get user's teams
```

#### Repositories

```
GET    /api/repos                    → List all repositories
POST   /api/repos                    → Add repository
GET    /api/repos/:id                → Get repository details
DELETE /api/repos/:id                → Delete repository
GET    /api/repos/:id/commits        → Get repository commits
```

#### Commits

```
GET    /api/commits                  → List all commits
GET    /api/commits/:id              → Get commit details
GET    /api/repos/:id/commits        → List commits for a repository
```

#### Invites

```
GET    /api/invites                  → List all invites
POST   /api/invites                  → Create invite
POST   /api/invites/:code/accept     → Accept invite
DELETE /api/invites/:id              → Cancel invite
```

#### Analytics

```
GET    /api/analytics/summary        → Overall statistics
GET    /api/analytics/teams/:id      → Team analytics
GET    /api/analytics/repos/:id      → Repository analytics
```

### Authentication

All API requests (except health check and OAuth) require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:3000/api/teams
```

### Example API Requests

**Create a Team:**

```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Team",
    "description": "Our awesome frontend team"
  }'
```

**Add Repository to Team:**

```bash
curl -X POST http://localhost:3000/api/repos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 1,
    "url": "https://github.com/user/repo-name"
  }'
```

## 🔒 Security & Rate Limiting

### Rate Limiting

The API implements comprehensive rate limiting powered by Redis:

| Endpoint Category        | Limit | Window     |
| ------------------------ | ----- | ---------- |
| **General Requests**     | 100   | 1 minute   |
| **Authentication**       | 10    | 15 minutes |
| **Sensitive Operations** | 5     | 1 minute   |
| **Public Endpoints**     | 200   | 1 hour     |

See [API_RATE_LIMITING.md](./API_RATE_LIMITING.md) for advanced configuration.

### Security Features

✅ **GitHub OAuth 2.0** - Secure token-based authentication  
✅ **CORS Protection** - Configured cross-origin access  
✅ **Input Validation** - Comprehensive parameter validation  
✅ **Token Encryption** - Secure token storage in database  
✅ **Rate Limiting** - Prevent brute force and DDoS attacks

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npm test -- teams.test.ts
```

### Watch Mode (for development)

```bash
npm test -- --watch
```

### Test Coverage Report

```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## 🐳 Docker Deployment

### 🚀 Quick Start with Docker Compose

Start all services (API, PostgreSQL, Redis) with one command:

```bash
docker-compose up -d
```

This will automatically:
✅ Pull required images  
✅ Create and start all containers  
✅ Run database healthchecks  
✅ Configure networking between services

**Services Running:**
| Service | Container Name | Port | Status |
|---------|---|---|---|
| API | `teams_cli_app` | `3000` | Running |
| PostgreSQL | `teams_cli_db` | `5432` | Healthy |
| Redis | `teams_cli_redis` | `6379` | Healthy |

### 📊 Check Status

```bash
# View all running containers
docker-compose ps

# Check container health
docker-compose ps --format "table {{.Service}}\t{{.Status}}"
```

### 📋 View Logs

```bash
# View all logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f app       # API application
docker-compose logs -f db        # PostgreSQL database
docker-compose logs -f redis     # Redis cache
```

### 🛑 Stop Services

```bash
# Stop all containers (keeps volumes)
docker-compose down

# Stop and remove all data (clean slate)
docker-compose down -v
```

### 🐳 Docker Hub Images

Pre-built images available on Docker Hub:

```bash
# Pull specific version
docker pull prarthana25/teams-cli:1.0.5

# Pull latest version
docker pull prarthana25/teams-cli:latest

# Run directly from Docker Hub
docker run -p 3000:3000 prarthana25/teams-cli:latest
```

### 🔨 Build Custom Docker Image

Build your own image locally:

```bash
# Build with version tag
docker build -t teams-cli:1.0.5 .

# Build with latest tag
docker build -t teams-cli:latest .

# Run the built image
docker run -p 3000:3000 teams-cli:latest
```

### 🔐 Environment Configuration

Docker Compose automatically configures:

```env
# Database
DATABASE_URL=postgres://postgres:password@db:5432/teams_cli

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# API
API_PORT=3000
```

To override, create a `.env.docker` file and run:

```bash
docker-compose --env-file .env.docker up -d
```

### 📍 Access Services

Once containers are running:

```bash
# API Health Check
curl http://localhost:3000/health

# PostgreSQL Connection
psql postgresql://postgres:password@localhost:5432/teams_cli

# Redis CLI
redis-cli -p 6379
```

### 🔧 Troubleshooting Docker

**Container won't start:**

```bash
# Check logs
docker-compose logs app

# Verify dependencies are healthy
docker-compose ps
```

**Port already in use:**

```bash
# Stop existing containers
docker-compose down

# Or use different port mapping
docker-compose -f docker-compose.yml up -d -p 3001:3000
```

**Database not migrating:**

```bash
# Manually run migrations in container
docker-compose exec app npx prisma migrate deploy
```

**Redis connection issues:**

```bash
# Test Redis connection
docker-compose exec redis redis-cli ping
```

**Force rebuild (clear cache):**

```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## ⚙️ Configuration Reference

### Environment Variables

| Variable               | Description                  | Required | Default       |
| ---------------------- | ---------------------------- | -------- | ------------- |
| `DATABASE_URL`         | PostgreSQL connection string | ✅ Yes   | —             |
| `REDIS_URL`            | Redis connection URL         | ✅ Yes   | —             |
| `GITHUB_CLIENT_ID`     | OAuth client ID              | ✅ Yes   | —             |
| `GITHUB_CLIENT_SECRET` | OAuth client secret          | ✅ Yes   | —             |
| `GITHUB_TOKEN`         | GitHub personal access token | ✅ Yes   | —             |
| `NODE_ENV`             | Runtime environment          | ❌ No    | `development` |
| `PORT`                 | API server port              | ❌ No    | `3000`        |
| `LOG_LEVEL`            | Logging level                | ❌ No    | `info`        |

## 📖 Development Guide

### Project Scripts

```bash
# Development
npm run dev              # Run CLI in development
npm run api              # Run API server
npm run build            # Compile TypeScript
npm start                # Run compiled application

# Testing
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Publishing
npm run pub              # Publish to NPM (public)
npm run pub:beta         # Publish beta version
npm run version:patch    # Bump patch version
npm run version:minor    # Bump minor version
npm run version:major    # Bump major version
```

### Database Management

```bash
# Create database migrations
npx prisma migrate dev --name migration_name

# Apply pending migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Generate Prisma client
npx prisma generate
```

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/my-feature`
2. Update database schema in `prisma/schema.prisma` if needed
3. Create migration: `npx prisma migrate dev --name my_feature`
4. Implement feature in `src/`
5. Add tests in `src/test/`
6. Run tests: `npm test`
7. Format code: `npm run format`
8. Submit pull request

---

## 🔧 Troubleshooting

### Redis Connection Issues

```
Error: ECONNREFUSED 127.0.0.1:6379
```

**Solution:**

```bash
# Start Redis locally
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:latest
```

See [REDIS_QUICKSTART.md](./REDIS_QUICKSTART.md) for more details.

### Database Migration Errors

```bash
# Check migration status
npx prisma migrate status

# Reset to clean state (development only!)
npx prisma migrate reset

# Resolve conflicts manually
npx prisma migrate resolve --rolled-back migration_name
```

### PostgreSQL Connection Issues

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

```bash
# Using Docker Compose (includes PostgreSQL)
docker-compose up -d postgres

# Or install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: https://www.postgresql.org/download/windows/
```

### GitHub OAuth Errors

1. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`
2. Check callback URL is set to `http://localhost:3000/auth/github/callback` in GitHub settings
3. Ensure GitHub OAuth app has proper permissions

### Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests in verbose mode
npm test -- --verbose

# Run specific test file
npm test teams.test.ts
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
# macOS/Linux: lsof -ti:3000 | xargs kill -9
# Windows: netstat -ano | findstr :3000
```

---

## 📚 Additional Resources

- **[API_RATE_LIMITING.md](./API_RATE_LIMITING.md)** - Comprehensive rate limiting documentation
- **[NPM_SETUP_SUMMARY.md](./NPM_SETUP_SUMMARY.md)** - NPM package setup guid
- **[FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md)** - Feature overview and capabilities

---

## 🚀 Performance Tips

### Optimization Strategies

- **Enable Caching**: Use Redis to cache frequently accessed data
- **Batch Operations**: Combine multiple API calls into single requests
- **Connection Pooling**: Configure PostgreSQL connection pooling
- **Rate Limit Tuning**: Adjust rate limits based on your traffic patterns
- **Database Indexing**: Add indexes on frequently queried fields

### Monitoring

```bash
# Monitor API performance
npm run api

# Monitor Redis
redis-cli MONITOR

# Monitor PostgreSQL
npx prisma studio
```

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Steps

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Run `npm run format` before committing
- Ensure all tests pass: `npm test`

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

**MIT License** allows you to:

- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute
- ✅ Private use

---

## 🙏 Support & Contact

### Get Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/hitoriiiiiiii/Teams-Cli/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/hitoriiiiiiii/Teams-Cli/discussions)
- **Email**: prarthanagade25@gmail.com

### Stay Connected

- ⭐ **Star the repo** if you find it useful!
- 🐛 **Report bugs** to help us improve
- 💡 **Share ideas** for new features
- 📢 **Spread the word** to other developers

---

## 👨‍💻 Author

**Prarthana Gade** ([@hitoriiiiiiii](https://github.com/hitoriiiiiiii))

A developer passionate about open-source and building developer tools.

---

**Made with ❤️ by the Teams CLI Community**
