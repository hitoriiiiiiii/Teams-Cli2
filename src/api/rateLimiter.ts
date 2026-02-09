import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from './redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  message?: string;
}

function isTestOrCLI() {
  return (
    process.env.NODE_ENV === 'test' || process.env.TEAMS_CLI_MODE === 'true'
  );
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs = 60 * 1000,
    maxRequests = 100,
    keyPrefix = 'ratelimit:',
    message = 'Too many requests, please try again later.',
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (isTestOrCLI()) return next();

    let redisClient;
    try {
      redisClient = getRedisClient();
    } catch {
      return next();
    }

    if (!redisClient) return next();

    try {
      const ip =
        req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
      const userId = (req as any).user?.id || 'anonymous';
      const key = `${keyPrefix}${userId}:${ip}`;

      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, Math.ceil(windowMs / 1000));
      }

      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, maxRequests - current).toString(),
      );

      if (current > maxRequests) {
        return res
          .status(429)
          .json({ error: message, retryAfter: Math.ceil(windowMs / 1000) });
      }

      return next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      return next();
    }
  };
}

export function rateLimitByUser(config: Partial<RateLimitConfig> = {}) {
  return createRateLimiter({
    windowMs: config.windowMs || 60 * 60 * 1000,
    maxRequests: config.maxRequests || 50,
    keyPrefix: 'user-ratelimit:',
  });
}

export function strictRateLimit() {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'strict-ratelimit:',
    message: 'Too many login attempts. Please try again later.',
  });
}

export function generousRateLimit() {
  return createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 1000,
    keyPrefix: 'public-ratelimit:',
  });
}

export async function checkInviteRateLimit(
  userId: number,
  teamId: number,
): Promise<boolean> {
  if (isTestOrCLI()) return true;
  const redisClient = getRedisClient();
  if (!redisClient) return true;

  try {
    const key = `invite-ratelimit:${userId}:${teamId}`;
    const windowMs = 60 * 60 * 1000;
    const maxInvites = 10;

    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
    }
    return current <= maxInvites;
  } catch {
    return true;
  }
}

export async function getInviteRateLimitRemaining(
  userId: number,
  teamId: number,
): Promise<number> {
  if (isTestOrCLI()) return 10;
  const redisClient = getRedisClient();
  if (!redisClient) return 10;

  try {
    const key = `invite-ratelimit:${userId}:${teamId}`;
    const maxInvites = 10;
    const current = Number(await redisClient.get(key)) || 0;
    return Math.max(0, maxInvites - current);
  } catch {
    return 10;
  }
}
