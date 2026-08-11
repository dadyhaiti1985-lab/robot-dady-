# Backend Server Diagnostics & Recovery Guide

## ✅ VERIFICATION CHECKLIST

### 1. Server Status
- **Port**: 3001 (NOT 3000, NOT 5000)
- **Status**: Express.js server with full middleware stack
- **Startup Command**: `npm run dev` (development) or `npm start` (production)

### 2. Environment Variables (.env)
Required variables in `apps/api/.env`:
```
PORT=3001
CORS_ORIGIN=*
NODE_ENV=development
LOG_LEVEL=info
POCKETBASE_URL=http://localhost:8090
COINBASE_API_KEY=<your-key>
COINBASE_API_SECRET=<your-secret>
COINBASE_API_PASSPHRASE=<your-passphrase>
PB_SUPERUSER_EMAIL=<email>
PB_SUPERUSER_PASSWORD=<password>
TELEGRAM_TOKEN=<optional>
TELEGRAM_CHAT_ID=<optional>
```

### 3. Route Configuration

#### Health Check
- **Endpoint**: `GET /health`
- **Full URL**: `http://localhost:3001/health`
- **Frontend Call**: `apiServerClient.fetch('/health')`
- **Response**: `{ status: 'ok', timestamp: '2024-...' }`
- **Status Code**: 200

#### Bot Routes
- **Base Path**: `/bot`
- **Full URLs**: `http://localhost:3001/bot/*`
- **Frontend Calls**: `apiServerClient.fetch('/bot/*')`

#### Balance Endpoint (CRITICAL)
- **Endpoint**: `GET /bot/balance`
- **Full URL**: `http://localhost:3001/bot/balance`
- **Frontend Call**: `apiServerClient.fetch('/bot/balance')`
- **Response Format**: `{ total, available, hold, last_24h_change, timestamp }`
- **Status Code**: 200 (success) or 500 (error)

### 4. Middleware Stack (in order)
1. helmet() - Security headers
2. cors() - CORS with allowed origins
3. morgan() - HTTP request logging
4. globalRateLimit - Rate limiting
5. express.json() - JSON body parser
6. express.urlencoded() - URL-encoded body parser
7. Routes - All API routes
8. errorMiddleware - Global error handler
9. 404 handler - Route not found

### 5. Error Handling
- Routes throw errors → errorMiddleware catches → logs with logger → returns JSON response
- NO try/catch in routes
- NO console.log/console.error
- All errors logged with timestamp, method, path, status code, and stack trace

### 6. Coinbase API Integration
- File: `apps/api/src/utils/coinbase.js`
- Initialization: `initializeCoinbaseCredentials()` called on startup
- Fallback: If credentials missing, returns mock data (demo mode)
- Test Endpoint: `GET /bot/test-coinbase`

### 7. CORS Configuration

Allowed Origins:
- https://horizons.hostinger.com
- https://ede840c3-0d3d-4366-881e-753bec5b7927.app-preview.com
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (alternative dev port)
- Wildcard * if CORS_ORIGIN=* in .env

### 8. Startup Logs

Expected logs on server startup:
```
[INFO] === Backend Server Startup ===
[INFO] NODE_ENV: development
[INFO] PORT: 3001
[INFO] POCKETBASE_URL: http://localhost:8090
[INFO] COINBASE_API_KEY: SET
[INFO] COINBASE_API_SECRET: SET
[INFO] COINBASE_API_PASSPHRASE: SET
[INFO] PB_SUPERUSER_EMAIL: SET
[INFO] PB_SUPERUSER_PASSWORD: SET
[INFO] ==============================
[INFO] 🚀 API Server running on http://localhost:3001
[INFO] ✅ CORS enabled for origins: ...
```

## 🔧 TROUBLESHOOTING

### Server Won't Start

**Check 1: Port Already in Use**
```bash
lsof -ti:3001 | xargs kill -9
```

**Check 2: Missing Dependencies**
```bash
cd apps/api
npm install
```

**Check 3: Syntax Errors**
```bash
npm run lint
```

**Check 4: Environment Variables**
- Verify apps/api/.env exists
- Check all required variables are set
- Restart server after changing .env

**Check 5: PocketBase Connection**
- Verify PocketBase running on http://localhost:8090
- Check PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD are correct

### Balance Endpoint Returns Error

**Check 1: Coinbase Credentials**
```bash
curl http://localhost:3001/bot/debug-credentials
```

**Check 2: Coinbase API Connection**
```bash
curl http://localhost:3001/bot/test-coinbase
```

**Check 3: Network Issues**
- Verify internet connection
- Check firewall rules
- Verify Coinbase API is not rate limiting

## 📊 Testing Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Debug Credentials
```bash
curl http://localhost:3001/bot/debug-credentials
```

### Test Coinbase Connection
```bash
curl http://localhost:3001/bot/test-coinbase
```

### Get Balance
```bash
curl http://localhost:3001/bot/balance
```

### Get Accounts
```bash
curl http://localhost:3001/bot/accounts
```

## 🚀 Server Restart Procedure

1. Kill existing process: `lsof -ti:3001 | xargs kill -9`
2. Clear PocketBase connections (wait 30 seconds)
3. Start server: `cd apps/api && npm run dev`
4. Verify startup: Check logs for "🚀 API Server running"
5. Test health: `curl http://localhost:3001/health`
6. Clear frontend cache (Ctrl+Shift+Delete)

## 📝 Key Files

- Main Server: apps/api/src/main.js
- Routes: apps/api/src/routes/index.js, apps/api/src/routes/bot.js
- Error Middleware: apps/api/src/middleware/error.js
- Logger: apps/api/src/utils/logger.js
- Coinbase Utils: apps/api/src/utils/coinbase.js
- PocketBase Client: apps/api/src/utils/pocketbaseClient.js
- Environment: apps/api/.env
- Package Config: apps/api/package.json

## ✨ Summary

✅ Server runs on PORT 3001
✅ All middleware properly configured
✅ CORS enabled for frontend origins
✅ Error handling with global middleware
✅ Logging with timestamps and context
✅ Coinbase API integration with fallback
✅ Balance endpoint returns proper JSON
✅ Routes registered without /api/ prefix
✅ PocketBase client pre-initialized
✅ Environment variables validated on startup