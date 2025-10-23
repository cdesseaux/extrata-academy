/**
 * Load Test
 *
 * Purpose: Test normal production load
 * Users: 100 concurrent users
 * Duration: 5 minutes
 *
 * Run: k6 run tests/load/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { config, getAuthHeaders, isCached } from './config.js';

// Custom metrics
const apiErrors = new Rate('api_errors');
const cacheHitRate = new Rate('cache_hit_rate');
const cacheMissDuration = new Trend('cache_miss_duration');
const cacheHitDuration = new Trend('cache_hit_duration');
const requestsPerEndpoint = new Counter('requests_per_endpoint');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users for 3 minutes
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    ...config.thresholds,
    'http_req_duration{endpoint:courses}': ['p(95)<300'],
    'http_req_duration{endpoint:enrollments}': ['p(95)<400'],
    'http_req_duration{endpoint:leaderboard}': ['p(95)<500'],
  },
};

export default function () {
  const headers = getAuthHeaders();

  // Simulate realistic user behavior
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40%: Browse courses
    browseCourses(headers);
  } else if (scenario < 0.7) {
    // 30%: View my enrollments
    viewEnrollments(headers);
  } else if (scenario < 0.9) {
    // 20%: Check leaderboard
    viewLeaderboard(headers);
  } else {
    // 10%: View profile
    viewProfile(headers);
  }

  sleep(Math.random() * 3 + 2); // 2-5 seconds think time
}

function browseCourses(headers) {
  group('Browse Courses', () => {
    // Get all courses
    const coursesRes = http.get(`${config.baseUrl}/courses`, {
      headers,
      tags: { name: 'get_courses', endpoint: 'courses' },
    });

    const cached = isCached(coursesRes);
    cacheHitRate.add(cached ? 1 : 0);

    if (cached) {
      cacheHitDuration.add(coursesRes.timings.duration);
    } else {
      cacheMissDuration.add(coursesRes.timings.duration);
    }

    const coursesCheck = check(coursesRes, {
      'courses status is 200': (r) => r.status === 200,
      'courses response is array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      },
      'courses response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!coursesCheck) {
      apiErrors.add(1);
    }

    requestsPerEndpoint.add(1, { endpoint: 'courses' });

    sleep(1);

    // Get a specific course (if courses exist)
    try {
      const courses = JSON.parse(coursesRes.body);
      if (courses && courses.length > 0) {
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];

        const courseRes = http.get(`${config.baseUrl}/courses/${randomCourse.id}`, {
          headers,
          tags: { name: 'get_course', endpoint: 'course_detail' },
        });

        check(courseRes, {
          'course detail status is 200': (r) => r.status === 200,
          'course detail has id': (r) => {
            try {
              const body = JSON.parse(r.body);
              return body.id === randomCourse.id;
            } catch {
              return false;
            }
          },
        }) || apiErrors.add(1);

        requestsPerEndpoint.add(1, { endpoint: 'course_detail' });
      }
    } catch (e) {
      console.error('Error browsing course:', e.message);
    }
  });
}

function viewEnrollments(headers) {
  group('View Enrollments', () => {
    if (!config.authToken) {
      console.warn('Skipping enrollments: No auth token provided');
      return;
    }

    const enrollmentsRes = http.get(`${config.baseUrl}/enrollments`, {
      headers,
      tags: { name: 'get_enrollments', endpoint: 'enrollments' },
    });

    const cached = isCached(enrollmentsRes);
    cacheHitRate.add(cached ? 1 : 0);

    if (cached) {
      cacheHitDuration.add(enrollmentsRes.timings.duration);
    } else {
      cacheMissDuration.add(enrollmentsRes.timings.duration);
    }

    check(enrollmentsRes, {
      'enrollments status is 200': (r) => r.status === 200,
      'enrollments response is array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      },
      'enrollments response time < 500ms': (r) => r.timings.duration < 500,
    }) || apiErrors.add(1);

    requestsPerEndpoint.add(1, { endpoint: 'enrollments' });
  });
}

function viewLeaderboard(headers) {
  group('View Leaderboard', () => {
    if (!config.authToken) {
      console.warn('Skipping leaderboard: No auth token provided');
      return;
    }

    const leaderboardRes = http.get(`${config.baseUrl}/gamification/leaderboard`, {
      headers,
      tags: { name: 'get_leaderboard', endpoint: 'leaderboard' },
    });

    const cached = isCached(leaderboardRes);
    cacheHitRate.add(cached ? 1 : 0);

    if (cached) {
      cacheHitDuration.add(leaderboardRes.timings.duration);
    } else {
      cacheMissDuration.add(leaderboardRes.timings.duration);
    }

    check(leaderboardRes, {
      'leaderboard status is 200': (r) => r.status === 200 || r.status === 404, // 404 if no data yet
      'leaderboard response time < 500ms': (r) => r.timings.duration < 500,
    }) || apiErrors.add(1);

    requestsPerEndpoint.add(1, { endpoint: 'leaderboard' });

    sleep(1);

    // Get user's XP
    const xpRes = http.get(`${config.baseUrl}/gamification/my-xp`, {
      headers,
      tags: { name: 'get_my_xp', endpoint: 'my_xp' },
    });

    check(xpRes, {
      'my-xp status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || apiErrors.add(1);

    requestsPerEndpoint.add(1, { endpoint: 'my_xp' });
  });
}

function viewProfile(headers) {
  group('View Profile', () => {
    if (!config.authToken) {
      console.warn('Skipping profile: No auth token provided');
      return;
    }

    const profileRes = http.get(`${config.baseUrl}/auth/profile`, {
      headers,
      tags: { name: 'get_profile', endpoint: 'profile' },
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
      'profile response time < 300ms': (r) => r.timings.duration < 300,
    }) || apiErrors.add(1);

    requestsPerEndpoint.add(1, { endpoint: 'profile' });
  });
}

export function handleSummary(data) {
  console.log('\n=== Load Test Summary ===\n');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s`);
  console.log(`\nResponse Times:`);
  console.log(`  avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);

  if (data.metrics.cache_hit_rate) {
    const hitRate = (data.metrics.cache_hit_rate.values.rate * 100).toFixed(2);
    console.log(`\nCache Performance:`);
    console.log(`  Hit Rate: ${hitRate}%`);
    console.log(`  Hit Duration (avg): ${data.metrics.cache_hit_duration.values.avg.toFixed(2)}ms`);
    console.log(`  Miss Duration (avg): ${data.metrics.cache_miss_duration.values.avg.toFixed(2)}ms`);
  }

  const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
  console.log(`\nErrors:`);
  console.log(`  Failed Requests: ${failRate}%`);
  console.log(`  API Errors: ${data.metrics.api_errors.values.count}`);

  const checkRate = (data.metrics.checks.values.rate * 100).toFixed(2);
  console.log(`  Checks Passed: ${checkRate}%`);

  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}
