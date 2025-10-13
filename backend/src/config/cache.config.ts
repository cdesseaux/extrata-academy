import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const cacheConfig = (configService: ConfigService): CacheModuleOptions => {
  const redisHost = configService.get('REDIS_HOST', 'localhost');
  const redisPort = configService.get('REDIS_PORT', 6379);
  const redisPassword = configService.get('REDIS_PASSWORD');
  const nodeEnv = configService.get('NODE_ENV', 'development');

  return {
    isGlobal: true,
    store: redisStore,
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    ttl: 300, // 5 minutos por padrão
    max: 1000, // máximo de 1000 itens no cache
    retryAttempts: 3,
    retryDelay: 1000,
    // Configurações específicas para produção
    ...(nodeEnv === 'production' && {
      ttl: 600, // 10 minutos em produção
      max: 5000, // mais itens em produção
    }),
  };
};


