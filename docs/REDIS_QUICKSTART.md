# Redis Quick Start Guide

This guide will help you get Redis up and running for Teams CLI.

---

## What is Redis?

Redis is an in-memory data structure store used as a database, cache, and message broker. In Teams CLI, Redis is used for rate limiting API requests.

---

## Installation

### macOS

Using Homebrew:

```
bash
# Install Redis
brew install redis

# Start Redis as a service
brew services start redis

# Or run directly
redis-server
```

### Linux (Ubuntu/Debian)

```
bash
# Update package index
sudo apt-get update

# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis

# Enable Redis on boot
sudo systemctl enable redis
```

### Linux (CentOS/RHEL)

```
bash
# Install Redis
sudo yum install redis

# Start Redis
sudo systemctl start redis

# Enable Redis on boot
sudo systemctl enable redis
```

### Windows

Redis does not have native Windows support, but you have options:

#### Option 1: Docker (Recommended)

```
bash
# Install Docker first, then run Redis
docker run -d -p 6379:6379 --name redis redis:latest
```

#### Option 2: Memurai (Redis-compatible)

Download from: https://www.memurai.com/

#### Option 3: WSL2 (Windows Subsystem for Linux)

Install Redis within WSL2 following the Linux instructions.

---

## Verification

### Check if Redis is Running

```
bash
# Test connection
redis-cli ping

# Should return: PONG
```

### Check Redis Version

```
bash
redis-cli --version
```

### View Redis Info

```
bash
redis-cli info
```

---

## Configuration

### Default Configuration

Redis works out of the box with default settings:

- **Host**: localhost
- **Port**: 6379
- **Database**: 0

### Custom Configuration

Create a `redis.conf` file:

```
conf
# Bind to localhost only
bind 127.0.0.1

# Port to listen on
port 6379

# Set password (optional)
# requirepass yourpassword

# Database number
databases 16

# Persistence (RDB)
save 900 1
save 300 10
save 60 10000
```

Start Redis with custom config:

```
bash
redis-server /path/to/redis.conf
```

---

## Environment Variables

Update your `.env` file:

```
env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## Docker Usage

### Start Redis Container

```
bash
# Basic Redis
docker run -d -p 6379:6379 --name redis redis:latest

# With persistent storage
docker run -d -p 6379:6379 -v redis-data:/data --name redis redis:latest redis-server --appendonly yes

# With custom config
docker run -d -p 6379:6379 -v /path/to/redis.conf:/usr/local/etc/redis/redis.conf --name redis redis redis-server /usr/local/etc/redis/redis.conf
```

### Stop Redis Container

```
bash
docker stop redis
```

### Remove Redis Container

```
bash
docker rm redis
```

### View Redis Logs

```
bash
docker logs redis
```

---

## Redis Commands

### Basic Commands

```
bash
# Set a key
redis-cli SET mykey "Hello"

# Get a key
redis-cli GET mykey

# Delete a key
redis-cli DEL mykey

# Check if key exists
redis-cli EXISTS mykey

# Set key with expiration (seconds)
redis-cli SETEX mykey 60 "value"

# Increment/Decrement
redis-cli INCR mycounter
redis-cli DECR mycounter
```

### Keys and Patterns

```
bash
# List all keys
redis-cli KEYS "*"

# List keys matching pattern
redis-cli KEYS "user:*"

# Delete multiple keys
redis-cli DEL key1 key2 key3
```

### Database Commands

```
bash
# Select database (0-15)
redis-cli SELECT 0

# Flush current database
redis-cli FLUSHDB

# Flush all databases
redis-cli FLUSHALL
```

### Server Commands

```
bash
# Get server info
redis-cli INFO

# Get memory info
redis-cli INFO memory

# Get configuration
redis-cli CONFIG GET maxmemory

# Set configuration
redis-cli CONFIG SET maxmemory 256mb
```

---

## Troubleshooting

### Connection Refused Error

```
Error: ECONNREFUSED 127.0.0.1:6379
```

**Solution**:

```
bash
# Check if Redis is running
redis-cli ping

# If not running, start it
redis-server

# Or on macOS
brew services start redis

# Or on Linux
sudo systemctl start redis
```

### Authentication Error

```
Error: NOAUTH Authentication required
```

**Solution**:

```
bash
# If password is set, authenticate
redis-cli AUTH yourpassword

# Or in application, set REDIS_PASSWORD in .env
```

### Memory Issues

```
bash
# Check memory usage
redis-cli INFO memory

# Get memory usage of keys
redis-cli MEMORY USAGE mykey
```

### Slow Performance

```
bash
# Monitor commands in real-time
redis-cli MONITOR

# Get slow log
redis-cli SLOWLOG GET 10
```

---

## Use Cases in Teams CLI

### Rate Limiting

Redis stores request counts per user/IP:

```
bash
# View rate limit keys
redis-cli KEYS "ratelimit:*"

# Get remaining requests for a user
redis-cli GET ratelimit:user123:192.168.1.1
```

### Session Storage

Redis can store user sessions:

```
bash
# View session keys
redis-cli KEYS "session:*"
```

### Caching

Redis caches frequently accessed data:

```
bash
# View cache keys
redis-cli KEYS "cache:*"
```

---

## Monitoring Tools

### redis-cli

```
bash
# Real-time monitoring
redis-cli MONITOR

# Get all clients info
redis-cli CLIENT LIST

# Get server stats
redis-cli INFO STATS
```

### Redis Desktop Manager

Download from: https://redisdesktop.com/

### Redis Insight

Download from: https://redis.com/redis-Insight/

---

## Security

### Set Password

```
bash
# In redis.conf
requirepass yourstrongpassword

# Or via command
redis-cli CONFIG SET requirepass yourstrongpassword
```

### Connect with Password

```
bash
redis-cli -a yourstrongpassword
```

### Firewall Configuration

```
bash
# Allow Redis only from localhost (Linux)
sudo ufw allow from 127.0.0.1 to any port 6379
```

---

## Backup and Restore

### Backup (RDB)

```
bash
# Redis automatically saves snapshots
# Default: save 900 1, save 300 10, save 60 10000

# Manual backup
redis-cli BGSAVE

# Check last save time
redis-cli LASTSAVE
```

### Restore

```
bash
# Stop Redis
redis-cli SHUTDOWN

# Copy backup file to redis data directory
cp dump.rdb /path/to/redis/data/

# Start Redis
redis-server
```

---

## Performance Tuning

### Memory Optimization

```
conf
# Set max memory
maxmemory 256mb

# Eviction policy
maxmemory-policy allkeys-lru
```

### Connection Pool

In your application, use connection pooling for better performance.

---

## Common Issues

### Port Already in Use

```
bash
# Find what's using port 6379
# Linux
sudo lsof -i :6379

# macOS
lsof -i :6379

# Windows
netstat -ano | findstr :6379
```

### Too Many Connections

```
bash
# Check connected clients
redis-cli CLIENT LIST

# Set max clients
redis-cli CONFIG SET maxclients 10000
```

---

## Next Steps

- Read [API_RATE_LIMITING.md](./API_RATE_LIMITING.md) for rate limiting details
- Configure Redis for production use
- Set up Redis monitoring
- Enable persistence for data durability

---

## Resources

- **Redis Documentation**: https://redis.io/documentation
- **Redis Commands**: https://redis.io/commands
- **Redis Docker Image**: https://hub.docker.com/_/redis/

---

**Redis is now ready to use with Teams CLI!**
