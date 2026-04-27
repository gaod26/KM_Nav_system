# Backend Data Model

> This document describes every internal data structure used by the KM Nav backend, from the raw JSON files on disk through in-memory graph representations, the Dijkstra algorithms, instruction generation, time estimation, and the SQLite persistence layer.

---

## Table of Contents

1. [Node Schema (`combined_nodes.json`)](#1-node-schema)
2. [Edge Schema (`combined_edges.json`)](#2-edge-schema)
3. [Graph Store — Loading & Caching](#3-graph-store--loading--caching)
4. [Dijkstra Implementation — Inputs & Outputs](#4-dijkstra-implementation--inputs--outputs)
5. [Instruction Generation (`instructions.js`)](#5-instruction-generation)
6. [Time Estimation (`timeEstimate.js`)](#6-time-estimation)
7. [History Persistence — Database & Fields](#7-history-persistence)

---

## 1. Node Schema

**File:** `backend/src/data/combined_nodes.json`  
**Top-level type:** JSON array of node objects.

### 1.1 Field Reference

| Field | JSON type | Required | Description |
|---|---|---|---|
| `node_id` | `string` | ✅ | Unique identifier for the node. See §1.2 for ID conventions. |
| `label` | `string` | ✅ | Human-readable display name (e.g. `"Room 101"`, `"Elevator 1 Floor 2"`). Placeholder nodes that have no real label use `"---"`. |
| `type` | `string` | ✅ | Semantic category. See §1.3 for allowed values. |
| `floor` | `number` | ✅ | Floor identifier stored as a **JSON number** (integers `0`, `1`, `2`, `3`) or the string `"B"` for the basement. At runtime graphStore coerces all floor keys to strings for map lookups. |
| `x` | `number` | ✅ | Horizontal canvas coordinate (pixels, SVG space). Can be negative. |
| `y` | `number` | ✅ | Vertical canvas coordinate (pixels, SVG space). Can be negative. |

There are **no optional or boolean flag fields** in the raw JSON. No `accessible`, `is_destination`, or similar flags appear.

### 1.2 Node ID Conventions

Node IDs are **not namespaced by floor** in the raw file; uniqueness is guaranteed across the whole data set. The prefix letter(s) encode both the node type and the floor:

| Prefix pattern | Type | Example IDs |
|---|---|---|
| `R<floor><number>` | `room` | `R101`, `R201`, `R001`, `R001A`, `R204B` |
| `H<floor><number>` | `hallway` | `H101`, `H201`, `H001`, `HB01` |
| `J<floor><number>` | `junction` | `J101`, `J102` |
| `S<floor><number>` | `stairs` | `S101`, `S201`, `S001`, `SB01` |
| `E<floor><number>` | `elevator` | `E101`, `E201`, `E001` |
| `M<floor><number>` | `mens_restroom` | `M101`, `M201`, `MB01` |
| `W<floor><number>` | `womens_restroom` | `W101`, `W201`, `WB01` |
| `O<floor><number>` | `other` | `O101`, `O201`, `O001` |

Floor digits encode the floor: `0` → floor 0, `1` → floor 1, `2` → floor 2, `3` → floor 3, `B` → basement.  
Sub-rooms append an uppercase letter suffix: `R001A`, `R127A`, `R204B`, etc.

### 1.3 Node Types

| `type` value (raw JSON) | Meaning | Normalized at runtime |
|---|---|---|
| `"room"` | Classrooms, offices, labs | `"room"` |
| `"hallway"` | Hallway intermediate node | `"hallway"` |
| `"junction"` | Hallway intersection / decision point | `"junction"` |
| `"stairs"` | Stairwell entry on one floor | `"stairs"` |
| `"elevator"` | Elevator landing on one floor | `"elevator"` |
| `"mens_restroom"` | Men's restroom | `"mens_restroom"` |
| `"Men's Restroom"` (variant) | Same facility | normalized → `"mens_restroom"` |
| `"womens_restroom"` | Women's restroom | `"womens_restroom"` |
| `"Women's Restroom"` (variant) | Same facility | normalized → `"womens_restroom"` |
| `"all_gender_restroom"` | All-gender restroom | `"all_gender_restroom"` |
| `"other"` | Unlabelled functional space | `"other"` |

`graphStore.normalizeType()` lower-cases the value, trim-strips whitespace, and maps known aliases to canonical underscore forms:

```js
// graphStore.js lines 4-25
function normalizeType(type) {
  if (!type) return type;
  const t = String(type).trim().toLowerCase();
  if (t === "men's restroom" || t === "mens restroom" || t === "men restroom") {
    return "mens_restroom";
  }
  if (t === "women's restroom" || ...) { return "womens_restroom"; }
  if (t === "all-gender restroom" || ...) { return "all_gender_restroom"; }
  return t.replace(/\s+/g, "_");
}
```

### 1.4 Representative Samples

```json
// Hallway node — floor 1
{ "node_id": "H101", "label": "Hallway Node 1", "type": "hallway", "floor": 1, "x": -754, "y": 4.5 }

// Stairwell — floor 1 (has a matching S201 on floor 2)
{ "node_id": "S101", "label": "Stairwell 1 Floor 1", "type": "stairs", "floor": 1, "x": -478, "y": -297 }

// Elevator — floor 2
{ "node_id": "E201", "label": "Elevator 1 Floor 2", "type": "elevator", "floor": 2, "x": -464.5, "y": 83 }

// Room with alpha suffix — floor 0
{ "node_id": "R001A", "label": "Room 001A", "type": "room", "floor": 0, "x": -642, "y": -366 }

// Placeholder "other" node
{ "node_id": "O101", "label": "---", "type": "other", "floor": 1, "x": -536, "y": 99.5 }

// Basement hallway — prefix HB
{ "node_id": "HB02", "label": "...", "type": "hallway", "floor": "B", ... }
```

---

## 2. Edge Schema

**File:** `backend/src/data/combined_edges.json`  
**Top-level type:** JSON array of edge objects.

### 2.1 Field Reference (raw JSON)

| Field | JSON type | Required | Description |
|---|---|---|---|
| `from` | `string` | ✅ | Source node ID. |
| `to` | `string` | ✅ | Destination node ID. |
| `distance` | `number` | ✅ | Edge weight in **pixel units** (Euclidean distance on the SVG canvas). Always a non-negative float. |

There are **no explicit cross-floor flag, `transport_type`, or `direction` fields** in the raw JSON. Cross-floor identity is inferred at load time by comparing the `floor` values of both endpoint nodes.

### 2.2 Edges Are Undirected

`graphStore` converts every raw edge into **two directed adjacency entries** — one in each direction — so the graph is effectively undirected:

```js
// graphStore.js lines 68-71
for (const e of edgesNormalized) {
  ensureGlobal(e.from_node).push({ to: e.to_node, weight: e.distance });
  ensureGlobal(e.to_node).push({ to: e.from_node, weight: e.distance });
}
```

### 2.3 Same-floor vs. Cross-floor Edges

Cross-floor connectivity is created by stair and elevator node pairs that share the same numeric ID stem but differ by floor suffix. The edge between those pairs has `"distance": 0`, meaning the floor-change itself costs nothing in graph weight units (the time cost is added separately by `timeEstimate.js`).

**Same-floor edge (weight > 0):**
```json
{ "from": "H101", "to": "J101", "distance": 144 }
```

**Cross-floor stair edge (weight = 0):**
```json
{ "from": "S101", "to": "S201", "distance": 0 }
{ "from": "S001", "to": "S101", "distance": 0 }
```

**Cross-floor elevator edge (weight = 0):**
```json
{ "from": "E101", "to": "E201", "distance": 0 }
{ "from": "E001", "to": "E101", "distance": 0 }
```

### 2.4 Runtime Edge Representation

After `graphStore` normalizes the file, each raw edge is represented as:

```js
// graphStore.js lines 36-40
const edgesNormalized = allEdgesRaw.map((e) => ({
  from_node: e.from,   // renamed: "from" → "from_node"
  to_node:   e.to,     // renamed: "to"   → "to_node"
  distance:  e.distance,
}));
```

Within adjacency maps the entries are further reduced to `{ to: string, weight: number }` neighbor descriptors.

---

## 3. Graph Store — Loading & Caching

**File:** `backend/src/services/graphStore.js`

The module performs all graph construction **synchronously at process start** via Node's `require()` cache. No lazy loading occurs; every floor's data is ready before the first HTTP request is served.

### 3.1 Build Pipeline (7 Steps)

```
combined_nodes.json  ──► Step 1: normalize types, build globalNodeById Map
combined_edges.json  ──► Step 2: rename from/to fields
                         Step 3: split edges into per-floor buckets
                         Step 4: build globalAdjacency (all edges, both directions)
                         Step 5: group nodes by floor
                         Step 6: build per-floor { nodes, edges, nodeById, adjacency }
                         Step 7: populate FLOOR_DATA[floorNumber]
```

#### Step 1 — Normalize nodes, build `globalNodeById`
```js
// lines 28-33
const globalNodeById = new Map();      // Map<nodeId:string, normalizedNode>
const nodesNormalized = allNodesRaw.map((n) => {
  const normalized = { ...n, type: normalizeType(n.type) };
  globalNodeById.set(normalized.node_id, normalized);
  return normalized;
});
```

#### Step 2 — Rename edge fields
```js
// lines 36-40
const edgesNormalized = allEdgesRaw.map((e) => ({
  from_node: e.from, to_node: e.to, distance: e.distance,
}));
```

#### Step 3 — Split into per-floor buckets
```js
// lines 43-60 (summary)
// An edge goes into floorEdgesMap[floor] only when BOTH endpoints share the
// same floor; cross-floor edges are intentionally omitted from per-floor buckets.
```

#### Step 4 — Build `globalAdjacency` (bidirectional, all edges)
```js
// lines 62-71
// globalAdjacency: Map<nodeId, Array<{ to: string, weight: number }>>
// Contains EVERY edge (same-floor + cross-floor), in both directions.
```

#### Steps 5–7 — Per-floor structures
For each discovered floor, `buildFloor()` produces:

```js
// lines 82-105
{
  floor:     <floorNumber>,           // as stored in nodes (number or "B")
  nodes:     [ ...normalizedNode ],   // all nodes for this floor
  edges:     [ ...normalizedEdge ],   // same-floor edges only
  nodeById:  Map<nodeId, node>,       // per-floor lookup
  adjacency: Map<nodeId, [{ to, weight }]>,  // per-floor, bidirectional
}
```

### 3.2 Floor Ordering

`listFloors()` returns floor keys sorted by a hand-coded priority map: `B = -1`, `0 = 0`, `1 = 1`, `2 = 2`, `3 = 3`. Unknown floors sort last (priority `99`).

### 3.3 Public API

| Function | Returns | Description |
|---|---|---|
| `listFloors()` | `string[]` | Ordered array of all floor identifiers. |
| `getFloor(id)` | floor object or `null` | Per-floor `{ floor, nodes, edges, nodeById, adjacency }`. Coerces `id` to string. |
| `getNode(nodeId)` | normalized node or `null` | Lookup in `globalNodeById`. |
| `getGlobalAdjacency()` | `Map<nodeId, [{to,weight}]>` | The full cross-floor bidirectional adjacency map. |
| `getGlobalNodeById()` | `Map<nodeId, node>` | The full cross-floor node lookup map. |

---

## 4. Dijkstra Implementation — Inputs & Outputs

**File:** `backend/src/services/dijkstra.js`

Three functions are exported; all implement a simple O(V² + E) scan-based Dijkstra (no priority queue). This is appropriate for the current graph size (~50–500 nodes per floor, a few hundred globally).

### 4.1 `dijkstraShortestPath({ adjacency, start, goal })`

#### Input

| Parameter | Type | Description |
|---|---|---|
| `adjacency` | `Map<string, Array<{to:string, weight:number}>>` | Bidirectional adjacency map. May be a per-floor map or the global map. |
| `start` | `string` | Source node ID. |
| `goal` | `string` | Destination node ID. |

#### Output

| Case | Return value |
|---|---|
| `start === goal` | `{ path: [start], distance: 0 }` |
| Path found | `{ path: string[], distance: number }` — `path` is an **ordered array of node IDs** from `start` to `goal` inclusive; `distance` is the total cumulative edge weight (pixel units, float). |
| No path exists (disconnected graph) | `null` |

**The return value contains raw node IDs only — not full node objects and no edge metadata.**

```js
// lines 1-2, 50
function dijkstraShortestPath({ adjacency, start, goal }) {
  if (start === goal) return { path: [start], distance: 0 };
  ...
  return { path, distance: total };
}
```

### 4.2 `dijkstraAllDistances({ adjacency, start })`

Used exclusively by `/nearest` to find the closest facility of a requested type in one pass.

#### Input

| Parameter | Type | Description |
|---|---|---|
| `adjacency` | `Map<string, Array<{to,weight}>>` | Always the global adjacency map for `/nearest`. |
| `start` | `string` | Source node ID. |

#### Output

```js
{ dist: Map<nodeId, number>, prev: Map<nodeId, nodeId> }
```

| Field | Type | Description |
|---|---|---|
| `dist` | `Map<string, number>` | Shortest distance from `start` to every reachable node. Nodes not reachable have **no entry** (not `Infinity`). |
| `prev` | `Map<string, string>` | Predecessor map for path reconstruction. |

### 4.3 `reconstructPath({ prev, start, goal })`

Walks the `prev` map backwards from `goal` to `start` and reverses to produce a forward path. Returns an **ordered array of node IDs** or `null` if `goal` is unreachable.

---

## 5. Instruction Generation

**File:** `backend/src/services/instructions.js`

### 5.1 Function Signature

```js
buildInstructionsForPath({ path, nodeById })
// Returns: string[]
```

| Parameter | Type | Description |
|---|---|---|
| `path` | `string[]` | Ordered array of node IDs (output of a Dijkstra function). |
| `nodeById` | `Map<string, node>` | Always `getGlobalNodeById()` — needed for label lookups. |

### 5.2 Algorithm

The function iterates `path` linearly and builds one instruction string per waypoint. Display names use `node.label` if set; otherwise fall back to `node.node_id`.

| Position in path | Node type | Instruction template |
|---|---|---|
| First node (index 0) | Any | `"Start at <label>"` |
| Last node | Any | `"Arrive at <label>"` |
| Intermediate — `hallway` | hallway | `"Walk through hallway <id>"` |
| Intermediate — `junction` | junction | `"Continue past Junction <id>"` |
| Intermediate — `room` | room | `"Pass <label>"` |
| Intermediate — `elevator` or `stairs`, floor changes | transition | `"Take <cleanLabel> from <floorName> to <floorName>"` — **also advances `i` by 1** to skip the landing node on the next floor |
| Intermediate — `elevator` or `stairs`, same floor | no transition | `"Continue toward <label>"` |
| Intermediate — any other type | other/unknown | `"Continue past <id>"` |

**Floor transition — key code snippet:**
```js
// instructions.js lines 68-73
if (nextNode && node && node.floor !== nextNode.floor) {
  const cleanLabel = (node.label || node.node_id).replace(/\s+Floor\s+\d+$/i, "");
  instructions.push(
    `Take ${cleanLabel} from ${floorDisplayName(node.floor)} to ${floorDisplayName(nextNode.floor)}`
  );
  i++; // skip the arriving stairs/elevator node on the next floor
}
```

The `cleanLabel` strip removes the `"Floor N"` suffix from stair/elevator labels (e.g. `"Stairwell 1 Floor 1"` → `"Stairwell 1"`).

### 5.3 Floor Display Names

| `floor` value | Display string |
|---|---|
| `"B"` | `"Basement"` |
| `"0"` | `"Ground Floor"` |
| `"1"`, `"2"`, `"3"`, … | `"Floor 1"`, `"Floor 2"`, `"Floor 3"`, … |

### 5.4 Output

An ordered `string[]`. For a two-node same-floor route the result is always at least `["Start at X", "Arrive at Y"]`. The list may be empty only if `path` is null or zero-length (guarded at the top of the function).

---

## 6. Time Estimation

**File:** `backend/src/services/timeEstimate.js`

### 6.1 Function Signature

```js
estimateTime({ path, nodeById, adjacency })
// Returns: { total_seconds: number, display: string }
```

| Parameter | Type | Description |
|---|---|---|
| `path` | `string[]` | Ordered node ID array. |
| `nodeById` | `Map<string, node>` | Global node map for floor/type lookups. |
| `adjacency` | `Map` | Global adjacency map — used to look up the edge weight between consecutive path nodes. |

### 6.2 Methodology

The function iterates over every consecutive pair of nodes in the path (`path[i]` → `path[i+1]`) and adds one of two time contributions:

#### Same-floor segment (walking)

```
time (seconds) = (edge_weight / 250) * 60
```

Assumption: **walking speed = 250 pixel-units per minute** (a rough approximation tuned to the canvas scale).

```js
// timeEstimate.js line 53
totalSeconds += (weight / 250) * 60;
```

#### Cross-floor segment (stair or elevator transition)

The edge weight between stair/elevator pairs is `0`, so walking time contributes nothing. Instead, a fixed transition penalty is added based on the **number of floors crossed** and the **transport type**:

| Transport type | Cost per floor | Derivation |
|---|---|---|
| `stairs` (from or to node is type `"stairs"`) | **15 seconds / floor** | `totalSeconds += 15 * floorDiff` |
| `elevator` (from or to node is type `"elevator"`) | **20 seconds / floor** | `totalSeconds += 20 * floorDiff` |
| Unknown cross-floor type | 0 seconds | Safe fallback |

```js
// timeEstimate.js lines 45-49
if (fromType === "stairs" || toType === "stairs") {
  totalSeconds += 15 * floorDiff;
} else if (fromType === "elevator" || toType === "elevator") {
  totalSeconds += 20 * floorDiff;
}
```

`floorDiff` is `Math.abs(floorNumeric(from) - floorNumeric(to))` where the numeric mapping is `B = -1, 0 = 0, 1 = 1, 2 = 2, 3 = 3`.

### 6.3 Output Fields

| Field | Type | Unit | Description |
|---|---|---|---|
| `total_seconds` | `integer` | seconds | Total estimated travel time, rounded to the nearest whole second via `Math.round()`. |
| `display` | `string` | — | Human-readable summary. See §6.4. |

### 6.4 Display String Rules

| Condition | `display` value |
|---|---|
| `path.length < 2` (trivial path) | `"Less than a minute"` |
| `total_seconds < 60` | `"Less than a minute"` |
| `total_seconds` rounds to exactly 1 minute | `"About 1 minute"` |
| `total_seconds` rounds to N minutes (N > 1) | `"About N minutes"` |

---

## 7. History Persistence

### 7.1 Storage Medium

Route history is persisted in a **SQLite database** using the `better-sqlite3` driver (synchronous API). The database file is created automatically on first launch:

```
<project_root>/data/km_nav.sqlite
```

```js
// db.js lines 8-15
const dbPath = path.resolve(__dirname, "../../data/km_nav.sqlite");
fs.mkdirSync(dir, { recursive: true });   // ensures parent dir exists
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");           // write-ahead log for concurrency
db.pragma("foreign_keys = ON");
```

### 7.2 Schema — `users` Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER` | Auto-increment primary key, returned as `user_id` in JWTs. |
| `username` | `TEXT UNIQUE` | Trimmed username, 3–32 chars. |
| `password_hash` | `TEXT` | bcrypt hash of the user's password. |
| `created_at` | `TEXT` | UTC datetime string, set by SQLite at insert. |

### 7.3 Schema — `route_history` Table

```sql
CREATE TABLE IF NOT EXISTS route_history (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL,
  start_node       TEXT    NOT NULL,
  destination_node TEXT    NOT NULL,
  preference       TEXT    NOT NULL DEFAULT 'none',
  result_json      TEXT    NOT NULL,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_route_history_user_created
  ON route_history (user_id, created_at DESC);
```

| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER` | Auto-increment primary key for the history record. |
| `user_id` | `INTEGER FK` | Foreign key → `users.id`. Cascade-deletes when the user is deleted. |
| `start_node` | `TEXT` | The `start` node ID submitted to `POST /route`. |
| `destination_node` | `TEXT` | The `destination` node ID submitted to `POST /route`. |
| `preference` | `TEXT` | One of `"none"`, `"stairs"`, `"elevator"` (default `"none"`). |
| `result_json` | `TEXT` | Full `POST /route` response body serialised as JSON (`floors`, `instructions`, `estimated_time`). |
| `created_at` | `TEXT` | UTC datetime string set by SQLite at insert. |

The composite index on `(user_id, created_at DESC)` optimises the paginated `GET /history` query.

### 7.4 `saveRoute()` — Insert

```js
// history.js lines 25-34
function saveRoute({ userId, start, destination, preference, result }) {
  const info = stmtInsert.run({
    userId, start, destination, preference,
    result_json: JSON.stringify(result),
  });
  return info.lastInsertRowid;   // integer row ID of the new record
}
```

Called from `POST /route` after a successful path computation **only when `req.user` is set** (i.e. the caller provided a valid JWT). A failure here is caught and logged to stderr, but **does not affect the route response**.

### 7.5 `listUserRoutes()` — Query

```js
// history.js lines 40-49
function listUserRoutes({ userId, limit, offset }) {
  const rows = stmtList.all(userId, limit, offset);
  return rows.map((row) => ({
    id:               row.id,
    start_node:       row.start_node,
    destination_node: row.destination_node,
    preference:       row.preference,
    created_at:       row.created_at,
    result:           JSON.parse(row.result_json),  // deserialised back to object
  }));
}
```

Query is ordered **newest first** (`ORDER BY created_at DESC, id DESC`) with `LIMIT` / `OFFSET` pagination.

#### Returned row shape

| Field | Type | Description |
|---|---|---|
| `id` | `integer` | History record ID. |
| `start_node` | `string` | Start node ID used in the route. |
| `destination_node` | `string` | Destination node ID used in the route. |
| `preference` | `string` | Transport preference used (`"none"`, `"stairs"`, or `"elevator"`). |
| `created_at` | `string` | UTC datetime string from SQLite. |
| `result` | `object` | Full deserialized route result `{ floors, instructions, estimated_time }`. |
