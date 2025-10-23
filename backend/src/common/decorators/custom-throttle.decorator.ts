import { SetMetadata } from '@nestjs/common';

/**
 * Custom rate limit configuration for specific endpoints
 *
 * Usage:
 * @CustomThrottle('auth', { limit: 5, ttl: 60000 })
 * This allows 5 requests per 60 seconds (1 minute)
 *
 * @CustomThrottle('upload', { limit: 10, ttl: 3600000 })
 * This allows 10 requests per 3600 seconds (1 hour)
 */
export interface ThrottleConfig {
  limit: number; // Number of requests allowed
  ttl: number; // Time window in milliseconds
}

export const CUSTOM_THROTTLE_KEY = 'custom_throttle';

export const CustomThrottle = (name: string, config: ThrottleConfig) =>
  SetMetadata(CUSTOM_THROTTLE_KEY, { name, ...config });
