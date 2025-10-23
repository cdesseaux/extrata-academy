# Custom Rate Limiting Documentation

**Created**: 2025-10-23
**Status**: Implemented
**Location**: `backend/src/common/decorators/custom-throttle.decorator.ts` and `backend/src/common/guards/custom-throttle.guard.ts`

## Overview

Custom rate limiting has been implemented to protect sensitive endpoints from abuse while maintaining good UX for legitimate users.

The implementation uses a decorator-based approach that extends the default NestJS `@nestjs/throttler` package.

## Architecture

### Components:

1. **CustomThrottle Decorator** (`custom-throttle.decorator.ts`)
   - Provides a simple decorator interface for applying custom rate limits
   - Stores rate limit configuration in metadata

2. **CustomThrottleGuard** (`custom-throttle.guard.ts`)
   - Extends `ThrottlerGuard` to support custom limits
   - Checks custom limits first, falls back to global limits
   - Provides detailed error messages with time until reset

## Rate Limit Configuration

### Global Limits (app.module.ts)
```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000,      // 1 minute
    limit: 100,      // 100 requests per minute
  },
  {
    name: 'short',
    ttl: 1000,       // 1 second
    limit: 10,       // 10 requests per second
  },
])
```

### Custom Limits by Endpoint

#### Authentication Endpoints

| Endpoint | Limit | TTL | Reasoning |
|----------|-------|-----|-----------|
| `GET /auth/profile` | 30/min | 60s | Frequent profile checks |
| `GET /auth/verify` | 20/min | 60s | Token verification |
| `GET /auth/debug` | 5/15min | 900s | Sensitive debug endpoint |
| `GET /auth/env-debug` | 5/15min | 900s | Sensitive debug endpoint |
| `GET /auth/test-token` | 5/15min | 900s | Sensitive debug endpoint |

**Rationale**: Debug endpoints have very strict limits to prevent information leakage. Profile/verify have moderate limits for normal app usage.

#### File Upload Endpoints

| Endpoint | Limit | TTL | Reasoning |
|----------|-------|-----|-----------|
| `POST /files/upload/video` | 10/hour | 3600s | Large files, resource-intensive |
| `POST /files/upload/pdf` | 10/hour | 3600s | Moderate size, moderate frequency |
| `POST /files/upload/image` | 20/hour | 3600s | Smaller files, more common |
| `POST /files/upload/thumbnail` | 20/hour | 3600s | Smaller files, more common |
| `POST /files/upload/avatar` | 5/hour | 3600s | Rare changes |
| `POST /files/upload/document` | 10/hour | 3600s | Moderate size, moderate frequency |
| `GET /files/:id/url` | 100/min | 60s | Presigned URL generation (read operation) |

**Rationale**: Upload limits prevent storage abuse and server overload. Video/PDF uploads are limited more strictly due to size and processing requirements.

## Usage

### Applying Custom Rate Limits

```typescript
import { CustomThrottle } from '../common/decorators/custom-throttle.decorator';

@Controller('example')
export class ExampleController {

  // Apply custom rate limit
  @Get('sensitive-endpoint')
  @CustomThrottle('sensitive-op', { limit: 5, ttl: 900000 }) // 5 requests per 15 minutes
  getSensitiveData() {
    // ...
  }

  // Uses global rate limit (100/min)
  @Get('normal-endpoint')
  getNormalData() {
    // ...
  }
}
```

### Rate Limit Parameters

- **limit**: Number of requests allowed within the time window
- **ttl**: Time window in milliseconds
  - 1 second = 1000ms
  - 1 minute = 60000ms
  - 15 minutes = 900000ms
  - 1 hour = 3600000ms
  - 1 day = 86400000ms

## Tracking

Rate limits are tracked per user (if authenticated) or per IP address (if not authenticated).

### User Tracking
```typescript
protected async getTracker(req: Record<string, any>): Promise<string> {
  const userId = req.user?.id || req.user?.sub;
  const ip = req.ip || req.connection?.remoteAddress;

  return userId || ip;  // Prefer user ID over IP
}
```

**Benefits**:
- More accurate tracking (user can't bypass by changing IP)
- Better UX (limits don't affect multiple users behind same IP)

## Error Responses

### Rate Limit Exceeded

**HTTP Status**: `429 Too Many Requests`

**Response Body**:
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded for upload-video. Limit: 10 requests per 60 minute(s). Please try again later."
}
```

### Response Headers

The throttler may include these headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

## Monitoring

### Check Rate Limit Status

Rate limit data is stored in Redis (if available) or in-memory (development).

**Redis Keys Format**:
```
throttler:{key}:{tracker}
```

Example:
```
throttler:upload-video:user-123abc
throttler:auth-debug:user-456def
```

### Monitor Rate Limit Hits

```bash
# Connect to Redis
redis-cli -h localhost -p 6379 -a redis123

# List all throttler keys
KEYS throttler:*

# Check specific user's rate limit
GET throttler:upload-video:user-123abc

# TTL (time to live) for the key
TTL throttler:upload-video:user-123abc
```

## Testing

### Test Rate Limiting

```bash
# Test auth endpoint (limit: 5 per 15 min)
for i in {1..10}; do
  curl -X GET http://localhost:4000/api/auth/debug \
    -H "Authorization: Bearer $TOKEN"
  echo ""
done

# Expected: First 5 succeed, next 5 return 429
```

### Load Testing with k6

See `docs/technical/load-testing.md` for k6 scripts that test rate limiting under load.

## Production Considerations

### 1. Redis Storage
Ensure Redis is configured for rate limit storage in production:

```typescript
// app.module.ts
ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redis),
  // ...
})
```

**Why**: In-memory storage doesn't scale across multiple server instances.

### 2. Adjust Limits Based on Usage

Monitor actual usage patterns and adjust limits accordingly:

```sql
-- Example: Check average requests per user per hour
SELECT
  user_id,
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as request_count
FROM request_logs
WHERE endpoint LIKE '%/upload/%'
GROUP BY user_id, hour
ORDER BY request_count DESC
LIMIT 100;
```

### 3. Whitelist Trusted IPs

For admin or monitoring tools, consider implementing IP whitelisting:

```typescript
if (trustedIPs.includes(request.ip)) {
  return true;  // Skip rate limiting
}
```

### 4. User Feedback

Consider adding a header to all responses showing remaining quota:

```typescript
response.setHeader('X-RateLimit-Remaining', remaining);
```

## Future Enhancements

### 1. Dynamic Rate Limits
Different limits for different user tiers:

```typescript
const limit = user.isPremium ? 100 : 10;
@CustomThrottle('upload', { limit, ttl: 3600000 })
```

### 2. Rate Limit Analytics
Track and visualize rate limit hits:
- Which endpoints hit limits most often?
- Which users hit limits most often?
- Are limits too strict or too lenient?

### 3. Gradual Backoff
Increase limits gradually after a period of good behavior:
- New users: Stricter limits
- Trusted users (30+ days, no abuse): Relaxed limits

### 4. Smart Rate Limiting
Adjust limits based on server load:
- High load: Reduce limits
- Low load: Increase limits

## Related Documentation

- [Load Testing](./load-testing.md) - k6 scripts to test rate limiting
- [Database Indexes](./database-indexes.md) - Optimize performance under rate limits
- [Redis Caching](../../docs/setup-guides/redis-caching.md) - Cache configuration

## References

- NestJS Throttler: https://docs.nestjs.com/security/rate-limiting
- Redis Rate Limiting: https://redis.io/glossary/rate-limiting/
- OWASP Rate Limiting: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
