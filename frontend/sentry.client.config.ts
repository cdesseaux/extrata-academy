// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true';
const ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

if (SENTRY_ENABLED && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Replay sampling rate
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 0.5,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive cookies
      if (event.request?.cookies) {
        delete event.request.cookies.token;
        delete event.request.cookies.refresh_token;
      }

      // Remove sensitive query params
      if (event.request?.url) {
        const url = new URL(event.request.url);
        url.searchParams.delete('token');
        url.searchParams.delete('password');
        url.searchParams.delete('apiKey');
        event.request.url = url.toString();
      }

      // Filter sensitive data from extra context
      if (event.extra) {
        const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key'];
        Object.keys(event.extra).forEach(key => {
          if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            event.extra![key] = '[Filtered]';
          }
        });
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      // Network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      // Cancelled requests
      'AbortError',
      'Request aborted',
      'The user aborted a request',
      // React errors that are expected
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],

    // Release tracking
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'extrata-academy-frontend@1.0.0',
  });

  console.log('[Sentry] Client initialized');
} else {
  console.log('[Sentry] Client disabled or not configured');
}
