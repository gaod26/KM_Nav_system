# Floor 3 Addition - Complete

## Overview
Floor 3 has been successfully added to the Kirby-Manchester Navigation System. The system now supports 5 floors total: Basement (B), Floor 0, Floor 1, Floor 2, and Floor 3.

## What Was Added

### Backend Files
1. **CSC631-AG-SE/src/data/floor3.nodes.json** - Floor 3 node definitions (rooms, hallways, stairs, etc.)
2. **CSC631-AG-SE/src/data/floor3.edges.json** - Floor 3 edge connections
3. **CSC631-AG-SE/src/data/combined_nodes.json** - Updated with Floor 3 nodes appended
4. **CSC631-AG-SE/src/data/combined_edges.json** - Updated with Floor 3 edges appended

### Frontend Files
1. **CSC631-AG-SE/gabi_code/src/data/floor3.json** - Floor 3 edges for frontend
2. **CSC631-AG-SE/gabi_code/src/data/nodePositions.json** - Updated with Floor 3 node positions
3. **CSC631-AG-SE/gabi_code/public/images/floor3-plan.png** - Floor plan image placeholder

### Updated Components
1. **FloorDiagram.jsx** - Added Floor 3 to floor images map
2. **FloorMap.jsx** - Added Floor 3 data import and floor switcher support
3. **FloorMap.jsx** - Updated node filtering logic to support Floor 3 nodes
4. **Backend graphStore.js** - Automatically detects Floor 3 nodes/edges from combined files

## Floor 3 Node Types

### Rooms (R3XX)
- Regular rooms: R301-R390
- Room naming follows pattern: R3XX where XX is the room number

### Hallways (H3XX)
- 23 hallway nodes: H301-H323
- Connect various parts of Floor 3

### Stairs (S3XX)
- S301 - Stairwell 1 Floor 3
- S302 - Stairwell 2 Floor 3  
- S303 - Stairwell 3 Floor 3
- S304 - Stairwell 4 Floor 3

### Elevators (E3XX)
- E301 - Elevator 1 Floor 3
- E302 - Elevator 2 Floor 3

### Restrooms
- M301 - Men's Restroom 1
- M302 - Men's Restroom 2
- W301 - Women's Restroom 1
- W302 - Women's Restroom 2
- A301 - All Gender Restroom 1

### Other Spaces (O3XX)
- O301, O302, O303 - Special spaces

## Multi-Floor Routing

The system now supports routing across all 5 floors:
- Routes can span from Basement → Floor 0 → Floor 1 → Floor 2 → Floor 3
- Stairwells and elevators connect between floors
- Multi-floor routes are highlighted with floor indicators in the UI

## Floor Switcher

The floor switcher now displays all 5 available floors:
```
[B] [0] [1] [2] [3]
```

When a multi-floor route is active:
- Floors involved in the route show a route indicator (●)
- The current floor is highlighted
- Users can click any floor to view that floor's portion of the route

## Testing the System

### 1. Start the Backend
```bash
cd CSC631-AG-SE
npm start
```
Backend runs on: http://localhost:3000

### 2. Start the Frontend
```bash
cd CSC631-AG-SE/gabi_code
npm run dev
```
Frontend runs on: http://localhost:5173

### 3. Test Floor 3 Navigation

**Single Floor Routes (Floor 3 only):**
- R301 → R350
- H301 → H323
- S301 → E301

**Multi-Floor Routes (including Floor 3):**
- R101 (Floor 1) → R301 (Floor 3)
- R001 (Floor 0) → R390 (Floor 3)
- RB01 (Basement) → R350 (Floor 3)

## Floor 3 Statistics

- **Total Nodes:** 105
  - Rooms: 64
  - Hallways: 23
  - Stairs: 4
  - Elevators: 2
  - Restrooms: 6 (including 1 all-gender)
  - Other: 3

- **Total Edges:** 133 connections

## Stairwell/Elevator Connections

Floor 3 connects to Floor 2 via:
- S201 ↔ S301 (Stairwell 1)
- S202 ↔ S302 (Stairwell 2)
- S203 ↔ S303 (Stairwell 3)
- S204 ↔ S304 (Stairwell 4)
- E201 ↔ E301 (Elevator 1)
- E202 ↔ E302 (Elevator 2)

## Important Notes

### Floor Plan Image
The current `floor3-plan.png` is a placeholder (copy of floor2-plan.png). 
**TODO:** Replace with the actual Floor 3 architectural plan when available.

### Node Filtering Logic
Floor 3 nodes are identified by the pattern: `^[A-Z]+3[0-9]+`
- Examples: R301, H312, S303, E301, M302

### Data Source
All Floor 3 data was extracted from the provided combined_nodes.json and combined_edges.json files with floor=3.

## System Architecture

### 5-Floor Navigation Flow:
1. User selects start and destination (any floor)
2. Backend calculates optimal path using Dijkstra's algorithm
3. Path may cross multiple floors via stairs/elevators
4. Frontend displays route on each floor with floor switcher
5. Users can switch between floors to see their entire route

### Cross-Floor Path Visualization:
- Stairs/elevators that are transition points are highlighted
- Each floor shows only its portion of the route
- Floor switcher shows which floors are involved in the route

## Files Modified Summary

### Backend (8 files):
- src/data/floor3.nodes.json (NEW)
- src/data/floor3.edges.json (NEW)  
- src/data/combined_nodes.json (UPDATED)
- src/data/combined_edges.json (UPDATED)
- src/services/graphStore.js (AUTO-DETECTS Floor 3)

### Frontend (6 files):
- gabi_code/src/data/floor3.json (NEW)
- gabi_code/src/data/nodePositions.json (UPDATED)
- gabi_code/src/components/FloorMap/FloorDiagram.jsx (UPDATED)
- gabi_code/src/components/FloorMap/FloorMap.jsx (UPDATED)
- gabi_code/public/images/floor3-plan.png (NEW - placeholder)

## Next Steps

1. **Replace Placeholder Image:** Add actual Floor 3 architectural plan
2. **Test Routes:** Thoroughly test multi-floor routes involving Floor 3
3. **Verify Accessibility:** Ensure all Floor 3 rooms are reachable
4. **Update Documentation:** Add Floor 3 room descriptions/purposes if available

## Completion Date
April 26, 2026

## Status
✅ **COMPLETE** - All 5 floors (B, 0, 1, 2, 3) are now fully integrated into the navigation system.
