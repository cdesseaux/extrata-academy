# 📊 Sentry Error Monitoring - Setup Guide
**Extrata Academy LMS**

---

## 🎯 What is Sentry?

Sentry is an error tracking and performance monitoring platform that helps you:
- **Track errors** in real-time (backend + frontend)
- **Monitor performance** (slow API endpoints, database queries)
- **Get alerts** when errors occur
- **Debug issues** with full stack traces and context
- **Track releases** and compare error rates

---

## ✅ Backend Setup (COMPLETE)

### Files Modified/Created:
1. ✅ `/backend/src/config/sentry.config.ts` - Sentry configuration
2. ✅ `/backend/src/main.ts` - Sentry initialization
3. ✅ `/backend/src/app.controller.ts` - Added test endpoint
4. ✅ `/.env.backup` - Added Sentry environment variables

### What Was Implemented:
- ✅ Error tracking
- ✅ Performance monitoring (10% sample rate in production)
- ✅ Profiling integration
- ✅ Sensitive data filtering (passwords, tokens, headers)
- ✅ Request/response tracking
- ✅ Breadcrumbs for context
- ✅ Test endpoint: `GET /api/test-sentry`

---

## 🚀 Getting Started

### Step 1: Create a Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for free account (free tier includes 5,000 errors/month)
3. Create a new organization (or use existing)

### Step 2: Create Projects

Create **TWO** projects in Sentry:

#### Project 1: Backend (NestJS)
- **Platform**: Node.js
- **Project Name**: `extrata-academy-backend`
- **Alert Settings**: Enable email alerts
- **Copy the DSN** (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

#### Project 2: Frontend (Next.js)
- **Platform**: Next.js
- **Project Name**: `extrata-academy-frontend`
- **Alert Settings**: Enable email alerts
- **Copy the DSN** (different from backend!)

---

### Step 3: Configure Environment Variables

Update your `.env` file with the Sentry DSNs:

```bash
# ============================================
# MONITORING & LOGGING
# ============================================
# Backend Sentry
SENTRY_ENABLED=true
SENTRY_DSN=https://YOUR_BACKEND_DSN@sentry.io/YOUR_PROJECT_ID
SENTRY_RELEASE=extrata-academy@1.0.0

# Frontend Sentry (NEXT_PUBLIC_ vars are accessible from browser)
NEXT_PUBLIC_SENTRY_ENABLED=true
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_FRONTEND_DSN@sentry.io/YOUR_FRONTEND_PROJECT_ID
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

**Important**:
- Use **different DSNs** for backend and frontend
- Frontend DSN must start with `NEXT_PUBLIC_` to be accessible from the browser
- Never commit your real DSNs to git!

---

### Step 4: Test Backend Integration

1. **Start the backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Check console for Sentry status**:
   ```
   ✅ Sentry initialized (development)
   📊 Sentry error tracking: ENABLED
   ```

3. **Test error tracking**:
   ```bash
   # Trigger a test error
   curl http://localhost:4000/api/test-sentry
   ```

4. **Check Sentry dashboard**:
   - Go to https://sentry.io
   - Open your backend project
   - You should see the test error within 30 seconds
   - Error message: "🧪 Test error for Sentry - This is intentional!"

5. **Check health endpoint**:
   ```bash
   curl http://localhost:4000/api/health
   ```

   Should return:
   ```json
   {
     "sentry": {
       "enabled": true,
       "configured": true
     }
   }
   ```

---

## 🔧 Configuration Options

### Backend Configuration (`backend/src/config/sentry.config.ts`)

Key settings:

```typescript
// Sample rates (adjust based on traffic)
tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

// Performance monitoring
enableTracing: true,

// Sensitive data filtering
beforeSend(event, hint) {
  // Filters passwords, tokens, secrets, API keys
  // Removes Authorization and Cookie headers
}

// Ignored errors
ignoreErrors: [
  'NetworkError',
  'AbortError',
  'Request aborted',
]
```

### Sample Rates Explained:
- **Development**: `1.0` = 100% (track all transactions)
- **Production**: `0.1` = 10% (reduce costs, still get insights)

---

## 📊 What Sentry Tracks

### Errors
- ✅ Uncaught exceptions
- ✅ Promise rejections
- ✅ HTTP errors (4xx, 5xx)
- ✅ Database errors
- ✅ Validation errors

### Performance
- ✅ API endpoint response times
- ✅ Database query duration
- ✅ External API calls
- ✅ Cache hits/misses
- ✅ CPU profiling

### Context
- ✅ Request URL, method, headers (sanitized)
- ✅ User information (if logged in)
- ✅ Environment (dev/staging/production)
- ✅ Server version
- ✅ Breadcrumbs (events leading to error)

---

## 🔐 Security & Privacy

### Sensitive Data Filtering

Sentry automatically filters:
- ❌ `Authorization` headers
- ❌ `Cookie` headers
- ❌ Fields containing: password, token, secret, apiKey, api_key
- ❌ Database credentials
- ❌ AWS keys

### What IS Sent:
- ✅ Error messages
- ✅ Stack traces
- ✅ Request paths (e.g., `/api/courses/123`)
- ✅ HTTP status codes
- ✅ Environment variables names (NOT values)
- ✅ User ID (if authenticated, no PII)

### GDPR Compliance:
- Sentry is GDPR compliant
- Data stored in EU region (optional)
- User data can be deleted
- IP anonymization available

---

## 🚨 Alerts & Notifications

### Setting Up Alerts

1. **Go to Sentry project** → Settings → Alerts
2. **Create alert rule**:
   - **Condition**: When an event is seen
   - **Filters**:
     - Error level: error or fatal
     - Environment: production
   - **Action**: Send email to team
   - **Frequency**: Maximum 1 alert per 15 minutes

3. **Recommended alerts**:
   - New error appears (first seen)
   - Error frequency spike (>10/min)
   - High error rate (>5% of requests)
   - Performance degradation (p95 > 1s)

### Integration Options:
- 📧 **Email** (built-in)
- 💬 **Slack** (recommended)
- 🎫 **Jira** (for bug tracking)
- 📱 **PagerDuty** (for critical alerts)
- 🔔 **Discord** (for teams)

---

## 📈 Monitoring Best Practices

### Development Environment
```env
SENTRY_ENABLED=false  # Disable to reduce noise
# OR
SENTRY_ENABLED=true   # Enable to test integration
```

### Staging Environment
```env
SENTRY_ENABLED=true
SENTRY_DSN=<staging-dsn>
NODE_ENV=staging
```

### Production Environment
```env
SENTRY_ENABLED=true
SENTRY_DSN=<production-dsn>
NODE_ENV=production
SENTRY_RELEASE=extrata-academy@1.2.3  # Update on each deploy
```

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] **Test 1**: Health check shows Sentry enabled
  ```bash
  curl http://localhost:4000/api/health | jq '.sentry'
  ```
  Expected: `{ "enabled": true, "configured": true }`

- [ ] **Test 2**: Trigger test error
  ```bash
  curl http://localhost:4000/api/test-sentry
  ```
  Expected: Error 500, appears in Sentry dashboard

- [ ] **Test 3**: Check Sentry console logs
  ```
  ✅ Sentry initialized (development)
  📊 Sentry error tracking: ENABLED
  ```

- [ ] **Test 4**: Verify performance tracking
  - Make API requests
  - Check Sentry → Performance tab
  - Should see transaction traces

### Frontend Tests (After frontend setup)

- [ ] **Test 5**: Trigger client error (TBD)
- [ ] **Test 6**: Trigger server error (TBD)
- [ ] **Test 7**: Check source maps (TBD)

---

## 🛠️ Troubleshooting

### Issue: "ℹ️ Sentry is disabled or DSN not configured"

**Solution**:
1. Check `.env` file exists in project root
2. Verify `SENTRY_ENABLED=true`
3. Verify `SENTRY_DSN` is set (not empty)
4. Restart backend: `npm run start:dev`

---

### Issue: Errors not appearing in Sentry

**Checklist**:
- [ ] SENTRY_ENABLED=true in .env
- [ ] SENTRY_DSN is correct (from sentry.io)
- [ ] Backend restarted after env change
- [ ] Internet connection working
- [ ] Sentry.io project exists
- [ ] DSN matches project (backend vs frontend)

**Debug**:
```bash
# Check environment variables
curl http://localhost:4000/api/health | jq '.sentry'

# Trigger test error
curl http://localhost:4000/api/test-sentry

# Check backend logs
docker-compose logs backend | grep -i sentry
```

---

### Issue: Too many errors in Sentry (quota exceeded)

**Solutions**:
1. **Reduce sample rate** (production):
   ```typescript
   tracesSampleRate: 0.05, // 5% instead of 10%
   ```

2. **Add more ignored errors**:
   ```typescript
   ignoreErrors: [
     'NetworkError',
     'TypeError: Failed to fetch', // Common network errors
   ]
   ```

3. **Filter by environment**:
   ```typescript
   beforeSend(event) {
     if (event.environment === 'development') {
       return null; // Don't send dev errors
     }
     return event;
   }
   ```

4. **Upgrade Sentry plan** (if needed)

---

## 📚 Resources

- **Sentry Docs**: https://docs.sentry.io
- **NestJS Integration**: https://docs.sentry.io/platforms/node/guides/nestjs/
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/
- **Alerts**: https://docs.sentry.io/product/alerts/

---

## ✅ Frontend Setup (COMPLETE)

### Files Modified/Created:
1. ✅ `/frontend/sentry.client.config.ts` - Client-side Sentry
2. ✅ `/frontend/sentry.server.config.ts` - Server-side Sentry
3. ✅ `/frontend/sentry.edge.config.ts` - Edge runtime Sentry
4. ✅ `/frontend/next.config.ts` - Sentry integration
5. ✅ `/frontend/src/app/test-sentry/page.tsx` - Test page

### What Was Implemented:
- ✅ Client-side error tracking
- ✅ Server-side error tracking
- ✅ Edge runtime error tracking
- ✅ Session replay (10% sample in production)
- ✅ Performance monitoring
- ✅ Browser tracing
- ✅ Source map upload configuration
- ✅ Sensitive data filtering
- ✅ React component annotation
- ✅ Automatic instrumentation
- ✅ Ad-blocker circumvention (tunnel route)
- ✅ Test page: `/test-sentry`

### Testing Frontend Integration

1. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Check console for Sentry status**:
   ```
   [Sentry] Client initialized
   [Sentry] Server initialized
   ```

3. **Visit test page**:
   ```
   http://localhost:3000/test-sentry
   ```

4. **Check Sentry status**:
   - Should show green checkmarks if configured
   - Environment should match .env setting

5. **Trigger test errors**:
   - Click "Client Error" button
   - Click "Server Error" button (if backend running)
   - Click "Async Error" button

6. **Verify in Sentry dashboard**:
   - Go to https://sentry.io
   - Open your frontend project
   - Errors should appear within 30 seconds
   - Should see error messages with full stack traces

### Frontend Features

#### Session Replay
- Records user sessions when errors occur
- Helps debug UI issues
- Masks sensitive text/media automatically
- Sample rate: 10% in production, 50% in development

#### Performance Monitoring
- Tracks page load times
- API call performance
- Component render times
- Automatic browser tracing

#### Source Maps
- Upload source maps to Sentry
- Get readable stack traces
- Requires `SENTRY_AUTH_TOKEN` in production
- Configured in `next.config.ts`

---

## 🎯 Next Steps

1. ✅ **Backend setup complete**
2. ✅ **Frontend setup complete**
3. ⏸️ **Configure alerts** (after getting DSNs)
4. ⏸️ **Add custom context** (user info, tags)
5. ⏸️ **Setup release tracking** (Git integration)

---

## 💡 Pro Tips

1. **Use releases** to track which deploy caused errors:
   ```bash
   SENTRY_RELEASE=extrata-academy@$(git rev-parse --short HEAD)
   ```

2. **Tag errors by feature**:
   ```typescript
   Sentry.setTag('feature', 'quiz-system');
   ```

3. **Add custom context**:
   ```typescript
   Sentry.setContext('enrollment', {
     courseId: '123',
     userId: '456',
   });
   ```

4. **Capture non-errors** (warnings, info):
   ```typescript
   Sentry.captureMessage('User uploaded 10MB file', 'warning');
   ```

5. **Set up Slack alerts** for faster response times

---

**Created**: 2025-10-21
**Updated**: 2025-10-21
**Status**: Backend ✅ Complete | Frontend ✅ Complete
**Next**: Configure Sentry.io account and get DSNs
