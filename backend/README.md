## Kirby-Manchester Indoor Navigation — Backend

Backend API for the Kirby-Manchester Indoor Navigation System. Serves floor graph data (nodes/edges) and computes shortest paths (Dijkstra) plus turn-by-turn instructions.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Development (with file watch):

```bash
npm run dev
```

Server runs at `http://localhost:8000` by default (matches the API spec). Set `PORT` to override.

## API (current)

### Health

- **GET** `/health` — Returns `{ status: "ok", service: "km-nav-backend" }`.

### Floors

- **GET** `/floors` — List available floors as an array, e.g. `[1]`.
- **GET** `/floors/:floor` — Floor map graph data: `{ floor, nodes, edges }`.

### Search

- **GET** `/search?q=...&floor=...` — Search nodes by `node_id` or `label` (case-insensitive partial match). Returns `[{ node_id, label, type, floor }]`.

### Route

- **POST** `/route`

  Body (JSON):

  - `start` (string) — starting node ID (e.g. `"R101"`).
  - `destination` (string) — destination node ID (e.g. `"R128"`).
  - `preference` (string, optional) — `"none"` | `"stairs"` | `"elevator"`. Default `"none"`.

  Response:

  - `floors` — path grouped by floor number: `{ "1": ["R101", ...] }`
  - `instructions` — step-by-step directions

  Errors: consistent `{ "detail": "..." }` format.

### Nearest facility

- **GET** `/nearest?from_node=...&type=...`

  - `type` must be one of: `stairs`, `elevator`, `mens_restroom`, `womens_restroom`.

## Data model

- Floor data is stored as nodes and weighted undirected edges in `src/data/`.

## Connecting the frontend

Point the frontend to `http://localhost:8000` (or your backend URL):

- Fetch available floors from `GET /floors`, and floor map graph data from `GET /floors/1`.
- Search using `GET /search?q=...`.
- Generate routes using `POST /route` with node IDs.
- Find facilities using `GET /nearest`.
