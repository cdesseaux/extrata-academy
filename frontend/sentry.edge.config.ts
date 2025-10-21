// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

      return event;
    },

    // Release tracking
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'extrata-academy-frontend@1.0.0',
  });

  console.log('[Sentry] Edge initialized');
} else {
  console.log('[Sentry] Edge disabled or not configured');
}
