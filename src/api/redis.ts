import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function initRedis() {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis connection failed. Rate limiting will be disabled.', error);
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
  }
}
