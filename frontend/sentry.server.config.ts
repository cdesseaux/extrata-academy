// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
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
      'NetworkError',
      'Network request failed',
      'AbortError',
      'Request aborted',
    ],

    // Release tracking
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'extrata-academy-frontend@1.0.0',
  });

  console.log('[Sentry] Server initialized');
} else {
  console.log('[Sentry] Server disabled or not configured');
}
