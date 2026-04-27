# Additional Floors Implementation

## Overview
This document describes the implementation of additional floors (Basement and Floor 0) to the Kirby-Manchester navigation system, bringing the total to 4 floors: Basement (B), Floor 0, Floor 1, and Floor 2.

## Files Added

### Backend Data Files (CSC631-AG-SE/src/data/)
1. **floor0.nodes.json** - Node definitions for Floor 0
2. **floor0.edges.json** - Edge connections for Floor 0
3. **floorB.nodes.json** - Node definitions for Basement
4. **floorB.edges.json** - Edge connections for Basement

### Frontend Data Files (CSC631-AG-SE/gabi_code/src/data/)
1. **floor0.json** - Edge data for Floor 0 visualization
2. **floorB.json** - Edge data for Basement visualization

## Files Modified

### Backend
1. **src/services/graphStore.js**
   - Updated to load all floors from combined_nodes.json and combined_edges.json
   - Added floor separation logic for Basement ('B') and Floor 0 (0)
   - Updated FLOOR_DATA object to include all 4 floors
   - Modified listFloors() to return ['B', 0, 1, 2]
   - Updated getFloor() to handle non-numeric floor identifiers

### Frontend
1. **gabi_code/src/components/FloorMap/FloorMap.jsx**
   - Imported floor data for all floors (floorBData, floor0Data)
   - Updated floorDataMap to include all floors
   - Enhanced floor node filtering logic to properly identify:
     - Basement nodes (contains 'B' in ID: RB01, HB01, etc.)
     - Floor 0 nodes (R001, H001, S001, etc.)
     - Floor 1 nodes (R101, H101, S101, etc.)
     - Floor 2 nodes (R201, H201, S201, etc.)
   - Updated available floors list to ['B', 0, 1, 2]

## Floor Structure

### Basement (Floor B)
- **Rooms**: 7 rooms (RB01A, RB01B, RB02, RB03, RB04, RB04A, RB06)
- **Hallways**: 5 hallway nodes (HB01-HB05)
- **Vertical**: 2 staircases (SB01, SB02), 1 elevator (EB01)
- **Facilities**: Men's and Women's restrooms
- **Other**: 4 miscellaneous nodes

### Floor 0 (Ground Floor)
- **Rooms**: 31 rooms including Room 001 and subdivisions, Rooms 002A-024
- **Hallways**: 16 hallway nodes (H001-H016)
- **Vertical**: 4 staircases (S001-S004), 2 elevators (E001, E002)
- **Facilities**: 2 Men's restrooms, 2 Women's restrooms
- **Other**: 8 miscellaneous nodes

### Floor 1
- **Rooms**: 36 rooms (R101-R136)
- **Hallways**: 13 hallway nodes (H101-H113)
- **Junctions**: 2 junction nodes (J101-J102)
- **Vertical**: 4 staircases (S101-S104), 2 elevators (E101, E102)
- **Facilities**: 2 Men's restrooms, 2 Women's restrooms
- **Other**: 4 miscellaneous nodes

### Floor 2
- **Rooms**: 53 rooms (R201-R253)
- **Hallways**: 19 hallway nodes (H201-H219)
- **Vertical**: 4 staircases (S201-S204), 2 elevators (E201, E202)
- **Facilities**: 2 Men's restrooms, 2 Women's restrooms
- **Other**: 7 miscellaneous nodes

## Multi-Floor Navigation

The system supports cross-floor navigation using:
- **Staircases**: Connect corresponding stairwell nodes across floors (e.g., S001, S101, S201, SB01)
- **Elevators**: Connect corresponding elevator nodes across floors (e.g., E001, E101, E201, EB01)

### Cross-Floor Connections
The system maintains these vertical connections in combined_edges.json:
- Stairwell 1: SB01 ↔ S001 ↔ S101 ↔ S201
- Stairwell 2: SB02 ↔ S002 ↔ S102 ↔ S202
- Stairwell 3: S003 ↔ S103 ↔ S203
- Stairwell 4: S004 ↔ S104 ↔ S204
- Elevator 1: EB01 ↔ E001 ↔ E101 ↔ E201
- Elevator 2: E002 ↔ E102 ↔ E202

## Node Naming Convention

### Floor Identification
- **Basement**: Nodes contain 'B' after the type letter (RB01, HB01, SB01)
- **Floor 0**: Nodes have 0 or no floor digit (R001, H001, S001, R003, R004)
- **Floor 1**: Nodes have '1' as first digit after type (R101, H101, S101)
- **Floor 2**: Nodes have '2' as first digit after type (R201, H201, S201)

### Node Types
- **R**: Room
- **H**: Hallway
- **S**: Stairwell
- **E**: Elevator
- **M**: Men's Restroom
- **W**: Women's Restroom
- **O**: Other/Office
- **J**: Junction

## UI Updates

### Floor Switcher
The FloorSwitcher component now displays all 4 floors as tabs:
- **B** - Basement
- **0** - Ground Floor
- **1** - First Floor
- **2** - Second Floor

Active routes spanning multiple floors will highlight all involved floors in the switcher.

## Data Integrity

All data files were extracted from the provided combined_nodes.json and combined_edges.json files, ensuring:
- Consistent node IDs across floors
- Proper floor assignments
- Valid edge connections
- Maintained coordinate positions from nodePositions.json

## Testing Recommendations

1. **Single Floor Navigation**: Test routes within each individual floor
2. **Multi-Floor Navigation**: Test routes spanning 2, 3, and all 4 floors
3. **Vertical Transitions**: Verify staircase and elevator transitions work correctly
4. **Floor Switching**: Ensure floor switcher correctly displays and switches between all floors
5. **Route Visualization**: Confirm routes are properly highlighted on all involved floors

## Future Enhancements

Potential improvements for consideration:
1. Add floor plan images for Basement and Floor 0
2. Implement floor-specific styling or colors
3. Add 3D visualization of multi-floor routes
4. Include accessibility information for elevator-only routes
5. Add estimated time for vertical transitions

## Notes

- The Basement floor uses 'B' as a string identifier (not a number)
- Floor detection logic prioritizes exact pattern matching for reliability
- All floors share the same coordinate system for consistent visualization
- Cross-floor routing uses the unified graph in graphStore.js
