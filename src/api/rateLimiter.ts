import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from './redis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string;
  message?: string;
}

/**
 * Redis-based rate limiting middleware
 * Usage: app.use(createRateLimiter({ windowMs: 60000, maxRequests: 100 }))
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 100, // 100 requests default
    keyPrefix = 'ratelimit:', // Redis key prefix
    message = 'Too many requests, please try again later.',
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    const redisClient = getRedisClient();

    // If Redis is not available, skip rate limiting
    if (!redisClient) {
      return next();
    }

    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userId = (req as any).user?.id || 'anonymous';
      const key = `${keyPrefix}${userId}:${ip}`;

      const current = await redisClient.incr(key);

      // Set expiration on first request
      if (current === 1) {
        await redisClient.expire(key, Math.ceil(windowMs / 1000));
      }

      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, maxRequests - current).toString(),
      );
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + windowMs).toISOString(),
      );

      if (current > maxRequests) {
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed
      next();
    }
  };
}

/**
 * Route-specific rate limiting
 * Usage: app.post('/api/teams', rateLimitByUser({ maxRequests: 10 }), handler)
 */
export function rateLimitByUser(config: Partial<RateLimitConfig> = {}) {
  return createRateLimiter({
    windowMs: config.windowMs || 60 * 60 * 1000, // 1 hour
    maxRequests: config.maxRequests || 50,
    keyPrefix: 'user-ratelimit:',
  });
}

/**
 * Strict rate limiting for sensitive endpoints
 * Usage: app.post('/api/login', strictRateLimit(), handler)
 */
export function strictRateLimit() {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'strict-ratelimit:',
    message: 'Too many login attempts. Please try again in 15 minutes.',
  });
}

/**
 * Generous rate limiting for public endpoints
 * Usage: app.get('/api/public/repos', generousRateLimit(), handler)
 */
export function generousRateLimit() {
  return createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
    keyPrefix: 'public-ratelimit:',
  });
}
