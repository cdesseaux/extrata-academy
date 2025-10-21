import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * HTTP Cache Interceptor
 *
 * Caches GET requests based on URL and query parameters
 * Automatically skips caching for authenticated requests (unless configured otherwise)
 *
 * Usage:
 * @UseInterceptors(HttpCacheInterceptor)
 * OR
 * @UseInterceptors(new HttpCacheInterceptor(customTTL))
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly ttl: number = 300, // 5 minutes default
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Generate cache key from URL and query params
    const cacheKey = this.generateCacheKey(request);

    // Try to get from cache
    const cachedResponse = await this.cacheManager.get(cacheKey);

    if (cachedResponse) {
      // Set cache hit header
      response.setHeader('X-Cache', 'HIT');
      response.setHeader('X-Cache-Key', cacheKey);
      return of(cachedResponse);
    }

    // Set cache miss header
    response.setHeader('X-Cache', 'MISS');
    response.setHeader('X-Cache-Key', cacheKey);

    // Execute request and cache the result
    return next.handle().pipe(
      tap(async (data) => {
        // Only cache successful responses
        if (data !== null && data !== undefined) {
          await this.cacheManager.set(cacheKey, data, this.ttl);
        }
      }),
    );
  }

  /**
   * Generate a unique cache key based on the request
   */
  private generateCacheKey(request: any): string {
    const { url, query, user } = request;

    // Base key from URL
    let key = `http:${url}`;

    // Add query params to key (sorted for consistency)
    if (query && Object.keys(query).length > 0) {
      const sortedQuery = Object.keys(query)
        .sort()
        .map(k => `${k}=${query[k]}`)
        .join('&');
      key += `?${sortedQuery}`;
    }

    // For authenticated requests, include user ID in cache key
    // This ensures each user gets their own cached data
    if (user && user.sub) {
      key += `|user:${user.sub}`;
    }

    return key;
  }
}
