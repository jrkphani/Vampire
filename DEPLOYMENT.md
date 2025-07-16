# Deployment Guide - ValueMax Vampire Frontend

## AWS Amplify Deployment Configuration

### Environment Variables Required

Configure these environment variables in your AWS Amplify Console:

#### **Production Environment Variables (Required)**
```
VITE_API_BASE_URL=https://your-backend-api.com/api
```

#### **Optional Environment Variables**
```
VITE_WS_URL=wss://your-backend-api.com/ws
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_OFFLINE_MODE=false
VITE_ANALYTICS_ENABLED=true
VITE_ERROR_REPORTING_ENABLED=true
```

### Current Issue: MSW in Production

**Problem**: Mock Service Worker (MSW) is correctly configured to NOT run in production builds. However, when `VITE_API_BASE_URL` is not configured, the frontend tries to call `/api/*` endpoints on the same domain, resulting in 404 errors.

**Solution**: Set `VITE_API_BASE_URL` to point to your actual backend API server.

### How to Configure Environment Variables in Amplify

1. **Go to AWS Amplify Console**
2. **Select your app** (main.d1zh27urdoy9zv.amplifyapp.com)
3. **Navigate to "Environment variables"** in the left sidebar
4. **Add the following variables**:
   - **Variable name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-actual-backend-api.com/api`

### Development vs Production Behavior

#### **Development (npm run dev)**
- MSW starts when `VITE_ENABLE_MOCK_DATA=true`
- API calls intercepted by MSW
- No real backend required
- Console shows: `✅ Mock Service Worker started successfully`

#### **Production (Amplify Build)**
- MSW never starts (by design)
- API calls go to `VITE_API_BASE_URL` or default `/api`
- Requires real backend server
- Console shows: `📡 Production mode - connecting to backend API`

### Error Scenarios

#### **Current Error (404 on /api/auth/login/)**
```
XHRGET https://main.d1zh27urdoy9zv.amplifyapp.com/api/auth/login/
[HTTP/3 404 285ms]
```

**Cause**: No `VITE_API_BASE_URL` configured, so frontend tries to call `/api/*` on the same domain.

**Fix**: Set `VITE_API_BASE_URL=https://your-backend-api.com/api` in Amplify environment variables.

#### **Expected Production Behavior**
```
XHRGET https://your-backend-api.com/api/auth/login/
[HTTP/2 200 123ms]
```

### Backend Requirements

Your backend API must be deployed and accessible at the URL you specify in `VITE_API_BASE_URL`. The backend should handle these endpoints:

- `POST /api/auth/login` - Staff authentication
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/transactions/recent` - Recent transactions
- `POST /api/transactions/renewal` - Ticket renewal
- `POST /api/transactions/redemption` - Ticket redemption
- And other endpoints as defined in your API specification

### Testing Production Configuration Locally

To test production behavior locally:

1. **Set environment variables**:
   ```bash
   # .env.local
   VITE_API_BASE_URL=https://your-backend-api.com/api
   VITE_ENABLE_MOCK_DATA=false
   ```

2. **Build and serve**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Verify behavior**:
   - No MSW warnings in console
   - API calls go to your backend URL
   - Authentication works with real API

### Troubleshooting

#### **Check Environment Variables**
In browser console, you should see:
```
🔍 Environment check: {
  isDev: false,
  mockDataEnabled: "false",
  apiBaseUrl: "https://your-backend-api.com/api",
  hasBackendAPI: true
}
📡 Production mode - connecting to backend API
```

#### **MSW Not Starting (Expected in Production)**
```
⚠️ MSW not started: { isDev: false, mockDataEnabled: "false" }
```
This is **correct behavior** - MSW should not start in production.

#### **API Configuration Error**
If you see:
```
🚨 PRODUCTION MISCONFIGURATION DETECTED
API calls will fail because no backend URL is configured
Set VITE_API_BASE_URL in your Amplify environment variables
```

**Solution**: Configure `VITE_API_BASE_URL` in Amplify Console.

### Next Steps

1. **Deploy Backend API** - Deploy your backend services to a server
2. **Configure VITE_API_BASE_URL** - Point to your deployed backend
3. **Test End-to-End** - Verify authentication and API calls work
4. **Monitor Logs** - Check Amplify build logs for any issues

### Build Configuration

Your `vite.config.ts` should handle environment variables correctly:

```typescript
export default defineConfig({
  // ... other config
  define: {
    // Ensure environment variables are available at build time
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});
```

This configuration ensures your frontend can connect to your backend API in production while maintaining the developer experience with MSW in development.