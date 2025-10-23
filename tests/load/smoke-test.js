/**
 * Smoke Test
 *
 * Purpose: Quick sanity check to verify the system is working
 * Users: 1-5 concurrent users
 * Duration: 1 minute
 *
 * Run: k6 run tests/load/smoke-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config, getAuthHeaders, isCached } from './config.js';

// Custom metrics
const apiErrors = new Rate('api_errors');
const cacheHitRate = new Rate('cache_hit_rate');
const cacheMissDuration = new Trend('cache_miss_duration');
const cacheHitDuration = new Trend('cache_hit_duration');

export const options = {
  stages: [
    { duration: '30s', target: 1 },  // Ramp up to 1 user
    { duration: '20s', target: 5 },  // Ramp up to 5 users
    { duration: '10s', target: 0 },  // Ramp down
  ],
  thresholds: config.thresholds,
};

export default function () {
  const headers = getAuthHeaders();

  // Test 1: Health Check (no auth)
  const healthRes = http.get(`${config.baseUrl}/health`, {
    headers: config.headers,
    tags: { name: 'health_check' },
  });

  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check has status field': (r) => JSON.parse(r.body).status !== undefined,
  }) || apiErrors.add(1);

  sleep(1);

  // Test 2: Get Courses (cached)
  const coursesRes = http.get(`${config.baseUrl}/courses`, {
    headers,
    tags: { name: 'get_courses' },
  });

  const coursesCheck = check(coursesRes, {
    'courses status is 200': (r) => r.status === 200,
    'courses response is array': (r) => Array.isArray(JSON.parse(r.body)),
  });

  if (!coursesCheck) {
    apiErrors.add(1);
  }

  // Track cache performance
  const cached = isCached(coursesRes);
  cacheHitRate.add(cached ? 1 : 0);

  if (cached) {
    cacheHitDuration.add(coursesRes.timings.duration);
  } else {
    cacheMissDuration.add(coursesRes.timings.duration);
  }

  sleep(1);

  // Test 3: Get User Profile (requires auth)
  if (config.authToken) {
    const profileRes = http.get(`${config.baseUrl}/auth/profile`, {
      headers,
      tags: { name: 'get_profile' },
    });

    check(profileRes, {
      'profile status is 200': (r) => r.status === 200,
      'profile has user data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id !== undefined || body.sub !== undefined;
        } catch {
          return false;
        }
      },
    }) || apiErrors.add(1);

    sleep(1);

    // Test 4: Get User Enrollments (cached)
    const enrollmentsRes = http.get(`${config.baseUrl}/enrollments`, {
      headers,
      tags: { name: 'get_enrollments' },
    });

    check(enrollmentsRes, {
      'enrollments status is 200': (r) => r.status === 200,
      'enrollments response is array': (r) => Array.isArray(JSON.parse(r.body)),
    }) || apiErrors.add(1);

    sleep(1);
  }

  sleep(2); // Think time between iterations
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'smoke-test-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors !== false;

  let summary = '\n';
  summary += `${indent}✓ Smoke Test Completed\n\n`;

  // Requests
  if (data.metrics.http_reqs) {
    summary += `${indent}Requests:\n`;
    summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n\n`;
  }

  // Response Times
  if (data.metrics.http_req_duration) {
    summary += `${indent}Response Times:\n`;
    summary += `${indent}  avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `${indent}  med: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
    summary += `${indent}  max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `${indent}  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  }

  // Cache Performance
  if (data.metrics.cache_hit_rate) {
    const hitRate = (data.metrics.cache_hit_rate.values.rate * 100).toFixed(2);
    summary += `${indent}Cache Performance:\n`;
    summary += `${indent}  Hit Rate: ${hitRate}%\n`;

    if (data.metrics.cache_hit_duration) {
      summary += `${indent}  Hit Duration (avg): ${data.metrics.cache_hit_duration.values.avg.toFixed(2)}ms\n`;
    }

    if (data.metrics.cache_miss_duration) {
      summary += `${indent}  Miss Duration (avg): ${data.metrics.cache_miss_duration.values.avg.toFixed(2)}ms\n`;
    }

    summary += '\n';
  }

  // Errors
  if (data.metrics.http_req_failed) {
    const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `${indent}Errors:\n`;
    summary += `${indent}  Failed Requests: ${failRate}%\n`;
  }

  if (data.metrics.api_errors) {
    summary += `${indent}  API Errors: ${data.metrics.api_errors.values.count}\n`;
  }

  // Checks
  if (data.metrics.checks) {
    const checkRate = (data.metrics.checks.values.rate * 100).toFixed(2);
    summary += `${indent}  Checks Passed: ${checkRate}%\n\n`;
  }

  // Pass/Fail
  const thresholdsPassed = Object.keys(data.metrics)
    .filter(m => data.metrics[m].thresholds)
    .every(m => {
      const thresholds = data.metrics[m].thresholds;
      return Object.keys(thresholds).every(t => thresholds[t].ok);
    });

  if (thresholdsPassed) {
    summary += `${indent}✓ All thresholds passed\n`;
  } else {
    summary += `${indent}✗ Some thresholds failed\n`;
  }

  return summary;
}
