# Redis Rate Limiting - Quick Start Guide

## What Was Added?

✅ **Redis-based rate limiting system** for the API folder with:

- Global rate limiting middleware
- User-based rate limiting
- Strict authentication rate limiting
- Generous public endpoint rate limiting
- Express server with pre-configured routes
- Fallback behavior when Redis is unavailable

## Files Created

```
src/api/
├── redis.ts          # Redis connection management
├── rateLimiter.ts    # Rate limiting middleware
└── server.ts         # Express server setup

src/api.ts           # API entry point
API_RATE_LIMITING.md # Complete documentation
```

## Quick Setup (Local Testing)

### 1. Install Redis

**Windows**:

```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**macOS**:

```bash
brew install redis
brew services start redis
```

**Linux**:

```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 2. Verify Redis is Running

```bash
redis-cli ping
# Should output: PONG
```

### 3. Start the API Server

```bash
npm run api
```

Expected output:

```
✅ Connected to Redis
✅ Rate limiting initialized
🚀 API Server running on http://localhost:3000
📊 Rate limiting enabled via Redis
```

### 4. Test the Rate Limiting

```bash
# Test with curl (make multiple requests quickly)
for i in {1..10}; do
  curl -i http://localhost:3000/api/teams
  echo "Request $i completed"
  sleep 0.1
done
```

You should see:

- `X-RateLimit-Limit: 50` (max requests)
- `X-RateLimit-Remaining: 49, 48, 47...` (decreasing)
- After exceeding limit: `HTTP 429 Too Many Requests`

## Rate Limiting Tiers

| Tier       | Window | Limit | Use Case             |
| ---------- | ------ | ----- | -------------------- |
| **Strict** | 15 min | 5     | Login/Register       |
| **User**   | 1 hour | 50    | Team/Repo CRUD       |
| **Public** | 1 min  | 1000  | Public endpoints     |
| **Global** | 1 min  | 100   | All routes (default) |

## Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Optional
API_PORT=3000
```

## API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Teams API (user-based limit: 50/hour)
curl http://localhost:3000/api/teams
curl -X POST http://localhost:3000/api/teams

# Auth (strict limit: 5/15min)
curl -X POST http://localhost:3000/api/auth/login
curl -X POST http://localhost:3000/api/auth/register

# Repos (user-based limit: 50/hour)
curl http://localhost:3000/api/repos
curl -X POST http://localhost:3000/api/repos
```

## Features

✅ **Automatic fallback** - Works without Redis (rate limiting disabled)
✅ **IP + User tracking** - Rate limits per user/IP combination
✅ **Response headers** - Shows remaining quota
✅ **Configurable limits** - Different limits for different endpoints
✅ **Redis persistence** - Data stored in Redis with TTL
✅ **Graceful shutdown** - Closes Redis connection on SIGTERM/SIGINT

## Monitoring Rate Limits

```bash
# Connect to Redis CLI
redis-cli

# View all rate limit keys
KEYS ratelimit:*

# Check current count for a user
GET "ratelimit:user123:127.0.0.1"

# Manually reset a user's limit
DEL "ratelimit:user123:127.0.0.1"

# View all limits info
INFO stats
```

## Production Deployment

For production, consider:

1. **Redis Cluster** for high availability
2. **Redis Persistence** (RDB/AOF)
3. **Monitoring tools** (Redis Insight)
4. **Cloud Redis** (Redis Cloud, AWS ElastiCache)
5. **Load testing** to verify limits work correctly

## Testing Without Redis

If Redis isn't available:

1. API will start normally
2. Rate limiting will be disabled (logged as warning)
3. All requests will be allowed through
4. Ensures API resilience

---

**Status**: ✅ Rate limiting fully implemented with Redis!

For detailed configuration, see `API_RATE_LIMITING.md`
