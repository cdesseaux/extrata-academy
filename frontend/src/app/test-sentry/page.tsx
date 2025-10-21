'use client';

import { useState } from 'react';

export default function TestSentryPage() {
  const [errorType, setErrorType] = useState<'client' | 'server' | null>(null);

  const triggerClientError = () => {
    throw new Error('🧪 Test client-side error for Sentry - This is intentional!');
  };

  const triggerServerError = async () => {
    try {
      const response = await fetch('/api/test-sentry-error');
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Caught server error:', error);
      throw error; // Re-throw to let Sentry catch it
    }
  };

  const triggerAsyncError = async () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('🧪 Test async error for Sentry - This is intentional!'));
      }, 1000);
    });
  };

  const handleClientError = () => {
    setErrorType('client');
    setTimeout(triggerClientError, 100);
  };

  const handleServerError = () => {
    setErrorType('server');
    triggerServerError();
  };

  const handleAsyncError = () => {
    triggerAsyncError();
  };

  // Check if Sentry is enabled
  const sentryEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true';
  const sentryConfigured = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 Sentry Error Tracking Test
        </h1>

        {/* Sentry Status */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Sentry Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-medium">Enabled:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sentryEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {sentryEnabled ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">Configured:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sentryConfigured
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {sentryConfigured ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">Environment:</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development'}
              </span>
            </div>
          </div>

          {!sentryEnabled && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Sentry is disabled. Set <code className="bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_SENTRY_ENABLED=true</code> in your .env file.
              </p>
            </div>
          )}

          {!sentryConfigured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Sentry DSN not configured. Add <code className="bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_SENTRY_DSN</code> to your .env file.
              </p>
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Error Tracking</h2>
          <p className="text-gray-600 mb-6">
            Click these buttons to trigger intentional errors and verify Sentry is capturing them.
            Check your Sentry dashboard within 30 seconds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Error */}
            <button
              onClick={handleClientError}
              disabled={!sentryEnabled || !sentryConfigured}
              className="flex flex-col items-center justify-center p-6 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-2">💥</div>
              <div className="font-semibold text-red-800">Client Error</div>
              <div className="text-sm text-red-600 mt-2 text-center">
                Triggers in the browser
              </div>
            </button>

            {/* Server Error */}
            <button
              onClick={handleServerError}
              disabled={!sentryEnabled || !sentryConfigured}
              className="flex flex-col items-center justify-center p-6 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-2">🖥️</div>
              <div className="font-semibold text-orange-800">Server Error</div>
              <div className="text-sm text-orange-600 mt-2 text-center">
                Triggers on the server
              </div>
            </button>

            {/* Async Error */}
            <button
              onClick={handleAsyncError}
              disabled={!sentryEnabled || !sentryConfigured}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-2">⏱️</div>
              <div className="font-semibold text-purple-800">Async Error</div>
              <div className="text-sm text-purple-600 mt-2 text-center">
                Unhandled promise rejection
              </div>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📚 How to Verify
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Make sure Sentry is enabled and configured (green checkmarks above)</li>
            <li>Click one of the error buttons</li>
            <li>Open your browser console to see the error</li>
            <li>Go to <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="underline font-medium">sentry.io</a></li>
            <li>Navigate to your frontend project</li>
            <li>The error should appear within 30 seconds</li>
          </ol>
        </div>

        {/* Documentation Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
