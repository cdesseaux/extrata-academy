import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const sentryConfig = () => {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';
  const enabled = process.env.SENTRY_ENABLED === 'true';

  // Only initialize Sentry if enabled and DSN is provided
  if (!enabled || !dsn) {
    console.log('ℹ️ Sentry is disabled or DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Set sample rate for transactions (performance monitoring)
    // 1.0 = 100% of transactions, 0.1 = 10%
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Set sample rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Integrations
    integrations: [
      // Add profiling integration
      nodeProfilingIntegration(),

      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],

    // Performance Monitoring
    enableTracing: true,

    // Capture breadcrumbs for better error context
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive data from breadcrumbs
      if (breadcrumb.category === 'http') {
        // Remove Authorization headers
        if (breadcrumb.data?.headers) {
          delete breadcrumb.data.headers.authorization;
          delete breadcrumb.data.headers.cookie;
        }
      }
      return breadcrumb;
    },

    // Filter sensitive data before sending to Sentry
    beforeSend(event, hint) {
      // Remove sensitive data from request
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove sensitive data from extra context
      if (event.extra) {
        // Remove any keys that might contain sensitive data
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
      // Browser errors that don't affect functionality
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors (user's connection issues)
      'NetworkError',
      'Network request failed',
      // Cancelled requests
      'AbortError',
      'Request aborted',
    ],

    // Release tracking
    release: process.env.SENTRY_RELEASE || 'extrata-academy@1.0.0',
  });

  console.log(`✅ Sentry initialized (${environment})`);
};
