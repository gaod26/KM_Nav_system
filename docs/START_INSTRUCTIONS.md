# How to Start the Kirby-Manchester Navigation System

## Quick Start (Recommended)

### Option 1: Using the Start Script
```bash
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE
bash start-system.sh
# Then select option 3 to start both servers
```

## Manual Start (Alternative)

### Step 1: Start the Backend Server
Open a **new terminal window** and run:
```bash
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE
node src/server.js
```

You should see:
```
Server running on http://localhost:8000
```

### Step 2: Start the Frontend Server
Open a **second terminal window** and run:
```bash
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE/gabi_code
npm run dev
```

You should see:
```
  VITE v... ready in ...ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 3: Open in Browser
Open your browser and go to:
```
http://localhost:3000
```

## Verification Steps

1. **Check Backend Health**:
   - Open: http://localhost:8000/health
   - Should see: `{"status":"ok","service":"km-nav-backend"}`

2. **Test Frontend**:
   - Open: http://localhost:3000
   - Should see the navigation interface

3. **Test Multi-Floor Route**:
   - Select a start location on Floor 1 (e.g., R101)
   - Select a destination on Floor 2 (e.g., R201)
   - Click "Generate Route"
   - You should see:
     - "MULTI-FLOOR ROUTE" badge
     - Both floor tabs highlighted
     - Floor transition steps with 🔄 icon
     - Purple highlighting on transition steps

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000
# If something is using it, kill that process or change the port in server.js
```

### Frontend won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000
# If something is using it, kill that process or it will auto-assign a different port
```

### Dependencies not installed
```bash
# Install backend dependencies
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE
npm install

# Install frontend dependencies
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE/gabi_code
npm install
```

## Stopping the Servers

Press `Ctrl+C` in each terminal window to stop the servers.

## System Requirements

- **Backend**: Node.js (running on port 8000)
- **Frontend**: Vite dev server (running on port 3000)
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## What You'll See

Once both servers are running and you open http://localhost:3000, you'll see:
- Interactive floor map
- Floor switcher (top left)
- Location pickers in sidebar (left)
- Map controls (zoom, pan, reset)
- Route visualization when generated
- Directions panel (bottom right) when route is active

Enjoy testing the new multi-floor navigation features! 🎉
