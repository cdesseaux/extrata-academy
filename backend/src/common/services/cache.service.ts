import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache Service
 *
 * Provides utility methods for cache management, including:
 * - Pattern-based cache invalidation
 * - Bulk cache operations
 * - Cache statistics
 */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * Set value in cache with optional TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Delete a specific key from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Delete all keys matching a pattern
   *
   * Examples:
   * - 'http:/api/courses*' - All course endpoints
   * - 'http:/api/courses/123*' - Specific course and related endpoints
   * - '*user:456*' - All endpoints for specific user
   */
  async delByPattern(pattern: string): Promise<void> {
    const store = this.cacheManager.store as any;

    // For redis store
    if (store.keys) {
      const keys = await store.keys(pattern);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
      }
    }
  }

  /**
   * Reset entire cache
   * Use with caution!
   */
  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  /**
   * Invalidate cache for a specific course
   */
  async invalidateCourse(courseId: string): Promise<void> {
    await Promise.all([
      this.delByPattern(`http:/api/courses/${courseId}*`),
      this.delByPattern(`http:/api/courses?*`), // List endpoints
      this.delByPattern(`http:/api/modules*courseId=${courseId}*`),
      this.delByPattern(`http:/api/lessons*courseId=${courseId}*`),
    ]);
  }

  /**
   * Invalidate cache for a specific enrollment
   */
  async invalidateEnrollment(userId: string, courseId?: string): Promise<void> {
    const patterns = [
      `http:/api/enrollments*user:${userId}*`,
      `http:/api/enrollments*userId=${userId}*`,
    ];

    if (courseId) {
      patterns.push(`http:/api/enrollments*courseId=${courseId}*`);
    }

    await Promise.all(patterns.map(pattern => this.delByPattern(pattern)));
  }

  /**
   * Invalidate cache for learning paths
   */
  async invalidateLearningPath(pathId?: string): Promise<void> {
    if (pathId) {
      await this.delByPattern(`http:/api/learning-paths/${pathId}*`);
    }
    await this.delByPattern(`http:/api/learning-paths?*`); // List endpoints
  }

  /**
   * Invalidate gamification cache for a user
   */
  async invalidateGamification(userId: string): Promise<void> {
    await Promise.all([
      this.delByPattern(`http:/api/gamification*user:${userId}*`),
      this.delByPattern(`http:/api/gamification/leaderboard*`), // Leaderboard changes
      this.delByPattern(`http:/api/gamification/achievements*user:${userId}*`),
    ]);
  }

  /**
   * Invalidate all caches related to a user
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.delByPattern(`*user:${userId}*`);
  }
}
