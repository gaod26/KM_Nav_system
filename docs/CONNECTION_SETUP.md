# Backend-Frontend Connection Setup

## Overview
The backend and frontend are now properly connected through Vite's proxy configuration.

## Architecture

### Backend (Port 8000)
- **Location**: `CSC631-AG-SE/src/server.js`
- **Port**: 8000
- **CORS**: Enabled for all origins
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /floors` - Get available floors
  - `GET /floors/:floor` - Get floor data (nodes & edges)
  - `POST /route` - Generate route between two points
  - `GET /search` - Search for locations
  - `GET /nearest` - Find nearest facility

### Frontend (Port 3000)
- **Location**: `CSC631-AG-SE/gabi_code/`
- **Port**: 3000
- **Framework**: React + Vite

### Connection Flow
```
Frontend (localhost:3000) 
    ↓ API Request: /api/floors
Vite Proxy 
    ↓ Forwards to: http://localhost:8000/floors
Backend (localhost:8000)
    ↓ Response
Frontend receives data
```

## Configuration Files

### 1. Vite Proxy (`gabi_code/vite.config.js`)
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### 2. API Client (`gabi_code/src/services/api.js`)
```javascript
const api = axios.create({
  baseURL: '/api',  // Uses Vite proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## How to Start the System

### Option 1: Use the Quick Start Script (Recommended)
```bash
cd CSC631-AG-SE
bash start-system.sh
# Choose option 3 to start both servers
```

### Option 2: Start Manually in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd CSC631-AG-SE
npm install  # First time only
node src/server.js
```

**Terminal 2 - Frontend:**
```bash
cd CSC631-AG-SE/gabi_code
npm install  # First time only
npm run dev
```

### Option 3: Start Both from Project Root
```bash
# Backend
cd CSC631-AG-SE && node src/server.js &

# Frontend
cd CSC631-AG-SE/gabi_code && npm run dev
```

## Verification

1. **Backend Health Check** (when backend is running):
   ```bash
   curl http://localhost:8000/health
   ```
   Expected: `{"status":"ok","service":"km-nav-backend"}`

2. **Frontend Access**:
   Open browser to http://localhost:3000

3. **Proxy Test** (from browser console when frontend is running):
   ```javascript
   fetch('/api/health').then(r => r.json()).then(console.log)
   ```
   Expected: `{status: "ok", service: "km-nav-backend"}`

## Changes Made

### Fixed: API Connection
- **Before**: `baseURL: 'http://localhost:8000'` (Direct connection, bypassed proxy)
- **After**: `baseURL: '/api'` (Uses Vite proxy)

### Why This Matters
1. **Development**: Proxy handles CORS automatically during development
2. **Security**: No direct cross-origin requests
3. **Flexibility**: Easy to change backend URL without modifying frontend code
4. **Best Practice**: Standard pattern for Vite/React development

## Troubleshooting

### Backend not responding
- Check if port 8000 is in use: `lsof -i :8000`
- Verify backend is running: `curl http://localhost:8000/health`

### Frontend can't connect to backend
- Ensure both servers are running
- Check browser console for errors
- Verify Vite proxy configuration in `vite.config.js`

### Port conflicts
- Backend: Change `PORT` in `src/server.js`
- Frontend: Change `port` in `vite.config.js`

## API Usage Example

```javascript
// In any React component
import api from '../services/api'

// Get all floors
const floors = await api.get('/floors')

// Search for locations
const results = await api.get('/search', { params: { q: 'bathroom' } })

// Generate route
const route = await api.post('/route', {
  start: 'R101',
  destination: 'R201',
  preference: 'none'
})
```

## Status
✅ Backend configured on port 8000  
✅ Frontend configured on port 3000  
✅ Vite proxy configured  
✅ API client updated to use proxy  
✅ CORS enabled  
✅ Startup scripts ready  

**System is ready to run!**
