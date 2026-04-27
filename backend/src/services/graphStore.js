const allNodesRaw = require("../data/combined_nodes.json");
const allEdgesRaw = require("../data/combined_edges.json");

function normalizeType(type) {
  if (!type) return type;
  const t = String(type).trim().toLowerCase();
  if (t === "men's restroom" || t === "mens restroom" || t === "men restroom") {
    return "mens_restroom";
  }
  if (
    t === "women's restroom" ||
    t === "womens restroom" ||
    t === "women restroom"
  ) {
    return "womens_restroom";
  }
  if (
    t === "all-gender restroom" ||
    t === "all gender restroom" ||
    t === "all-gender_restroom"
  ) {
    return "all_gender_restroom";
  }
  return t.replace(/\s+/g, "_");
}

// ─── Step 1: Normalize all nodes and build a global nodeById map ──────────────
const globalNodeById = new Map();
const nodesNormalized = allNodesRaw.map((n) => {
  const normalized = { ...n, type: normalizeType(n.type) };
  globalNodeById.set(normalized.node_id, normalized);
  return normalized;
});

// ─── Step 2: Normalize all edges (rename from/to → from_node/to_node) ─────────
const edgesNormalized = allEdgesRaw.map((e) => ({
  from_node: e.from,
  to_node: e.to,
  distance: e.distance,
}));

// ─── Step 3: Separate edges into per-floor and cross-floor buckets ─────────────
// An edge is same-floor only when both endpoints share the same floor number.
// Cross-floor edges (stair / elevator links) go only into the global adjacency.
const floorEdgesMap = new Map(); // floorNumber → edge[]

for (const e of edgesNormalized) {
  const fromNode = globalNodeById.get(e.from_node);
  const toNode = globalNodeById.get(e.to_node);
  const fromFloor = fromNode ? fromNode.floor : null;
  const toFloor = toNode ? toNode.floor : null;

  if (fromFloor !== null && fromFloor === toFloor) {
    // Same-floor edge — add to the per-floor bucket
    if (!floorEdgesMap.has(fromFloor)) floorEdgesMap.set(fromFloor, []);
    floorEdgesMap.get(fromFloor).push(e);
  }
  // Cross-floor edges (fromFloor !== toFloor) are intentionally omitted here;
  // they will only appear in globalAdjacency (built below).
}

// ─── Step 4: Build global adjacency (all edges, including cross-floor) ─────────
const globalAdjacency = new Map();
const ensureGlobal = (id) => {
  if (!globalAdjacency.has(id)) globalAdjacency.set(id, []);
  return globalAdjacency.get(id);
};
for (const e of edgesNormalized) {
  ensureGlobal(e.from_node).push({ to: e.to_node, weight: e.distance });
  ensureGlobal(e.to_node).push({ to: e.from_node, weight: e.distance });
}

// ─── Step 5: Group nodes by floor ─────────────────────────────────────────────
const floorNodesMap = new Map(); // floorNumber → node[]
for (const node of nodesNormalized) {
  const f = node.floor;
  if (!floorNodesMap.has(f)) floorNodesMap.set(f, []);
  floorNodesMap.get(f).push(node);
}

// ─── Step 6: Build per-floor data structures ───────────────────────────────────
function buildFloor({ floorNumber, nodes, edges }) {
  const nodeById = new Map();
  for (const n of nodes) {
    nodeById.set(n.node_id, n);
  }

  const adjacency = new Map();
  const ensure = (id) => {
    if (!adjacency.has(id)) adjacency.set(id, []);
    return adjacency.get(id);
  };
  for (const e of edges) {
    ensure(e.from_node).push({ to: e.to_node, weight: e.distance });
    ensure(e.to_node).push({ to: e.from_node, weight: e.distance });
  }

  return {
    floor: floorNumber,
    nodes,
    edges,
    nodeById,
    adjacency,
  };
}

// ─── Step 7: Dynamically populate FLOOR_DATA from all discovered floors ────────
const FLOOR_DATA = {};
for (const floorNumber of floorNodesMap.keys()) {
  FLOOR_DATA[floorNumber] = buildFloor({
    floorNumber,
    nodes: floorNodesMap.get(floorNumber),
    edges: floorEdgesMap.get(floorNumber) || [],
  });
}

// ─── Public interface (unchanged) ─────────────────────────────────────────────
function listFloors() {
  const FLOOR_ORDER = { "B": -1, "0": 0, "1": 1, "2": 2, "3": 3 };
  return Object.keys(FLOOR_DATA)
    .sort((a, b) => (FLOOR_ORDER[a] ?? 99) - (FLOOR_ORDER[b] ?? 99));
}

function getFloor(floorNumber) {
  const f = FLOOR_DATA[String(floorNumber)];
  return f || null;
}

function getNode(nodeId) {
  return globalNodeById.get(nodeId) || null;
}

// ─── New helpers for cross-floor routing ──────────────────────────────────────
function getGlobalAdjacency() {
  return globalAdjacency;
}

function getGlobalNodeById() {
  return globalNodeById;
}

module.exports = {
  normalizeType,
  listFloors,
  getFloor,
  getNode,
  getGlobalAdjacency,
  getGlobalNodeById,
};
