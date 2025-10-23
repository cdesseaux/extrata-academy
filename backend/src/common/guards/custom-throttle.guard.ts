import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { CUSTOM_THROTTLE_KEY } from '../decorators/custom-throttle.decorator';

/**
 * Custom Throttle Guard
 *
 * Extends the default ThrottlerGuard to support custom rate limits per endpoint.
 *
 * Default limits (from app.module.ts):
 * - 100 requests per minute (global)
 * - 10 requests per second (short)
 *
 * Custom limits (via @CustomThrottle decorator):
 * - Auth endpoints: 5 requests per 15 minutes
 * - Upload endpoints: 10 requests per hour
 * - Sensitive operations: Custom limits as needed
 *
 * The guard checks custom limits first, then falls back to global limits.
 */
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  constructor(
    protected readonly reflector: Reflector,
  ) {
    super({
      ttl: 60000, // Default: 1 minute
      limit: 100, // Default: 100 requests
    }, null, reflector);
  }

  /**
   * Get throttler configuration for the request
   * Checks for custom throttle metadata first, then uses defaults
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use user ID if authenticated, otherwise use IP address
    const userId = req.user?.id || req.user?.sub;
    const ip = req.ip || req.connection?.remoteAddress;

    return userId || ip;
  }

  /**
   * Handle rate limit exceeded
   * Provides detailed error message with time until reset
   */
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const customThrottle = this.reflector.get(CUSTOM_THROTTLE_KEY, context.getHandler());

    if (customThrottle) {
      const { name, limit, ttl } = customThrottle;
      const ttlSeconds = Math.ceil(ttl / 1000);
      const ttlMinutes = Math.ceil(ttlSeconds / 60);

      throw new ThrottlerException(
        `Rate limit exceeded for ${name}. ` +
        `Limit: ${limit} requests per ${ttlMinutes} minute(s). ` +
        `Please try again later.`
      );
    }

    throw new ThrottlerException('Too many requests. Please try again later.');
  }

  /**
   * Override canActivate to check custom throttle limits
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const customThrottle = this.reflector.get(CUSTOM_THROTTLE_KEY, context.getHandler());

    if (customThrottle) {
      const { limit, ttl } = customThrottle;
      const request = context.switchToHttp().getRequest();
      const tracker = await this.getTracker(request);
      const key = this.generateKey(context, tracker);

      const { totalHits } = await this.storageService.increment(key, ttl);

      if (totalHits > limit) {
        await this.throwThrottlingException(context);
      }

      return true;
    }

    // Fall back to default throttling
    return super.canActivate(context);
  }
}
