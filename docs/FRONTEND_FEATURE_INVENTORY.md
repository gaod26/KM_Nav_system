# Frontend Feature Inventory

> **Scope:** Objective inventory of the frontend as it exists in source code. No judgments about correctness are made. Evidence is cited by file path and line number.  
> **Read-only cross-references:** `docs/BACKEND_API_INVENTORY.md`, `docs/BACKEND_DATA_MODEL.md`

---

## Table of Contents

1. [User-Visible Feature List](#1-user-visible-feature-list)
2. [Data Source Classification](#2-data-source-classification)
3. [State Management Inventory](#3-state-management-inventory)
4. [Browser Storage Inventory](#4-browser-storage-inventory)
5. [Suspected Frontend-Only Features](#5-suspected-frontend-only-features)
6. [Suspected Mismatches With Backend](#6-suspected-mismatches-with-backend)
7. [Frontend Dependencies](#7-frontend-dependencies)

---

## 1. User-Visible Feature List

### 1.1 Login / Register

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Auth/AuthModal.jsx` |
| **Trigger** | `frontend/src/components/Layout/Header.jsx` — "Login / Register" button (line 38), visible only when `user` is `null` |

**User flow:**
1. User clicks "Login / Register" in the header.
2. A modal overlay appears (`AuthModal`). Default mode is Login.
3. User types username + password and submits.
4. On success: modal closes, header updates to show username + "History" + "Logout" buttons.
5. A "Don't have an account? Register" toggle button switches to registration mode, which adds a "Confirm Password" field (client-side password-match validation before sending).
6. On any error, a red error message is shown inside the modal.
7. Clicking the overlay background or the ✕ button closes the modal without logging in.

---

### 1.2 Logout

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Layout/Header.jsx` (line 29) |
| **Trigger** | "Logout" button, visible only when `user` is not null |

**User flow:**
1. User clicks "Logout".
2. `authLogout()` is called, which removes `auth_token` and `auth_user` from `localStorage`.
3. `user` state resets to `null`; the History panel is closed if open.
4. Header reverts to showing the "Login / Register" button.

---

### 1.3 Start / Destination Location Selection (Dropdown)

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/LocationPicker/LocationInput.jsx` |
| **Host** | `frontend/src/components/Layout/Sidebar.jsx` (lines 42–60) — two instances |

**User flow:**
1. On app load, all available rooms/nodes are fetched from the backend via `getAllRooms()` and stored in `rooms` state.
2. Each `LocationInput` shows a text field. Typing filters the `rooms` list client-side by `room.id` or `room.name`.
3. Clicking the input focuses it and opens a dropdown of matching rooms showing ID, name, and type.
4. Selecting a room sets the field's value; the field switches to a "selected" display with a ✕ clear button.
5. Clicking ✕ clears the selection and shows the search field again.

---

### 1.4 Location Selection by Clicking the Map

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/FloorMap/FloorMap.jsx` (lines 94–98, 151–158) |

**User flow:**
1. User clicks a node circle on the SVG map.
2. If `startLocation` is empty, the clicked node ID becomes start.
3. If `startLocation` is set but `destination` is empty (and the node is not the start), the clicked node ID becomes destination.
4. Subsequent clicks have no further effect until a selection is cleared.

---

### 1.5 Route Preference Selection

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Controls/PreferenceToggle.jsx` |
| **Host** | `frontend/src/components/Layout/Sidebar.jsx` (lines 63–69) |

**User flow:**
1. Three toggle buttons are always visible: "No Preference" 🚶, "Prefer Stairs" 🪜, "Prefer Elevator" 🛗.
2. Default selection is "No Preference" (`'no_preference'`).
3. Clicking a button sets `preference` state. Only one can be active at a time (highlighted).

---

### 1.6 Route Generation

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Layout/Sidebar.jsx` (lines 79–92) |
| **Logic** | `frontend/src/App.jsx` — `handleGenerateRoute()` (lines 49–86) |
| **Service** | `frontend/src/services/routeService.js` — `generateRoute()` (lines 6–43) |

**User flow:**
1. "Generate Route" button is enabled only when both `startLocation` and `destination` are set.
2. Clicking it validates that start ≠ destination (client-side check).
3. A loading spinner replaces the button label while the API call is in flight.
4. On success: `routeData` is set, the directions panel appears, and the map switches to the first floor in the route.
5. On error: a red error message is shown in the sidebar.

---

### 1.7 Clear Route

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Layout/Sidebar.jsx` (lines 94–102) |
| **Logic** | `frontend/src/App.jsx` — `handleClearRoute()` (lines 88–95) |

**User flow:**
1. "Clear Route" button appears below "Generate Route" only when a route is active (`hasRoute` prop).
2. Clicking it resets `routeData`, `startLocation`, `destination`, `preference`, `error`, and `showDirections` to their initial values.

---

### 1.8 Directions Panel

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/RouteDisplay/DirectionsList.jsx` |
| **Host** | `frontend/src/App.jsx` (lines 161–168) |

**User flow:**
1. After a successful route generation, the directions panel appears overlaid on the map.
2. It shows a summary (distance formatted as ft/mi, estimated time display string).
3. An ordered list of direction steps is displayed; steps matching floor-transition keywords (`"floor"`, `"stairs"`, `"stairwell"`, `"elevator"`) get a 🔄 icon.
4. Clicking ✕ hides the panel (sets `showDirections` to false) without clearing the route.

---

### 1.9 Floor Switching

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Controls/FloorSwitcher.jsx` |
| **Host** | `frontend/src/components/FloorMap/FloorMap.jsx` (lines 181–186) |

**User flow:**
1. A row of floor tabs is always shown: `B`, `0`, `1`, `2`, `3` (hardcoded in `FloorMap.jsx` line 184).
2. The active floor tab is disabled (no re-click).
3. Tabs for floors that appear in the current route are highlighted with a `●` indicator.
4. When a multi-floor route is active, a "Multi-Floor Route" badge appears.
5. Clicking a floor tab switches the displayed floor map and node/edge overlay.

---

### 1.10 Interactive SVG Map — Pan

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/FloorMap/FloorMap.jsx` (lines 24–48) |

**User flow:**
1. User clicks and drags on the SVG map.
2. The viewport (`viewBox`) scrolls in the direction of the drag.
3. Releasing the mouse button ends panning.

---

### 1.11 Interactive SVG Map — Zoom

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/FloorMap/FloorMap.jsx` (lines 50–92, 188–213) |

**User flow — buttons:** Three buttons in a control strip (`+`, `−`, ⟲ reset) adjust zoom level between 0.5× and 3×. The current zoom percentage is displayed between the buttons.

**User flow — scroll wheel:** Scrolling over the map zooms in/out centred on the cursor position.

---

### 1.12 Floor Plan Background Image

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/FloorMap/FloorDiagram.jsx` |

**User flow:**
1. Each floor displays a static PNG floor-plan image as an SVG `<image>` background: `floorB-plan.png`, `floor0-plan.png`, `floor1-plan.png`, `floor2-plan.png`, `floor3-plan.png`.
2. The image scales to 1700×900 SVG units (`preserveAspectRatio="none"`).

---

### 1.13 Node Color / Size Coding (Map Legend)

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/FloorMap/FloorMap.jsx` (lines 100–125, 311–328) |

**User flow:**
1. Nodes are color-coded by type (derived from ID prefix via `getNodeType()`): room=blue, hallway=slate, junction=purple, stairs/elevator=amber, office=cyan, restroom=pink.
2. Start node is always green, destination always red, regardless of type.
3. Node size varies by type: start/destination=12px, stairs/elevator=10px, junction=8px, hallway=6px, room=8px.
4. A static legend at the bottom of the map shows Start (green), Destination (red), Room (blue), Stairs/Elevator (amber).
5. Route nodes are outlined in green; transition nodes (stairs/elevator in a multi-floor route) get a dashed purple ring.

---

### 1.14 Sidebar Collapse / Expand

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Layout/Sidebar.jsx` (lines 20, 23–30) |

**User flow:**
1. A ◀/▶ toggle button on the sidebar edge collapses or expands the sidebar content.
2. When collapsed, only the toggle arrow is visible and the map takes the full width.

---

### 1.15 Navigation History Panel

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/History/HistoryPanel.jsx` |
| **Trigger** | `frontend/src/components/Layout/Header.jsx` — "📜 History" button (line 18), visible only when `user` is not null |

**User flow:**
1. Authenticated user clicks "History" in the header.
2. An overlay panel slides in. The panel immediately fetches the last 20 history entries from the backend.
3. Each entry shows: origin → destination, distance (ft/mi), estimated time (`.display` string), preference badge, and relative timestamp.
4. Clicking an entry calls `onSelectRoute(route.origin, route.destination, route.preference)`, which pre-fills the route form and closes the panel.
5. A "Retry" button appears if loading fails.
6. Clicking the background overlay or ✕ closes the panel.

---

### 1.16 App Title / Branding

| Attribute | Value |
|---|---|
| **Component** | `frontend/src/components/Layout/Header.jsx` (lines 8–9) |

Static. Shows "Kirby-Manchester Navigation" and "Indoor Navigation System" subtitle, plus a "Wake Forest University" badge.

---

## 2. Data Source Classification

| Feature | Data Source | Detail |
|---|---|---|
| Login (submit) | **Backend API** | `POST /api/auth/login` via `authService.login()` |
| Register (submit) | **Backend API** | `POST /api/auth/register` via `authService.register()` |
| Auth token persistence | **Browser storage** | `localStorage` key `auth_token` |
| Auth user persistence | **Browser storage** | `localStorage` key `auth_user` |
| Session restore on reload | **Browser storage** | `localStorage.getItem('auth_token')` checked on mount (`App.jsx` line 33) |
| Location dropdown options | **Backend API** | `GET /api/floors` then `GET /api/floors/:id` for every floor via `getAllRooms()` |
| Location dropdown filtering | **Client-side** | `LocationInput.jsx` filters `rooms` array by substring match — no API call |
| Route generation | **Backend API** | `POST /api/route` via `routeService.generateRoute()` |
| Node/edge display on map | **Local JSON files** | `frontend/src/data/floor{B,0,1,2,3}.json` (edge lists) and `frontend/src/data/nodePositions.json` (pixel coordinates) |
| Floor plan images | **Static files** | `frontend/public/images/floor*-plan.png` served by Vite |
| Node type color/size | **Client-side** | `graphUtils.getNodeType(nodeId)` — parses leading uppercase letters from node ID |
| Route edge highlight | **Client-side** | `graphUtils.isEdgeInRoute(from, to, routePath)` |
| Directions panel | **Derived from API** | `routeData.directions` (mapped from `response.data.instructions` in `routeService.js` line 35) |
| Distance display in directions | **Derived from API** | `routeData.distance` (mapped from `response.data.total_distance` in `routeService.js` line 36) |
| Estimated time display | **Derived from API** | `routeData.estimated_time` — intended to hold backend's `estimated_time` object; see §6 for mismatch |
| Floor switching | **Client-side** | Hardcoded floor list `['B', 0, 1, 2, 3]` in `FloorMap.jsx` line 184; state managed in `App.jsx` |
| History panel data | **Backend API** | `GET /api/history?limit=20&offset=0` via `authService.getHistory()` |
| Distance formatting (ft/mi) | **Client-side** | `DirectionsList.jsx` lines 8–13, `HistoryPanel.jsx` lines 52–57 — pure math |
| Relative timestamp formatting | **Client-side** | `HistoryPanel.jsx` lines 32–50 — computes diff from `new Date()` |
| Map pan | **Client-side** | SVG `viewBox` manipulation in `FloorMap.jsx` |
| Map zoom | **Client-side** | SVG `viewBox` + `zoom` state in `FloorMap.jsx` |
| `searchLocations()` | **Backend API** (defined, not used) | `GET /api/search` — exported from `routeService.js` but never called by any component |
| `findNearestFacility()` | **Backend API** (defined, not used) | `GET /api/nearest` — exported from `routeService.js` but never called by any component |
| `getFloors()` | **Backend API** (defined, not used) | `GET /api/floors` — exported from `routeService.js` but never called by any component |
| `buildGraph()` / `calculateNodePositions()` | **Client-side** (defined, not used) | `graphUtils.js` — exported but never imported by any component |

---

## 3. State Management Inventory

There is no global state library (no Redux, no Zustand, no Context). All state is component-local React `useState`. No React Context is used anywhere.

### 3.1 `App.jsx` — Root State

| State variable | Initial value | Holds | Written by | Read by |
|---|---|---|---|---|
| `selectedFloor` | `1` | Currently displayed floor number or `'B'` | `handleFloorChange`, route-success auto-switch (line 76) | `FloorMap`, `FloorSwitcher` (via FloorMap) |
| `startLocation` | `''` | Node ID string of start point | `LocationInput` onChange, map `onNodeClick`, `handleClearRoute`, `handleSelectRouteFromHistory` | `LocationInput`, `FloorMap`, `Sidebar`, `generateRoute()` |
| `destination` | `''` | Node ID string of destination | `LocationInput` onChange, map `onNodeClick`, `handleClearRoute`, `handleSelectRouteFromHistory` | `LocationInput`, `FloorMap`, `Sidebar`, `generateRoute()` |
| `preference` | `'no_preference'` | Selected transport preference string | `PreferenceToggle` onChange, `handleClearRoute`, `handleSelectRouteFromHistory` | `PreferenceToggle`, `generateRoute()` |
| `routeData` | `null` | Object `{ floors, directions, distance, path }` returned by `generateRoute()` | `handleGenerateRoute`, `handleClearRoute` | `FloorMap`, `DirectionsList`, `Sidebar` (`hasRoute`) |
| `loading` | `false` | Boolean — API call in flight | `handleGenerateRoute` | `Sidebar` (button disabled state + spinner) |
| `error` | `null` | Error message string or null | `handleGenerateRoute`, `handleClearRoute` | `Sidebar` (error display) |
| `rooms` | `[]` | Array of `{ id, name, floor, type }` from `getAllRooms()` | `loadRooms()` on mount | `LocationInput` (both instances) |
| `showDirections` | `false` | Boolean — whether `DirectionsList` is visible | `handleGenerateRoute` (→true), `handleClearRoute` (→false), DirectionsList onClose (→false) | Render gate in `App.jsx` line 161 |
| `user` | `null` | `{ username }` object or null | `handleAuthSuccess`, `handleLogout`, mount check | `Header` (conditional rendering) |
| `showAuthModal` | `false` | Boolean — whether `AuthModal` is mounted | `onLoginClick` (→true), `handleAuthSuccess` (→false), AuthModal onClose (→false) | Render gate in `App.jsx` line 173 |
| `showHistoryPanel` | `false` | Boolean — whether `HistoryPanel` is mounted | `onHistoryClick` (→true), `handleLogout` (→false), HistoryPanel onClose (→false), `handleSelectRouteFromHistory` (→false) | Render gate in `App.jsx` line 180 |

### 3.2 `FloorMap.jsx` — Local State

| State variable | Initial value | Holds | Written by | Read by |
|---|---|---|---|---|
| `positions` | `nodePositions` (imported JSON) | Static `{ [nodeId]: { x, y } }` map — never changes | (never reassigned) | SVG node and edge rendering |
| `viewBox` | `{x:0,y:0,w:1700,h:900}` | Current SVG viewport rectangle for pan/zoom | Pan handlers, zoom handlers, reset button | SVG `viewBox` attribute |
| `isPanning` | `false` | Whether mouse drag is in progress | `handleMouseDown`, `handleMouseUp`, `handleMouseLeave` | `handleMouseMove` guard |
| `panStart` | `{x:0,y:0}` | Last mouse position during pan gesture | `handleMouseDown`, `handleMouseMove` | `handleMouseMove` delta calculation |
| `zoom` | `1` | Current zoom scale factor (0.5–3) | Zoom buttons, scroll wheel handler | Zoom display label, viewBox calculation |

### 3.3 `Sidebar.jsx` — Local State

| State variable | Initial value | Holds | Written by | Read by |
|---|---|---|---|---|
| `isExpanded` | `true` | Sidebar expanded/collapsed toggle | Toggle button onClick | CSS class on `<aside>`, render gate for content |

### 3.4 `AuthModal.jsx` — Local State

| State variable | Initial value | Holds | Written by | Read by |
|---|---|---|---|---|
| `isLogin` | `true` | Boolean — login vs register mode | Toggle button onClick | Form rendering (password confirm field visibility), label text |
| `username` | `''` | Username field value | Input onChange | `login()` / `register()` call |
| `password` | `''` | Password field value | Input onChange | `login()` / `register()` call |
| `confirmPassword` | `''` | Confirm password field value (register only) | Input onChange, mode toggle (→`''`) | Client-side match validation |
| `error` | `''` | Error message string | `handleSubmit`, mode toggle (→`''`) | Error display `<div>` |
| `loading` | `false` | Boolean — API call in flight | `handleSubmit` | Button disabled state, button label |

### 3.5 `HistoryPanel.jsx` — Local State

| State variable | Initial value | Holds | Written by | Read by |
|---|---|---|---|---|
| `history` | `[]` | Array of history item objects from backend | `loadHistory()` | History list render |
| `loading` | `true` | Boolean — API call in flight | `loadHistory()` | Loading spinner visibility |
| `error` | `null` | Error message string or null | `loadHistory()` | Error display + Retry button |

### 3.6 `LocationInput.jsx` — Local State (two instances)

| State variable | Initial value | Holds | Written by | Read by |
|---|---|---|---|---|
| `searchTerm` | `''` | Current text in the search field | Input onChange, `handleSelect` (→`''`), `handleClear` (→`''`) | Filter logic, input `value` |
| `showDropdown` | `false` | Whether the option dropdown is visible | Input onFocus (→true), `handleSelect` (→false), click-outside handler (→false) | Dropdown render gate |
| `filteredRooms` | `[]` | Filtered subset of `rooms` matching `searchTerm` | `useEffect` on `[searchTerm, rooms]` | Dropdown option list |

### 3.7 Module-Level Globals

| Identifier | File | Holds |
|---|---|---|
| `api` (axios instance) | `frontend/src/services/api.js` line 3 | Singleton axios instance with `baseURL='/api'`, 10s timeout, and request/response interceptors |
| `TOKEN_KEY = 'auth_token'` | `frontend/src/services/authService.js` line 3 | localStorage key constant |
| `USER_KEY = 'auth_user'` | `frontend/src/services/authService.js` line 4 | localStorage key constant |

---

## 4. Browser Storage Inventory

| Storage type | Key | Set by | Removed by | Purpose |
|---|---|---|---|---|
| `localStorage` | `auth_token` | `authService.register()` line 29, `authService.login()` line 46 | `authService.logout()` line 58, `api.js` response interceptor on 401 (line 38) | Stores the JWT. Attached as `Authorization: Bearer <token>` to every API request via `api.js` interceptor (line 15). |
| `localStorage` | `auth_user` | `authService.register()` line 30, `authService.login()` line 47 | `authService.logout()` line 59, `api.js` response interceptor on 401 (line 39) | Stores serialized `{ username }` object. Read by `authService.getUser()` to restore user display name on page reload. |

No `sessionStorage` or `IndexedDB` usage exists anywhere in the frontend.

---

## 5. Suspected Frontend-Only Features

### 5.1 Client-Side Location Search / Filtering

**Description:** `LocationInput.jsx` filters the room list client-side (lines 15–19). A `searchLocations()` function exists in `routeService.js` (lines 86–104) that calls `GET /api/search`, but it is never imported or called by any component.

**Three interpretations:**
1. **Intentional client-side-only feature:** The room list is small enough to filter in memory after a one-time bulk fetch; client-side filtering was chosen for speed and simplicity, and should be kept.
2. **Legacy local implementation:** `searchLocations()` was built to replace the client-side filter but was never wired up; the client-side filter is a leftover.
3. **Frontend ahead of backend:** The backend `/search` endpoint with optional `floor` filtering is a more capable implementation; the frontend is using a simpler approach that will be migrated to call the search endpoint.

---

### 5.2 `findNearestFacility()` — Defined, Never Called

**Description:** `routeService.js` lines 109–130 define and export `findNearestFacility(fromNode, facilityType)` which calls `GET /api/nearest`. No component imports or calls it.

**Three interpretations:**
1. **Intentional client-side-only:** The nearest-facility feature is intentionally not exposed in the UI and the function is a utility kept for future use.
2. **Legacy implementation:** The function was part of an earlier feature that was removed from the UI but not from the service file.
3. **Frontend ahead of backend:** A "Find Nearest Restroom / Elevator" UI button was planned or is in development; the service layer is complete but the UI component has not been built yet.

---

### 5.3 `getFloors()` in `routeService.js` — Defined, Never Called

**Description:** `routeService.js` lines 135–148 define and export `getFloors()` which calls `GET /api/floors`. `FloorMap.jsx` hardcodes `availableFloors={['B', 0, 1, 2, 3]}` (line 184) and never calls this function.

**Three interpretations:**
1. **Intentional client-side-only:** The floor list is known and fixed; hardcoding avoids an extra startup API call.
2. **Legacy implementation:** `getFloors()` was used when the floor list was dynamic; the hardcoded list replaced it.
3. **Frontend ahead of backend:** The floor list was intended to be dynamic; `getFloors()` is ready but the component was never updated to call it.

---

### 5.4 `buildGraph()` and `calculateNodePositions()` in `graphUtils.js` — Defined, Never Called

**Description:** `graphUtils.js` exports `buildGraph()` (lines 4–26) and `calculateNodePositions()` (lines 31–111). Neither is imported by any component; the map uses the pre-computed `nodePositions.json` file instead.

**Three interpretations:**
1. **Intentional client-side-only (stable):** Position calculation was run once to produce `nodePositions.json`; the utilities are retained for documentation or potential re-computation but have no runtime role.
2. **Legacy implementation:** These functions were the original layout engine; they were superseded by the static `nodePositions.json` file and the functions are now dead code.
3. **Frontend ahead of backend:** The intent is to support dynamically added floors whose node positions would need to be computed at runtime; the functions are ready but not yet wired up.

---

### 5.5 Map Pan / Zoom

**Description:** Full pan-and-zoom SVG interaction (`FloorMap.jsx` lines 24–92, 188–213) is implemented entirely client-side with no backend involvement.

**Three interpretations:**
1. **Intentional client-side-only:** Map interaction (viewport control) is inherently a client-side concern; this is correct as-is.
2. **Legacy local implementation:** Not applicable — this is a pure UI concern.
3. **Frontend ahead of backend:** Not applicable.

---

## 6. Suspected Mismatches With Backend

> All backend expectations are sourced from `docs/BACKEND_API_INVENTORY.md`.

### 6.1 Auth Token Field Name — `access_token` vs `token`

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/src/services/authService.js` lines 26, 43 |
| **Frontend's call** | Reads `response.data.access_token` from both `POST /api/auth/register` and `POST /api/auth/login` responses |
| **Backend returns** | `{ token: "...", user: { id, username } }` — field is named `token`, not `access_token` |
| **Effect** | `access_token` is `undefined`; `localStorage.setItem('auth_token', undefined)` stores the string `"undefined"`; all subsequent requests send `Authorization: Bearer undefined`; the API interceptor will reject them as 401 |
| **Severity** | **Will-fail-immediately** — login and register appear to succeed on the network but authentication is silently broken |

---

### 6.2 Auth Username Extraction — Top-Level vs Nested

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/src/services/authService.js` lines 26–27, 43–44 |
| **Frontend's call** | Destructures `const { access_token, username: user } = response.data` — treats `username` as a top-level field |
| **Backend returns** | `{ token, user: { id, username } }` — username is nested inside a `user` object |
| **Effect** | `user` variable is `undefined`; `localStorage.setItem('auth_user', JSON.stringify({ username: undefined }))` stores `{"username":null}`; displayed username in the header will be blank/undefined |
| **Severity** | **Will-fail-immediately** — username never displays correctly in the header |

---

### 6.3 `generateRoute()` Reads Non-Existent `total_distance` — POST /route

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/src/services/routeService.js` line 36 |
| **Frontend's call** | `distance: data.total_distance` — expects a `total_distance` field in the POST /route response |
| **Backend returns** | `{ floors, instructions, estimated_time }` — no `total_distance` field (that field exists on `GET /nearest` only) |
| **Effect** | `routeData.distance` is always `undefined`; `DirectionsList` receives `distance={undefined}`; the "📏" summary line is never rendered (the `distance &&` guard is false) |
| **Severity** | **Will-misbehave** — distance display is always blank |

---

### 6.4 `generateRoute()` Does Not Forward `estimated_time`

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/src/services/routeService.js` lines 33–38 |
| **Frontend's call** | Returns `{ floors, directions, distance, path }` — `estimated_time` is not included |
| **Backend returns** | `{ floors, instructions, estimated_time: { total_seconds, display } }` |
| **Effect** | `App.jsx` line 165 passes `estimatedTime={routeData.estimated_time}` to `DirectionsList`, which is always `undefined`; the "⏱️" summary line is never rendered |
| **Severity** | **Will-misbehave** — estimated time is always blank in the directions panel |

---

### 6.5 History Items Read Non-Existent Fields — `item.origin`, `item.destination`, `item.timestamp`, `item.distance`

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/src/components/History/HistoryPanel.jsx` lines 107–109, 113, 128 |
| **Frontend reads** | `item.origin`, `item.destination`, `item.distance`, `item.timestamp`, `item.estimated_time` (direct property), `item.preference` |
| **Backend returns** | `{ id, start_node, destination_node, preference, created_at, result: { floors, instructions, estimated_time } }` |
| **Specific mismatches** | (a) `item.origin` → should be `item.start_node`; (b) `item.destination` → should be `item.destination_node`; (c) `item.timestamp` → should be `item.created_at`; (d) `item.distance` → does not exist at any level of the history record; (e) `item.estimated_time` → should be `item.result.estimated_time` |
| **Effect** | Every field in each history card renders as empty/undefined. "Just now" is always shown for timestamps (because `new Date(undefined)` is an invalid date, the diff computations produce `NaN`). The "Retry" button + empty-state message is never shown because the data _does_ load — it's just all undefined |
| **Severity** | **Will-fail-immediately** — history panel loads but shows entirely blank cards |

---

### 6.6 `handleSelectRouteFromHistory` Uses `route.origin` / `route.destination`

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/src/components/History/HistoryPanel.jsx` line 61 and `frontend/src/App.jsx` lines 113–118 |
| **Frontend's call** | `onSelectRoute(route.origin, route.destination, route.preference)` |
| **Backend field names** | `start_node`, `destination_node` |
| **Effect** | Pre-filling start/destination from a history entry always populates them with `undefined`, so the form fields appear empty |
| **Severity** | **Will-fail-immediately** — selecting a history entry does not restore the route |

---

### 6.7 Floor Key Parsed as Integer — Fails for Basement

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/src/App.jsx` line 76 |
| **Frontend's call** | `parseInt(Object.keys(route.floors)[0])` — converts the first floor key to an integer to call `setSelectedFloor` |
| **Backend returns** | Floor keys as strings (e.g. `"1"`, `"2"`, `"B"`) |
| **Effect** | `parseInt("B")` returns `NaN`; `setSelectedFloor(NaN)` is called; floor tab matching (`currentFloor === floorNum`) fails for all tabs; the map does not switch floors for basement-starting routes |
| **Severity** | **Will-misbehave** — auto floor-switch broken for routes that start on the basement floor |

---

### 6.8 Vite Dev Proxy — `/api` Prefix Rewrite (Not a Runtime Mismatch)

| Item | Detail |
|---|---|
| **Frontend file** | `frontend/vite.config.js` lines 8–13; `frontend/src/services/api.js` line 4 |
| **Frontend's call** | All requests go to `baseURL='/api'` (e.g. `/api/route`, `/api/floors`) |
| **Backend mounts** | Routes at `/route`, `/floors`, `/auth`, `/nearest`, `/search`, `/history` (no `/api` prefix) |
| **Resolution** | `vite.config.js` configures a dev proxy: `/api` → `http://localhost:8000`, stripping the `/api` prefix. This works **in development only**. In a production deployment without the same proxy configuration, all API calls would 404 |
| **Severity** | **Cosmetic** in dev; **Will-fail-immediately** in production without a matching reverse-proxy rule |

---

### 6.9 Distance Formatting Treats Pixel Units as Feet

| Item | Detail |
|---|---|
| **Frontend files** | `frontend/src/components/RouteDisplay/DirectionsList.jsx` lines 8–13; `frontend/src/components/History/HistoryPanel.jsx` lines 52–57 |
| **Frontend's call** | Divides `dist` by 5280 to convert "feet" to miles |
| **Backend reality** | Edge weights (and any distance field) are in SVG **pixel units** (canvas coordinates), not feet |
| **Effect** | Values would display as, e.g., "840 ft" or "0.16 mi" which have no real-world meaning. (Currently moot because `distance` is `undefined` per §6.3, but would apply if fixed.) |
| **Severity** | **Will-misbehave** — units label is semantically incorrect |

---

## 7. Frontend Dependencies

| Package | Version | What it implies |
|---|---|---|
| `react` | `^18.2.0` | Core React framework. All UI is component-based with hooks (`useState`, `useEffect`, `useRef`). |
| `react-dom` | `^18.2.0` | React DOM renderer for browsers. Implies a single-page application mounted via `ReactDOM.createRoot()`. |
| `axios` | `^1.6.0` | HTTP client with interceptors. Used in `api.js` to attach JWT tokens and handle error codes centrally. Implies no `fetch` API is used directly. |
| `vite` | `^5.0.8` (dev) | Build tool / dev server with HMR. The dev proxy (`/api` → `localhost:8000`) is configured here. |
| `@vitejs/plugin-react` | `^4.2.1` (dev) | Vite plugin for React JSX transformation and fast-refresh. |

**Absent dependencies worth noting:**

| Missing package | Implication |
|---|---|
| No `react-router-dom` | There is **no client-side routing**. The entire app is a single page; there are no URL-based routes. Modals and panels are shown/hidden via state. |
| No `leaflet` / `mapbox-gl` / `@vis.gl/react-map-gl` | There is **no third-party map library**. The map is a hand-rolled SVG with a static PNG background. |
| No `zustand` / `redux` / `jotai` / React Context | There is **no shared state management library**. All state is local `useState` in `App.jsx`, passed down as props. |
| No `socket.io-client` / WebSocket library | There is **no real-time communication**. All data is fetched on demand via REST. |
| No testing library (`vitest`, `jest`, `@testing-library/react`) | No automated tests are configured in `package.json`. |
