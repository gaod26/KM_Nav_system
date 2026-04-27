# Frontend-Backend Integration Testing Guide

## Overview
This guide will help you test the connection between the React frontend and Node.js backend for the Kirby-Manchester Indoor Navigation System.

## Prerequisites

### Backend Requirements
- Node.js installed
- Backend dependencies installed: `npm install` (in root directory)
- Backend server running on port 8000

### Frontend Requirements
- Node.js installed
- Frontend dependencies installed: `cd gabi_code && npm install`
- Frontend dev server running on port 3000

## Step 1: Start the Backend Server

```bash
# From the root directory (CSC631-AG-SE/)
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE

# Install backend dependencies (if not already done)
npm install

# Start the backend server
node src/server.js
```

**Expected output:**
```
KM Nav backend running at http://localhost:8000
```

## Step 2: Test Backend Endpoints

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```
**Expected response:**
```json
{"status":"ok","service":"km-nav-backend"}
```

### Test Floors Endpoint
```bash
curl http://localhost:8000/floors
```
**Expected response:**
```json
[1]
```

### Test Floor Data Endpoint
```bash
curl http://localhost:8000/floors/1
```
**Expected response:** JSON object with `floor`, `nodes`, and `edges` arrays

### Test Route Endpoint
```bash
curl -X POST http://localhost:8000/route \
  -H "Content-Type: application/json" \
  -d '{"start":"R101","destination":"R120","preference":"none"}'
```
**Expected response:**
```json
{
  "floors": {
    "1": ["R101", "H103", "J101", "H101", "H106", "H108", "R120"]
  },
  "instructions": ["Start at Room 101", "Walk to...", "You have arrived"],
  "total_distance": 450.5
}
```

### Test Search Endpoint
```bash
curl "http://localhost:8000/search?q=room"
```
**Expected response:** Array of matching nodes

## Step 3: Start the Frontend Server

```bash
# Open a NEW terminal window
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE/gabi_code

# Install frontend dependencies (if not already done)
npm install

# Start the frontend dev server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 4: Test Frontend Integration

### Open the Application
1. Open your browser to: http://localhost:3000
2. You should see the Kirby-Manchester Indoor Navigation interface

### Test Location Loading
1. Check the browser console (F12 → Console tab)
2. Look for any errors or successful API calls
3. The sidebar should show location dropdown menus

### Test Route Generation

#### Test Case 1: Simple Route (Same Floor)
1. **Start Location**: Click the "Start Location" dropdown
   - Search for or select: `R101` (Room 101)
2. **Destination**: Click the "Destination" dropdown
   - Search for or select: `R120` (Room 120)
3. **Preference**: Leave as "No Preference"
4. Click **"Generate Route"** button

**Expected Results:**
- ✅ Loading spinner appears briefly
- ✅ Route path appears on the map in green
- ✅ Start location (R101) is marked in green
- ✅ Destination (R120) is marked in red
- ✅ Directions panel appears showing:
  - Step-by-step instructions
  - Total distance
- ✅ No error messages appear

#### Test Case 2: Different Rooms
1. **Start Location**: `R101` (Room 101)
2. **Destination**: `R135` (Room 135)
3. Click **"Generate Route"**

**Expected Results:**
- ✅ Route appears connecting the two rooms
- ✅ Map shows the path highlighted
- ✅ Directions list shows the complete route

#### Test Case 3: Hallway to Room
1. **Start Location**: `H106` (Hallway Node 6)
2. **Destination**: `R122` (Room 122)
3. Click **"Generate Route"**

**Expected Results:**
- ✅ Route successfully generated
- ✅ Path displayed on map

#### Test Case 4: Using Stairs
1. **Start Location**: `R101` (Room 101)
2. **Destination**: `S101` (Stairwell 1)
3. **Preference**: "Stairs"
4. Click **"Generate Route"**

**Expected Results:**
- ✅ Route connects to the stairwell
- ✅ Stairwell node is visible on the path

### Test Edge Cases

#### Test Case 5: Same Location Error
1. **Start Location**: `R101`
2. **Destination**: `R101`
3. Click **"Generate Route"**

**Expected Results:**
- ✅ Error message: "Start and destination cannot be the same"
- ✅ No route generated

#### Test Case 6: Missing Locations
1. Leave **Start Location** empty
2. Select a **Destination**: `R120`
3. Click **"Generate Route"**

**Expected Results:**
- ✅ Button is disabled (grayed out)
- ✅ Cannot generate route

### Test Interactive Features

#### Test Case 7: Click on Map
1. Clear any existing route
2. Click on a node on the map (e.g., R103)
3. Click on another node on the map (e.g., R125)

**Expected Results:**
- ✅ First click sets the start location
- ✅ Second click sets the destination
- ✅ Location inputs update accordingly

#### Test Case 8: Clear Route
1. Generate any route
2. Click **"Clear Route"** button

**Expected Results:**
- ✅ Route path disappears from map
- ✅ Start and destination inputs are cleared
- ✅ Directions panel closes

#### Test Case 9: Map Controls
1. Test zoom in (+) button
2. Test zoom out (-) button
3. Test reset (⟲) button
4. Test click and drag to pan

**Expected Results:**
- ✅ Map zooms in/out smoothly
- ✅ Reset returns map to original view
- ✅ Pan (drag) moves the map view

## Step 5: Check Browser Console

### Open Developer Tools
Press F12 or Right-click → Inspect, then go to:

1. **Console Tab**: Check for:
   - ✅ No error messages
   - ✅ Successful API calls logged
   - ✅ Route data received

2. **Network Tab**: Check for:
   - ✅ POST request to `/route` with status 200
   - ✅ GET requests to `/floors` with status 200
   - ✅ Response contains expected data structure

## Common Issues & Solutions

### Issue 1: "Unable to connect to server"
**Solution:**
- Ensure backend server is running on port 8000
- Run: `node src/server.js` from the root directory
- Check for port conflicts

### Issue 2: "CORS Error"
**Solution:**
- Backend server.js already has CORS enabled
- If issue persists, check browser console for specific error

### Issue 3: Empty Room Dropdowns
**Solution:**
- Check that backend /floors endpoint is accessible
- Verify backend has loaded floor1.nodes.json correctly
- Check browser console for errors

### Issue 4: Route Not Displayed on Map
**Solution:**
- Verify route response includes `floors` object with path array
- Check that node IDs in path exist in nodePositions.json
- Look for JavaScript errors in console

### Issue 5: "No path found" Error
**Solution:**
- Ensure the nodes are connected in the graph
- Check floor1.edges.json for connections between selected nodes
- Try different node combinations

## Verification Checklist

### Backend is working:
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Floors endpoint returns [1]
- [ ] Route endpoint generates paths
- [ ] Search endpoint returns results

### Frontend is working:
- [ ] Dev server starts on port 3000
- [ ] Page loads without errors
- [ ] Location dropdowns populate with rooms
- [ ] Map renders with nodes and edges
- [ ] Click interactions work

### Integration is working:
- [ ] Routes can be generated
- [ ] Paths display on the map
- [ ] Directions list appears
- [ ] Distance is shown
- [ ] Error handling works properly

## API Integration Summary

### Frontend → Backend Communication

**Base URL:** `http://localhost:8000`

**Endpoints Used:**
1. `GET /floors` - Get available floors
2. `GET /floors/:id` - Get floor map data
3. `POST /route` - Generate route between two locations
4. `GET /search?q=query` - Search for locations

**Request Example:**
```javascript
// Frontend sends:
{
  "start": "R101",
  "destination": "R120", 
  "preference": "none"  // or "stairs" or "elevator"
}

// Backend responds:
{
  "floors": {
    "1": ["R101", "H103", "J101", "H101", "H106", "H108", "R120"]
  },
  "instructions": [
    "Start at Room 101",
    "Walk straight to Hallway Node 3",
    "Continue to Junction Node 1",
    "...",
    "You have arrived at Room 120"
  ],
  "total_distance": 567.8
}
```

## Sample Test Locations

### Valid Room Pairs (Should Work):
- R101 → R120 (opposite sides of building)
- R102 → R125 (long distance)
- R103 → R108 (medium distance)
- R109 → R122 (close proximity)
- H101 → H108 (hallway to hallway)

### Nodes Near Stairs/Elevators:
- S101, S102, S103, S104 (Stairwells)
- E101, E102 (Elevators)

### Test with Different Node Types:
- Rooms (R prefix)
- Hallways (H prefix)
- Junctions (J prefix)
- Stairs (S prefix)
- Elevators (E prefix)

## Performance Expectations

- Route generation: < 500ms
- Map rendering: < 200ms
- Location search: < 100ms
- Page load: < 2 seconds

## Success Criteria

✅ **Integration is successful when:**
1. Frontend can fetch floor data from backend
2. Users can select start and destination locations
3. Routes are calculated by backend using Dijkstra's algorithm
4. Paths are displayed visually on the map
5. Step-by-step directions are shown
6. Total distance is displayed
7. All errors are handled gracefully

## Next Steps

After confirming the integration works:
1. Test with multiple users
2. Test on different browsers (Chrome, Firefox, Safari)
3. Test responsive design on mobile devices
4. Load test with multiple simultaneous route requests
5. Consider adding more floors (when backend data is available)

## Support

If you encounter issues not covered in this guide:
1. Check browser console for JavaScript errors
2. Check terminal for backend errors
3. Verify all dependencies are installed
4. Ensure both servers are running simultaneously
5. Try restarting both servers
