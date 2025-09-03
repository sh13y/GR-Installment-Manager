# Uptime Monitoring Setup for GR Installment Manager

## Health Check Endpoints

Your app now has two dedicated endpoints for uptime monitoring:

### 1. `/api/health` - Detailed Health Check
- **URL**: `https://your-app-name.onrender.com/api/health`
- **Purpose**: Comprehensive health check with system info
- **Response**: JSON with status, timestamp, uptime, version
- **Use for**: Detailed monitoring and debugging

### 2. `/api/ping` - Lightweight Ping
- **URL**: `https://your-app-name.onrender.com/api/ping`
- **Purpose**: Ultra-fast ping to keep app alive
- **Response**: Simple JSON `{"ping":"pong","time":timestamp}`
- **Use for**: Uptime Robot monitoring (recommended)

## Uptime Robot Setup

1. **Sign up at**: https://uptimerobot.com (free plan available)

2. **Create New Monitor**:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `GR Installment Manager`
   - **URL**: `https://your-app-name.onrender.com/api/ping`
   - **Monitoring Interval**: 5 minutes
   - **Monitor Timeout**: 30 seconds

3. **Advanced Settings**:
   - **HTTP Method**: GET
   - **Expected Status Code**: 200
   - **Keyword Monitoring**: `pong` (optional)

## Why This Works

- **Render Free Tier**: Apps sleep after 15 minutes of inactivity
- **Uptime Robot**: Pings every 5 minutes to keep app awake
- **Lightweight Endpoint**: `/api/ping` uses minimal resources
- **No Authentication**: Endpoints are public and fast

## Alternative Monitoring Services

If you prefer other services:
- **Pingdom**: Use `/api/ping`
- **StatusCake**: Use `/api/ping`
- **Freshping**: Use `/api/health`
- **Custom Scripts**: Both endpoints work

## Testing Locally

Once deployed, test your endpoints:
```bash
curl https://your-app-name.onrender.com/api/ping
curl https://your-app-name.onrender.com/api/health
```

## Expected Responses

**Ping Response**:
```json
{
  "ping": "pong",
  "time": 1725379200000
}
```

**Health Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-03T12:00:00.000Z",
  "uptime": 3600,
  "message": "GR Installment Manager is running",
  "version": "1.0.0"
}
```

Your app will now stay online 24/7! 🚀
