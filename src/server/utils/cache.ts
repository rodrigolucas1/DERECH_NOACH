import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

class CacheService {
  private static instance: CacheService;
  private client: Redis | null = null;
  private available = false;

  private constructor() {
    try {
      this.client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
        enableReadyCheck: false,
      });

      this.client.on("error", (err: Error) => {
        if (this.available) {
          console.warn("[Cache] Redis indisponível, usando fallback:", err.message);
          this.available = false;
        }
      });

      this.client.on("connect", () => {
        this.available = true;
      });

      this.client.connect().catch(() => {
        console.warn("[Cache] Não foi possível conectar ao Redis. Cache desativado.");
        this.available = false;
      });
    } catch {
      console.warn("[Cache] Erro ao inicializar Redis. Cache desativado.");
      this.available = false;
    }
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.available || !this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!this.available || !this.client) return;
    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttlSeconds, serialized);
    } catch {
      // silencioso
    }
  }

  async del(key: string): Promise<void> {
    if (!this.available || !this.client) return;
    try {
      await this.client.del(key);
    } catch {
      // silencioso
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.available || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      // silencioso
    }
  }
}

export const cache = CacheService.getInstance();

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;

  const result = await fetchFn();
  await cache.set(key, result, ttlSeconds);
  return result;
}
