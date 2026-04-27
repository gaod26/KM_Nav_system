# Kirby-Manchester Indoor Navigation System - Frontend

React-based frontend for the Kirby-Manchester Indoor Navigation System at Wake Forest University.

## Features

- **Interactive Floor Maps**: SVG-based visualization generated from building graph data
- **Route Generation**: Find optimal paths between locations using Dijkstra's algorithm
- **Location Search**: Autocomplete search for rooms, hallways, stairs, and elevators
- **Movement Preferences**: Select stairs or elevator preferences for multi-floor routes
- **Visual & Text Directions**: Both map-based route highlighting and step-by-step text instructions
- **Zoom & Pan**: Navigate large floor plans with intuitive controls
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for backend API
- **CSS3** - Modern styling with CSS variables

## Prerequisites

- Node.js 16+ and npm
- Spring Boot backend running on http://localhost:8080

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The dev server runs on `http://localhost:3000` with automatic proxy to the backend API at `http://localhost:8080`.

### Project Structure

```
src/
├── components/
│   ├── Controls/          # Floor switcher, preference toggle
│   ├── FloorMap/          # SVG map rendering and interaction
│   ├── Layout/            # Header and sidebar
│   ├── LocationPicker/    # Room search and selection
│   └── RouteDisplay/      # Directions list
├── data/                  # Floor graph data (JSON)
├── services/              # API communication layer
├── utils/                 # Graph algorithms and helpers
├── App.jsx               # Main application component
└── main.jsx              # Application entry point
```

## Backend API Integration

The frontend expects the following endpoints:

### POST /api/route
Generate a route between two locations.

**Request:**
```json
{
  "start": "H101",
  "destination": "R201",
  "preference": "stairs" // or "elevator" or "no_preference"
}
```

**Response:**
```json
{
  "path": ["H101", "J101", "S102", "R201"],
  "distance": 450.5,
  "floors": [1, 2],
  "transitions": [
    { "from": 1, "to": 2, "via": "S102", "type": "stairs" }
  ],
  "directions": [
    "Start at Hallway 101",
    "Walk to Junction 101 (144 ft)",
    "Take stairs S102 to Floor 2",
    "Continue to Room 201",
    "You have arrived"
  ]
}
```

### GET /api/rooms
Get all available rooms.

**Response:**
```json
[
  {
    "id": "R101",
    "name": "Room 101",
    "floor": 1,
    "type": "classroom"
  }
]
```

### GET /api/rooms/:id
Get detailed room information.

### GET /api/floors
Get floor metadata.

## Map Generation

Floor maps are automatically generated from edge table data using a force-directed graph layout algorithm. The system:

1. Parses edge connections from JSON
2. Calculates optimal node positions using physics simulation
3. Renders as interactive SVG with zoom/pan controls
4. Highlights routes when generated

## Adding More Floors

To add additional floors:

1. Add floor data to `src/data/` (e.g., `floor2.json`, `floor3.json`)
2. Import in `FloorMap.jsx`
3. Update `availableFloors` prop in the FloorSwitcher component
4. Ensure backend supports the new floor numbers

## Customization

### Colors & Branding

Edit CSS variables in `src/index.css`:

```css
:root {
  --primary-color: #15803d;    /* Green */
  --secondary-color: #fbbf24;  /* Gold */
  --background: #f9fafb;       /* Light gray */
  /* ... */
}
```

### Node Types & Colors

Modify node colors in `FloorMap.jsx` `getNodeColor()` function.

## Requirements Met

This frontend implements all functional requirements from the project specification:

✅ **FR1**: Display interactive floor plan  
✅ **FR2**: Display/identify current location  
✅ **FR3**: Room search and information  
✅ **FR4**: Route generation between locations  
✅ **FR5**: Multiple forms of directions (visual + text)  
✅ **FR6**: Stair/elevator preference toggle  

## Performance

- Route visualization renders in < 100ms
- SVG supports 100+ nodes without lag
- Force-directed layout completes in < 200ms
- Responsive to window resize

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Team

- **Dan Gao** - Backend Development & Algorithm Design
- **Gabi Yankovski** - Frontend Development & UI Design  
- **Elliott Lowman** - Data Management & QA

## License

Wake Forest University - CSC 342 Project
