import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class CacheMiddleware {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  constructor(defaultTTL?: number) {
    if (defaultTTL) {
      this.defaultTTL = defaultTTL;
    }
  }

  // Generate cache key from request
  private generateCacheKey(req: Request): string {
    const { businessEntityId, startDate, endDate, metricType, aggregation, automationType, insightType, format } = req.query;
    const path = req.path;
    
    return `${path}:${businessEntityId}:${startDate}:${endDate}:${metricType || ''}:${aggregation || ''}:${automationType || ''}:${insightType || ''}:${format || ''}`;
  }

  // Check if cache entry is valid
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Cache middleware function
  cacheResponse(ttl?: number): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      const cacheEntry = this.cache.get(cacheKey);

      // Check if we have a valid cached response
      if (cacheEntry && this.isCacheValid(cacheEntry)) {
        return res.json(cacheEntry.data);
      }

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data: any) {
        // Cache the response
        const entry: CacheEntry = {
          data,
          timestamp: Date.now(),
          ttl: ttl || this.defaultTTL
        };
        this.cache.set(cacheKey, entry);

        // Call original method
        return originalJson.call(this, data);
      }.bind(this);

      next();
    };
  }

  // Clear cache for specific business entity
  clearBusinessEntityCache(businessEntityId: string): void {
    for (const [key] of this.cache) {
      if (key.includes(`:${businessEntityId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create default instance
const cacheMiddleware = new CacheMiddleware();

// Export both the class and default instance
export { CacheMiddleware, cacheMiddleware };
export default cacheMiddleware;
