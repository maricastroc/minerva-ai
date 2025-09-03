import { Redis } from '@upstash/redis';

export class CacheService {
  private redis: Redis;
  private readonly CACHE_TTL = 5 * 60;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await this.redis.setex(key, this.CACHE_TTL, value);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
}
