# Load Testing with k6

This directory contains k6 load testing scripts for the Extrata Academy LMS.

## Prerequisites

### Install k6

**macOS**:
```bash
brew install k6
```

**Linux (Debian/Ubuntu)**:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows**:
```powershell
choco install k6
```

**Docker**:
```bash
docker pull grafana/k6:latest
```

## Test Scenarios

### 1. Smoke Test (`smoke-test.js`)
- **Users**: 1-5
- **Duration**: 1 minute
- **Purpose**: Verify scripts work and system is stable

```bash
k6 run tests/load/smoke-test.js
```

### 2. Load Test (`load-test.js`)
- **Users**: 100 concurrent
- **Duration**: 5 minutes
- **Purpose**: Test normal production load

```bash
k6 run tests/load/load-test.js
```

### 3. Stress Test (`stress-test.js`)
- **Users**: 100 → 500 → 1000
- **Duration**: 10 minutes
- **Purpose**: Find breaking point

```bash
k6 run tests/load/stress-test.js
```

### 4. Spike Test (`spike-test.js`)
- **Users**: Sudden spike to 1000
- **Duration**: 5 minutes
- **Purpose**: Test recovery from sudden traffic

```bash
k6 run tests/load/spike-test.js
```

### 5. Soak Test (`soak-test.js`)
- **Users**: 100 concurrent
- **Duration**: 1 hour
- **Purpose**: Test stability over time (memory leaks, etc.)

```bash
k6 run tests/load/soak-test.js
```

### 6. Cache Test (`cache-test.js`)
- **Users**: 50 concurrent
- **Duration**: 5 minutes
- **Purpose**: Verify Redis caching performance

```bash
k6 run tests/load/cache-test.js
```

## Configuration

### Environment Variables

Create a `.env` file or export:

```bash
export API_BASE_URL="http://localhost:4000/api"
export AUTH_TOKEN="your-jwt-token-here"
```

### Get JWT Token

```bash
# Login via Keycloak and get token
export AUTH_TOKEN=$(curl -s -X POST \
  "https://keycloak-hlg.extrata.com.br/realms/extrata/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=academy-frontend" \
  -d "username=your-username" \
  -d "password=your-password" \
  -d "grant_type=password" | jq -r '.access_token')

echo $AUTH_TOKEN
```

## Running Tests

### Basic Run
```bash
k6 run tests/load/load-test.js
```

### With Custom Config
```bash
k6 run --vus 200 --duration 10m tests/load/load-test.js
```

### With Environment Variables
```bash
k6 run -e API_BASE_URL=http://localhost:4000/api -e AUTH_TOKEN=$AUTH_TOKEN tests/load/load-test.js
```

### Output to File
```bash
k6 run --out json=results.json tests/load/load-test.js
```

### Docker Run
```bash
docker run --rm -i grafana/k6:latest run - <tests/load/load-test.js
```

## Success Criteria

### Performance Targets

**Response Times**:
- **Cached endpoints**: < 200ms (p95)
- **Uncached endpoints**: < 500ms (p95)
- **Database queries**: < 100ms (p95)

**Availability**:
- **Success rate**: > 99.5%
- **Error rate**: < 0.5%

**Throughput**:
- **Requests/second**: > 1000 RPS
- **Cache hit rate**: > 70%

### Failure Conditions

Tests should pass if:
- ✅ p95 response time < 500ms for uncached
- ✅ p95 response time < 200ms for cached
- ✅ Error rate < 1%
- ✅ HTTP 500 errors < 0.1%

Tests should fail if:
- ❌ p95 response time > 1000ms
- ❌ Error rate > 5%
- ❌ Any endpoint consistently returns 500

## Metrics

### k6 Metrics

- **http_reqs**: Total HTTP requests
- **http_req_duration**: Request duration
- **http_req_failed**: Failed requests
- **http_req_blocked**: Time blocked (connection pool)
- **http_req_connecting**: Connection time
- **http_req_sending**: Request send time
- **http_req_waiting**: TTFB (Time To First Byte)
- **http_req_receiving**: Response receive time

### Custom Metrics

- **cache_hits**: Responses with X-Cache: HIT header
- **cache_misses**: Responses with X-Cache: MISS header
- **api_errors**: API errors (4xx, 5xx)

## Interpreting Results

### Good Results
```
checks.........................: 100.00% ✓ 50000      ✗ 0
http_req_duration..............: avg=150ms    p(95)=250ms
http_req_failed................: 0.00%   ✓ 0          ✗ 50000
http_reqs......................: 50000   166.666667/s
```

### Bad Results
```
checks.........................: 85.00%  ✓ 42500      ✗ 7500
http_req_duration..............: avg=2500ms   p(95)=5000ms
http_req_failed................: 15.00%  ✓ 7500       ✗ 42500
http_reqs......................: 50000   83.333333/s
```

## Monitoring During Tests

### Backend Logs
```bash
docker compose logs -f backend
```

### Database Queries
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U academy -d academy

# Watch active queries
SELECT pid, query, state, query_start
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;
```

### Redis Cache
```bash
# Connect to Redis
docker compose exec redis redis-cli -a redis123

# Monitor cache activity
MONITOR

# Check cache hit rate
INFO stats | grep keyspace_hits
INFO stats | grep keyspace_misses
```

### System Resources
```bash
# Watch CPU/Memory
docker stats

# Watch network
docker compose exec backend sh -c 'watch -n 1 "netstat -an | grep :4000 | wc -l"'
```

## Troubleshooting

### Issue: Connection Refused

**Cause**: Backend not running

**Solution**:
```bash
docker compose up -d backend
docker compose logs backend
```

### Issue: 401 Unauthorized

**Cause**: Invalid or expired JWT token

**Solution**:
```bash
# Get new token
export AUTH_TOKEN=$(curl ... | jq -r '.access_token')
```

### Issue: 429 Too Many Requests

**Cause**: Rate limiting triggered

**Solution**:
- Adjust rate limits in backend
- Or: Test with fewer VUs
- Or: Increase TTL in rate limiter

### Issue: Slow Response Times

**Cause**: Missing indexes, no caching, or resource constraints

**Solution**:
1. Run database index migration
2. Verify Redis is running
3. Check Docker resource limits
4. Monitor database query performance

## Next Steps

After running load tests:

1. **Analyze Results**: Review metrics and identify bottlenecks
2. **Optimize**: Apply fixes (indexes, caching, query optimization)
3. **Re-test**: Verify improvements
4. **Document**: Update baselines and thresholds
5. **Automate**: Add to CI/CD pipeline

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Tests

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run k6
        uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/load/load-test.js
          cloud: false
```

## References

- k6 Documentation: https://k6.io/docs/
- k6 Examples: https://k6.io/docs/examples/
- Grafana Cloud k6: https://grafana.com/products/cloud/k6/
