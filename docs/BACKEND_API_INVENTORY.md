# Backend API Inventory

> **Base URL:** `http://localhost:8000` (default port `8000`, overridable via `PORT` env var)  
> **Content-Type:** All request/response bodies are `application/json`.  
> **Global error – malformed JSON body:** Any endpoint that receives a syntactically invalid JSON body returns `422 { "detail": "Request body is malformed JSON" }` before route handlers run.  
> **Global error – unhandled exception:** Any uncaught error bubbles to a final middleware that returns `500 { "detail": "Internal server error" }`.

> All example payloads use representative IDs and shapes verified against the real data files and service code. See BACKEND_DATA_MODEL.md for the canonical schema definitions.

---

## Auth Middleware Reference

Two middleware functions are used to protect routes:

| Middleware | Behaviour |
|---|---|
| `requireAuth` | Reads `Authorization: Bearer <token>`. Returns **401** if the header is absent, malformed, or the token is invalid/expired. Sets `req.user = { user_id, username }` on success. |
| `optionalAuth` | Same token parsing but **never returns 401**. Sets `req.user` if the token is valid; skips silently otherwise. |

---

## 1. Health Check

### `GET /health`

Returns the liveness status of the service. Never requires authentication.

#### Auth
None

#### Request
No parameters, no body.

#### Success Response — `200 OK`

```json
{
  "status": "ok",
  "service": "km-nav-backend"
}
```

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

## 2. Authentication Routes (`/auth`)

### 2.1 `POST /auth/register`

Creates a new user account and returns a signed JWT.

#### Auth
None (public endpoint)

#### Request Body

| Field | Type | Required | Constraints |
|---|---|---|---|
| `username` | `string` | ✅ Required | 3–32 characters (after trimming whitespace) |
| `password` | `string` | ✅ Required | Minimum 8 characters |

**Example:**
```json
{
  "username": "alice",
  "password": "supersecret123"
}
```

#### Success Response — `201 Created`

| Field | Type | Description |
|---|---|---|
| `token` | `string` | Signed JWT for use in subsequent `Authorization: Bearer` headers |
| `user.id` | `integer` | Newly created user's database ID |
| `user.username` | `string` | Trimmed username as stored |

```json
{
  "token": "<jwt>",
  "user": { "id": 1, "username": "alice" }
}
```

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `400` | `username` is missing, null, not a string, or empty string | `{ "detail": "Missing required field: username" }` |
| `400` | `password` is missing, null, or not a string | `{ "detail": "Missing required field: password" }` |
| `400` | `username` (trimmed) is fewer than 3 or more than 32 characters | `{ "detail": "Username must be between 3 and 32 characters" }` |
| `400` | `password` is fewer than 8 characters | `{ "detail": "Password must be at least 8 characters" }` |
| `409` | `username` already exists (pre-check or SQLite UNIQUE constraint race) | `{ "detail": "Username already exists" }` |
| `422` | Request body is malformed JSON | `{ "detail": "Request body is malformed JSON" }` |
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

### 2.2 `POST /auth/login`

Authenticates an existing user and returns a signed JWT.

#### Auth
None (public endpoint)

#### Request Body

| Field | Type | Required | Constraints |
|---|---|---|---|
| `username` | `string` | ✅ Required | Must be a non-empty string |
| `password` | `string` | ✅ Required | Must be a string |

**Example:**
```json
{
  "username": "alice",
  "password": "supersecret123"
}
```

#### Success Response — `200 OK`

| Field | Type | Description |
|---|---|---|
| `token` | `string` | Signed JWT |
| `user.id` | `integer` | User's database ID |
| `user.username` | `string` | Username as stored |

```json
{
  "token": "<jwt>",
  "user": { "id": 1, "username": "alice" }
}
```

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `400` | `username` is missing, null, not a string, or empty string | `{ "detail": "Missing required field: username" }` |
| `400` | `password` is missing, null, or not a string | `{ "detail": "Missing required field: password" }` |
| `401` | Username not found in the database | `{ "detail": "Invalid username or password" }` |
| `401` | Password does not match the stored hash | `{ "detail": "Invalid username or password" }` |
| `422` | Request body is malformed JSON | `{ "detail": "Request body is malformed JSON" }` |
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

## 3. Floor Routes (`/floors`)

### 3.1 `GET /floors`

Returns the list of all available floor identifiers.

#### Auth
None

#### Request
No parameters, no body.

#### Success Response — `200 OK`

An array of floor identifiers (strings or numbers, as stored in the graph).

```json
["B", "0", "1", "2", "3"]
```

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

### 3.2 `GET /floors/:id`

Returns the full map data (nodes and edges) for the specified floor.

#### Auth
None

#### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ Required | Floor identifier (e.g. `0`, `1`, `B`) |

#### Success Response — `200 OK`

| Field | Type | Description |
|---|---|---|
| `floor` | `string` | The floor identifier echoed back |
| `nodes` | `array` | Array of node objects for this floor |
| `edges` | `array` | Array of edge objects for this floor |

```json
{
  "floor": "1",
  "nodes": [
    { "node_id": "R101", "label": "Room 101", "type": "room", "floor": 1, "x": -771.5, "y": -414.5 }
  ],
  "edges": [
    { "from_node": "H103", "to_node": "R101", "distance": 301.8 }
  ]
}
```

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `404` | No data exists for the requested floor ID | `{ "detail": "Floor <id> has no data" }` |
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

## 4. Route (`/route`)

### 4.1 `POST /route`

Computes the shortest path between two nodes using Dijkstra's algorithm. If the caller is authenticated, the resolved route is persisted to route history automatically.

#### Auth
`optionalAuth` — authentication is **not required** but if a valid `Authorization: Bearer <token>` header is present, the route is saved to the user's history.

#### Request Body

| Field | Type | Required | Constraints |
|---|---|---|---|
| `start` | `string` | ✅ Required | A valid node ID present in the graph |
| `destination` | `string` | ✅ Required | A valid node ID present in the graph |
| `preference` | `string` | ❌ Optional (default: `"none"`) | One of `"none"`, `"stairs"`, `"elevator"` |

**Preference semantics (cross-floor routes only):**
- `"none"` — use the full global graph (stairs and elevators both available)
- `"stairs"` — cross-floor elevator edges are removed; only stairwells bridge floors
- `"elevator"` — cross-floor stair edges are removed; only elevators bridge floors

**Example:**
```json
{
  "start": "R101",
  "destination": "R205",
  "preference": "elevator"
}
```

#### Success Response — `200 OK`

| Field | Type | Description |
|---|---|---|
| `floors` | `object` | Map of floor ID (string) → ordered array of node IDs traversed on that floor |
| `instructions` | `array` | Ordered array of human-readable navigation instruction strings |
| `estimated_time` | `number` / `object` | Estimated walking time (structure defined by `timeEstimate` service) |

```json
{
  "floors": {
    "1": ["R101", "H103", "H101", "J101", "H106", "E101"],
    "2": ["E201", "H207", "H208", "H205", "R205"]
  },
  "instructions": [
    "Start at Room 101",
    "Walk through hallway H103",
    "Walk through hallway H101",
    "Continue past Junction J101",
    "Walk through hallway H106",
    "Take Elevator 1 from Floor 1 to Floor 2",
    "Walk through hallway H207",
    "Walk through hallway H208",
    "Walk through hallway H205",
    "Arrive at Room 205"
  ],
  "estimated_time": { "total_seconds": 118, "display": "About 2 minutes" }
}
```

> **Note:** When the authenticated user's route is saved, a failure to persist it is logged to stderr but **does not** cause the response to fail — the route result is still returned normally.

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `400` | `start` field is missing or falsy | `{ "detail": "Missing required field: start" }` |
| `400` | `destination` field is missing or falsy | `{ "detail": "Missing required field: destination" }` |
| `400` | `preference` is not one of `none`, `stairs`, `elevator` | `{ "detail": "Invalid preference: must be one of none, stairs, elevator" }` |
| `401` | Token present but invalid or expired (only when token is supplied) | `{ "detail": "Authentication required" }` — *Note: optionalAuth does not 401; this code is not emitted by this route* |
| `404` | `start` node ID does not exist in the graph | `{ "detail": "Node <start> does not exist" }` |
| `404` | `destination` node ID does not exist in the graph | `{ "detail": "Node <destination> does not exist" }` |
| `404` | The floor data for the shared floor cannot be found (same-floor routes) | `{ "detail": "Floor <floor> has no data" }` |
| `404` | No path exists between `start` and `destination` in the chosen graph | `{ "detail": "No path found from <start> to <destination>" }` |
| `422` | Request body is malformed JSON | `{ "detail": "Request body is malformed JSON" }` |
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

## 5. Search (`/search`)

### 5.1 `GET /search`

Full-text keyword search over node IDs and labels across all floors (or a single specified floor).

#### Auth
None

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | `string` | ✅ Required | Search keyword. Matched case-insensitively as a substring against `node_id` and `label`. Must be non-empty after trimming. |
| `floor` | `string` | ❌ Optional | If provided, restricts search to only this floor. If omitted, all floors are searched. |

**Example:**
```
GET /search?q=restroom&floor=2
```

#### Success Response — `200 OK`

An array of matching node objects (may be empty).

| Field | Type | Description |
|---|---|---|
| `node_id` | `string` | Node identifier |
| `label` | `string` | Human-readable node label |
| `type` | `string` | Node type (e.g. `room`, `stairs`, `elevator`, `mens_restroom`, etc.) |
| `floor` | `string` / `number` | Floor the node belongs to |

```json
[
  { "node_id": "M201", "label": "Men's Restroom 1", "type": "mens_restroom", "floor": 2 },
  { "node_id": "W201", "label": "Women's Restroom 1", "type": "womens_restroom", "floor": 2 }
]
```

> An empty array `[]` is returned when no nodes match — this is **not** an error.

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `400` | `q` parameter is missing, null, or an empty/whitespace-only string | `{ "detail": "Missing required parameter: q" }` |
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

## 6. Nearest Facility (`/nearest`)

### 6.1 `GET /nearest`

Finds the nearest facility of a given type to a starting node, computing the shortest path across all floors using Dijkstra's algorithm.

#### Auth
None

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `from_node` | `string` | ✅ Required | Node ID to start from |
| `type` | `string` | ✅ Required | Facility type to find. Must be one of: `stairs`, `elevator`, `mens_restroom`, `womens_restroom`, `all_gender_restroom` |

**Example:**
```
GET /nearest?from_node=R101&type=elevator
```

#### Success Response — `200 OK`

| Field | Type | Description |
|---|---|---|
| `target_node` | `string` | Node ID of the nearest matching facility |
| `target_label` | `string` | Human-readable label of the facility node |
| `total_distance` | `number` | Total shortest-path distance (in graph weight units) to the facility |
| `floors` | `object` | Map of floor ID (string) → ordered array of node IDs traversed on that floor |
| `instructions` | `array` | Ordered array of human-readable navigation instruction strings |

```json
{
  "target_node": "E101",
  "target_label": "Elevator 1 Floor 1",
  "total_distance": 840.3,
  "floors": {
    "1": ["R101", "H103", "H101", "J101", "H106", "E101"]
  },
  "instructions": [
    "Start at Room 101",
    "Walk through hallway H103",
    "Walk through hallway H101",
    "Continue past Junction J101",
    "Walk through hallway H106",
    "Arrive at Elevator 1 Floor 1"
  ]
}
```

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `400` | `from_node` parameter is missing or falsy | `{ "detail": "Missing required parameter: from_node" }` |
| `400` | `type` parameter is missing or falsy | `{ "detail": "Missing required parameter: type" }` |
| `400` | `type` is not one of the five allowed values | `{ "detail": "Invalid type: must be one of stairs, elevator, mens_restroom, womens_restroom, all_gender_restroom" }` |
| `404` | `from_node` ID does not exist in the graph | `{ "detail": "Node <from_node> does not exist" }` |
| `404` | No nodes of the requested type exist anywhere in the graph | `{ "detail": "No facilities of type <type> found" }` |
| `404` | Nodes of that type exist but are all unreachable from `from_node` (graph is disconnected) | `{ "detail": "No facilities of type <type> found" }` |
| `404` | Path reconstruction failed (no reachable best candidate) | `{ "detail": "No facilities of type <type> found" }` |
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

## 7. History (`/history`)

### 7.1 `GET /history`

Returns the authenticated user's saved route history, ordered newest-first.

#### Auth
`requireAuth` — **required**. Must supply `Authorization: Bearer <token>` with a valid, non-expired JWT.

#### Query Parameters

| Parameter | Type | Required | Constraints | Default |
|---|---|---|---|---|
| `limit` | `integer` | ❌ Optional | Integer between 1 and 100 (inclusive) | `50` |
| `offset` | `integer` | ❌ Optional | Non-negative integer | `0` |

**Example:**
```
GET /history?limit=10&offset=20
Authorization: Bearer <token>
```

#### Success Response — `200 OK`

An array of saved route objects (may be empty). Each item is returned by `listUserRoutes()` in `history.js` and includes the fields `id`, `start_node`, `destination_node`, `preference`, `created_at`, and `result` (the full deserialized route payload). Note: `user_id` is **not** included in the returned objects.

```json
[
  {
    "id": 42,
    "start_node": "R101",
    "destination_node": "R205",
    "preference": "elevator",
    "created_at": "2026-04-27 21:00:00",
    "result": {
      "floors": {
        "1": ["R101", "H103", "H101", "J101", "H106", "E101"],
        "2": ["E201", "H207", "H208", "H205", "R205"]
      },
      "instructions": [
        "Start at Room 101",
        "Walk through hallway H103",
        "Walk through hallway H101",
        "Continue past Junction J101",
        "Walk through hallway H106",
        "Take Elevator 1 from Floor 1 to Floor 2",
        "Walk through hallway H207",
        "Walk through hallway H208",
        "Walk through hallway H205",
        "Arrive at Room 205"
      ],
      "estimated_time": { "total_seconds": 118, "display": "About 2 minutes" }
    }
  }
]
```

#### Error Responses

| HTTP Status | Condition | Body |
|---|---|---|
| `400` | `limit` is present but not an integer between 1 and 100 | `{ "detail": "Invalid limit: must be an integer between 1 and 100" }` |
| `400` | `offset` is present but not a non-negative integer | `{ "detail": "Invalid offset: must be a non-negative integer" }` |
| `401` | `Authorization` header is absent, malformed, or token is invalid/expired | `{ "detail": "Authentication required" }` |
| `500` | Unhandled exception | `{ "detail": "Internal server error" }` |

---

## Summary Table

| # | Method | Path | Auth Required | Brief Description |
|---|---|---|---|---|
| 1 | `GET` | `/health` | No | Service liveness check |
| 2 | `POST` | `/auth/register` | No | Create a new user account |
| 3 | `POST` | `/auth/login` | No | Authenticate and receive a JWT |
| 4 | `GET` | `/floors` | No | List all available floor IDs |
| 5 | `GET` | `/floors/:id` | No | Get nodes & edges for a specific floor |
| 6 | `POST` | `/route` | Optional (`optionalAuth`) | Compute shortest path; saves to history if authenticated |
| 7 | `GET` | `/search` | No | Search nodes by keyword, optionally filtered by floor |
| 8 | `GET` | `/nearest` | No | Find nearest facility of a given type from a starting node |
| 9 | `GET` | `/history` | **Yes** (`requireAuth`) | Retrieve the authenticated user's route history |
