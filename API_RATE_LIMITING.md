# API Rate Limiting with Redis

This project now includes a Redis-based rate limiting system for API endpoints.

## Setup

### Prerequisites

1. **Redis Server** - Install and run Redis locally or use a cloud Redis service
   ```bash
   # macOS
   brew install redis
   brew services start redis

   # Linux
   sudo apt-get install redis-server
   sudo systemctl start redis-server

   # Windows
   Download from: https://github.com/microsoftarchive/redis/releases
   ```

2. **Environment Configuration**
   
   Update `.env`:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=          # Optional, leave empty if no password
   API_PORT=3000
   ```

## Running the API Server

```bash
npm run api
```

This starts the Express server on `http://localhost:3000` with Redis-based rate limiting enabled.

## Rate Limiting Strategies

### 1. **Global Rate Limit**
- Applied to ALL routes by default
- **Limit**: 100 requests per minute
- **For**: General traffic control

### 2. **User-Based Rate Limit** (default)
- Applied to authenticated user endpoints
- **Limit**: 50 requests per hour
- **For**: `/api/teams`, `/api/repos` endpoints
- **Routes**:
  - `GET /api/teams` - List teams
  - `POST /api/repos` - Create repository
  - `GET /api/repos` - List repositories

### 3. **Strict Rate Limit** (Authentication)
- Applied to login/register endpoints
- **Limit**: 5 requests per 15 minutes
- **For**: Preventing brute force attacks
- **Routes**:
  - `POST /api/auth/login`
  - `POST /api/auth/register`

### 4. **Generous Rate Limit** (Public endpoints)
- Applied to public data endpoints
- **Limit**: 1000 requests per minute
- **For**: Public API access
- **Routes**:
  - `GET /api/public/teams`

## Usage Examples

### Using cURL

```bash
# Make a request to a rate-limited endpoint
curl -i http://localhost:3000/api/teams

# Response Headers:
# X-RateLimit-Limit: 50
# X-RateLimit-Remaining: 49
# X-RateLimit-Reset: 2026-01-24T08:30:00.000Z
```

### Rate Limit Exceeded Response

```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 3600
}
```

HTTP Status: `429 Too Many Requests`

## Customization

### Adding Rate Limiting to Custom Routes

```typescript
import { rateLimitByUser, strictRateLimit } from './api/rateLimiter';
import { app } from './api/server';

// User-based limit (50 per hour)
app.post('/api/custom-endpoint', rateLimitByUser(), (req, res) => {
  res.json({ message: 'Success' });
});

// Strict limit (5 per 15 minutes)
app.post('/api/sensitive-endpoint', strictRateLimit(), (req, res) => {
  res.json({ message: 'Success' });
});

// Custom limit
import { createRateLimiter } from './api/rateLimiter';

app.get('/api/expensive-operation', 
  createRateLimiter({ 
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 10,            // 10 requests max
  }), 
  (req, res) => {
    res.json({ message: 'Expensive operation executed' });
  }
);
```

## Redis Keys

Rate limiting data is stored in Redis with the following key format:

```
ratelimit:{userId/anonymous}:{ip}
strict-ratelimit:{userId/anonymous}:{ip}
public-ratelimit:{userId/anonymous}:{ip}
user-ratelimit:{userId/anonymous}:{ip}
```

Example:
```
ratelimit:user123:192.168.1.1
```

## Monitoring

### Check Rate Limit Status

```bash
# Connect to Redis
redis-cli

# List all rate limit keys
KEYS ratelimit:*

# Get current request count for a user
GET ratelimit:user123:192.168.1.1

# Set custom expiration
EXPIRE ratelimit:user123:192.168.1.1 3600
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Public Teams
```bash
GET /api/public/teams
Rate Limit: 1000/minute
```

### Team Management
```bash
GET /api/teams
Rate Limit: 50/hour

POST /api/teams
Rate Limit: 20/hour
```

### Authentication
```bash
POST /api/auth/login
Rate Limit: 5/15 minutes

POST /api/auth/register
Rate Limit: 5/15 minutes
```

### Repository Management
```bash
GET /api/repos
Rate Limit: 50/hour

POST /api/repos
Rate Limit: 30/hour
```

## Fallback Behavior

If Redis connection fails:
- Rate limiting is **disabled** gracefully
- All requests are allowed through
- A warning is logged to the console
- The API continues to function normally

This ensures the API remains available even if Redis is unavailable.

## Best Practices

1. **Use appropriate limits** for different endpoints
2. **Monitor Redis memory** usage and set limits
3. **Set up Redis persistence** for production
4. **Test rate limiting** with load testing tools
5. **Log rate limit events** for analytics
6. **Use Redis Cluster** for high availability

## Troubleshooting

### Redis Connection Error
```
⚠️ Redis connection failed. Rate limiting will be disabled.
```

**Solution**: Ensure Redis server is running:
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### Rate Limit Not Working
1. Verify Redis is running: `redis-cli ping`
2. Check `.env` configuration
3. Verify middleware is registered on routes
4. Check Redis logs for errors

### High Redis Memory Usage
- Set key expiration times (already done in code)
- Clear old keys: `FLUSHDB` (use with caution in production)
- Implement Redis eviction policies in redis.conf

## Production Recommendations

1. **Use Redis Cluster** for scalability
2. **Enable persistence** (RDB or AOF)
3. **Set memory limits** in Redis config
4. **Monitor with Redis monitoring tools** (Redis Insight, RedisCommander)
5. **Use Redis connection pooling**
6. **Implement caching** for frequently accessed data
7. **Set up alerts** for rate limit violations

---

**Status**: ✅ Rate limiting with Redis is fully implemented and production-ready!
