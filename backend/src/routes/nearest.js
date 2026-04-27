const express = require("express");
const { getNode, getGlobalAdjacency, getGlobalNodeById } = require("../services/graphStore");
const {
  dijkstraAllDistances,
  reconstructPath,
} = require("../services/dijkstra");
const { buildInstructionsForPath } = require("../services/instructions");

const router = express.Router();

const ALLOWED_TYPES = new Set([
  "stairs",
  "elevator",
  "mens_restroom",
  "womens_restroom",
  "all_gender_restroom",
]);

/**
 * Group an ordered path array into a plain object keyed by floor number
 * (as strings). Mirrors the groupPathByFloor helper in route.js.
 */
function groupPathByFloor(path, globalNodeById) {
  const floors = {};
  for (const nodeId of path) {
    const node = globalNodeById.get(nodeId);
    const f = node ? String(node.floor) : "unknown";
    if (!floors[f]) floors[f] = [];
    floors[f].push(nodeId);
  }
  return floors;
}

/**
 * GET /nearest?from_node={id}&type={type}
 */
router.get("/", (req, res) => {
  const fromNodeId = req.query.from_node;
  const type = req.query.type;

  if (!fromNodeId) {
    return res
      .status(400)
      .json({ detail: "Missing required parameter: from_node" });
  }
  if (!type) {
    return res.status(400).json({ detail: "Missing required parameter: type" });
  }

  const t = String(type).trim().toLowerCase();
  if (!ALLOWED_TYPES.has(t)) {
    return res.status(400).json({
      detail:
        "Invalid type: must be one of stairs, elevator, mens_restroom, womens_restroom, all_gender_restroom",
    });
  }

  const fromNode = getNode(String(fromNodeId));
  if (!fromNode) {
    return res
      .status(404)
      .json({ detail: `Node ${String(fromNodeId)} does not exist` });
  }

  const globalNodeById = getGlobalNodeById();
  const globalAdjacency = getGlobalAdjacency();

  // Search candidates across all floors using the global node map.
  const candidates = [];
  for (const node of globalNodeById.values()) {
    if (node.type === t) candidates.push(node);
  }
  if (candidates.length === 0) {
    return res
      .status(404)
      .json({ detail: `No facilities of type ${t} found` });
  }

  // Run Dijkstra over the global adjacency so cross-floor paths are considered.
  const { dist, prev } = dijkstraAllDistances({
    adjacency: globalAdjacency,
    start: fromNode.node_id,
  });

  let best = null;
  for (const c of candidates) {
    const d = dist.get(c.node_id);
    if (d === undefined) continue;
    if (!best || d < best.total_distance) {
      best = { node: c, total_distance: d };
    }
  }

  if (!best) {
    return res
      .status(404)
      .json({ detail: `No facilities of type ${t} found` });
  }

  const path = reconstructPath({
    prev,
    start: fromNode.node_id,
    goal: best.node.node_id,
  });
  if (!path) {
    return res
      .status(404)
      .json({ detail: `No facilities of type ${t} found` });
  }

  const instructions = buildInstructionsForPath({
    path,
    nodeById: globalNodeById,
  });

  res.json({
    target_node: best.node.node_id,
    target_label: best.node.label,
    total_distance: best.total_distance,
    floors: groupPathByFloor(path, globalNodeById),
    instructions,
  });
});

module.exports = router;
