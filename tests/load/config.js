// Load Test Configuration
// Centralized configuration for all k6 tests

export const config = {
  // Base URL for API requests
  baseUrl: __ENV.API_BASE_URL || 'http://localhost:4000/api',

  // Authentication token (JWT)
  authToken: __ENV.AUTH_TOKEN || '',

  // Test thresholds
  thresholds: {
    // HTTP request duration
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    'http_req_duration{cached:true}': ['p(95)<200'],  // Cached: 95% < 200ms
    'http_req_duration{cached:false}': ['p(95)<500'], // Uncached: 95% < 500ms

    // HTTP request failed rate
    'http_req_failed': ['rate<0.01'], // Less than 1% failures

    // Checks
    'checks': ['rate>0.99'], // More than 99% checks pass

    // Custom metrics
    'api_errors': ['count<50'], // Less than 50 API errors total
  },

  // Request headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Default request timeout
  timeout: '30s',
};

// Helper to get auth headers
export function getAuthHeaders(token = config.authToken) {
  return {
    ...config.headers,
    'Authorization': `Bearer ${token}`,
  };
}

// Helper to check if response is cached
export function isCached(response) {
  const cacheHeader = response.headers['X-Cache'] || response.headers['x-cache'];
  return cacheHeader === 'HIT';
}

// Helper to tag request as cached/uncached
export function getRequestTags(response) {
  return {
    cached: isCached(response) ? 'true' : 'false',
  };
}
