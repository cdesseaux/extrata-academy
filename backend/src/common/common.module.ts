import { Module, Global } from '@nestjs/common';
import { CacheService } from './services/cache.service';

/**
 * Common Module
 *
 * Global module that provides shared services and utilities
 * across the entire application
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CommonModule {}
