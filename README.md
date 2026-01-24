# Teams CLI

A comprehensive command-line tool and REST API for managing GitHub teams, repositories, and commits. Built with TypeScript, Express, Prisma, and Redis.

## Features

- **Team Management**: Create, view, and manage teams
- **Repository Management**: Add repositories to teams, track GitHub metadata
- **Commit Tracking**: Monitor and track commits across repositories
- **User Authentication**: GitHub OAuth integration with secure token handling
- **Rate Limiting**: Redis-backed API rate limiting for protection against abuse
- **CLI Interface**: Interactive command-line interface with multiple commands
- **REST API**: Full-featured REST API for programmatic access
- **Database**: PostgreSQL with Prisma ORM and migrations

## Project Structure

```
Teams-CLI/
├── src/
│   ├── api/              # REST API server
│   │   ├── server.ts     # Express server setup
│   │   ├── redis.ts      # Redis configuration
│   │   └── rateLimiter.ts # Rate limiting middleware
│   ├── cli/              # CLI command handlers
│   │   ├── command.ts    # Command registration
│   │   ├── auth.ts       # Authentication commands
│   │   ├── team.ts       # Team commands
│   │   ├── repo.ts       # Repository commands
│   │   ├── github.ts     # GitHub integration
│   │   └── help.ts       # Help documentation
│   ├── controllers/      # API request handlers
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   ├── core/             # Core functionality
│   ├── db/               # Database setup
│   └── test/             # Test files
├── prisma/               # Database schema and migrations
├── coverage/             # Test coverage reports
├── docker-compose.yml    # Docker services setup
├── Dockerfile           # Docker image configuration
└── package.json         # Project dependencies
```

## Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **PostgreSQL** database
- **Redis** server
- **.env file** with required environment variables

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd teams-cli
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Configure your `.env` file with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/teams_db
REDIS_URL=redis://localhost:6379
GITHUB_TOKEN=<your-github-token>
GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-client-secret>
```

4. **Set up the database**
```bash
npx prisma migrate deploy
```

5. **Generate Prisma client**
```bash
npx prisma generate
```

## Usage

### CLI Commands

#### Start the CLI
```bash
npm run dev
```

#### Available Commands
- `team-cli auth login` - Authenticate with GitHub
- `team-cli team list` - List all teams
- `team-cli team create <name>` - Create a new team
- `team-cli repo list` - List repositories
- `team-cli repo add <url>` - Add a repository to a team
- `team-cli commit list <repo-id>` - List commits
- `team-cli help` - Show help information

### REST API

#### Start the API server
```bash
npm run api
```

The server runs on `http://localhost:3000` by default.

#### API Endpoints

**Health Check**
```
GET /health
```

**Teams**
```
GET    /api/teams           - List all teams
POST   /api/teams           - Create new team
GET    /api/teams/:id       - Get team details
```

**Repositories**
```
GET    /api/repos           - List all repositories
POST   /api/repos           - Add repository
GET    /api/repos/:id       - Get repository details
```

**Commits**
```
GET    /api/commits         - List all commits
GET    /api/repos/:id/commits - List commits for repository
```

**Users**
```
GET    /api/users           - List all users
GET    /api/users/:id       - Get user details
```

#### Rate Limiting

The API implements Redis-backed rate limiting:
- **Global limit**: 100 requests per minute
- **User-specific limits**: 20 requests per minute for authenticated users
- **Strict limits**: 5 requests per minute for sensitive endpoints

See [API_RATE_LIMITING.md](./API_RATE_LIMITING.md) for detailed rate limiting documentation.

## Database Schema

The project uses PostgreSQL with the following models:

### User
- `id`: Auto-incrementing primary key
- `email`: User email (unique)
- `githubId`: GitHub user ID (unique)
- `username`: GitHub username
- `createdAt`: Account creation timestamp

### Team
- `id`: Auto-incrementing primary key
- `name`: Team name
- `createdAt`: Team creation timestamp
- `members`: Team members (many-to-many)
- `repos`: Associated repositories

### TeamMember
- `id`: Auto-incrementing primary key
- `userId`: Reference to User
- `teamId`: Reference to Team
- Unique constraint on (userId, teamId)

### Repo
- `id`: Auto-incrementing primary key
- `name`: Repository name
- `fullName`: Full repository name (unique)
- `githubId`: GitHub repository ID (unique)
- `stars`: Star count
- `forks`: Fork count
- `private`: Privacy flag
- `language`: Primary programming language
- `teamId`: Reference to Team
- `commits`: Associated commits

### Commit
- `id`: Auto-incrementing primary key
- `message`: Commit message
- `sha`: Commit SHA (unique)
- `repoId`: Reference to Repo
- `createdAt`: Commit timestamp

## Development

### Build the project
```bash
npm run build
```

### Run tests
```bash
npm test
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Format code
```bash
npm run format
```

### Lint code
```bash
npm run lint
```

## Docker Setup

### Using Docker Compose

Start all services (PostgreSQL, Redis, API):
```bash
docker-compose up -d
```

Stop all services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

### Building Docker Image

```bash
docker build -t teams-cli:latest .
```

Run with Docker:
```bash
docker run -p 3000:3000 --env-file .env teams-cli:latest
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection URL | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | Yes |
| `GITHUB_CLIENT_ID` | OAuth client ID | Yes |
| `GITHUB_CLIENT_SECRET` | OAuth client secret | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | API server port | No |

See [REDIS_QUICKSTART.md](./REDIS_QUICKSTART.md) for Redis setup instructions.

## API Authentication

The API uses GitHub OAuth for authentication:

1. **Redirect to GitHub**: User is redirected to GitHub's OAuth authorization page
2. **Authorization**: User grants permissions to the app
3. **Token Exchange**: OAuth code is exchanged for an access token
4. **Session Creation**: User session is established with the access token

## Testing

The project includes comprehensive test suites:

- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing with supertest
- **Test Coverage**: Configured with Jest and coverage reports

Run specific test file:
```bash
npm test -- commit.test.ts
```

## Performance & Security

- **Rate Limiting**: Prevents API abuse with Redis-backed rate limiting
- **Password Security**: Bcrypt password hashing
- **Input Validation**: Comprehensive input validation in validators
- **Token Security**: Secure token generation and management
- **CORS**: Cross-origin resource sharing configured for API

## Troubleshooting

### Redis Connection Issues
See [REDIS_QUICKSTART.md](./REDIS_QUICKSTART.md) for Redis troubleshooting.

### Database Migration Issues
```bash
# Reset migrations (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Test User Setup
To set up test data:
```bash
ts-node setup-test-user.ts
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Run tests to ensure everything passes
4. Submit a pull request

## License

ISC

## Support

For issues, questions, or contributions, please open an issue or contact prarthanagade25@gmail.com .
