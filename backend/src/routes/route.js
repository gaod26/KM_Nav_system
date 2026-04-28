const express = require("express");
const { getNode, getFloor, getGlobalAdjacency, getGlobalNodeById } = require("../services/graphStore");
const { dijkstraShortestPath } = require("../services/dijkstra");
const { buildInstructionsForPath } = require("../services/instructions");
const { optionalAuth } = require("../middleware/auth");
const { saveRoute } = require("../services/history");
const { estimateTime } = require("../services/timeEstimate");

const router = express.Router();

/**
 * Build a filtered copy of the global adjacency map by removing cross-floor
 * edges whose destination node is of the given excluded type.
 * Same-floor edges are always preserved.
 */
function buildFilteredAdjacency(globalAdjacency, globalNodeById, excludeType) {
  const filtered = new Map();
  for (const [nodeId, neighbors] of globalAdjacency.entries()) {
    const fromNode = globalNodeById.get(nodeId);
    const kept = neighbors.filter(({ to }) => {
      const toNode = globalNodeById.get(to);
      // Keep if either endpoint is unknown, or if same-floor
      if (!fromNode || !toNode || fromNode.floor === toNode.floor) return true;
      // Drop cross-floor edges where the destination is the excluded type
      return toNode.type !== excludeType;
    });
    filtered.set(nodeId, kept);
  }
  return filtered;
}

/**
 * Group an ordered path array into a plain object keyed by floor number
 * (as strings). Nodes are appended to the array for their floor in path order.
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
 * POST /route
 * Body: { start, destination, preference? }
 */
router.post("/", optionalAuth, (req, res) => {
  const body = req.body || {};
  const start = body.start;
  const destination = body.destination;
  const preference = body.preference ?? "none";

  if (!start) {
    return res.status(400).json({ detail: "Missing required field: start" });
  }
  if (!destination) {
    return res
      .status(400)
      .json({ detail: "Missing required field: destination" });
  }

  const allowedPrefs = new Set(["none", "stairs", "elevator"]);
  if (!allowedPrefs.has(preference)) {
    return res.status(400).json({
      detail: "Invalid preference: must be one of none, stairs, elevator",
    });
  }

  const startNode = getNode(start);
  if (!startNode) {
    return res.status(404).json({ detail: `Node ${start} does not exist` });
  }
  const destNode = getNode(destination);
  if (!destNode) {
    return res
      .status(404)
      .json({ detail: `Node ${destination} does not exist` });
  }

  // Choose adjacency map: same-floor uses floor-specific graph so cross-floor
  // edges are not considered; cross-floor uses the global graph, optionally
  // filtered by the caller's stair/elevator preference.
  let adjacency;
  if (startNode.floor === destNode.floor) {
    const floor = getFloor(startNode.floor);
    if (!floor) {
      return res.status(404).json({ detail: `Floor ${startNode.floor} has no data` });
    }
    adjacency = floor.adjacency;
  } else {
    const globalAdj = getGlobalAdjacency();
    const globalNBI = getGlobalNodeById();
    if (preference === "stairs") {
      // Remove cross-floor elevator edges so only stairwells bridge floors
      adjacency = buildFilteredAdjacency(globalAdj, globalNBI, "elevator");
    } else if (preference === "elevator") {
      // Remove cross-floor stair edges so only elevators bridge floors
      adjacency = buildFilteredAdjacency(globalAdj, globalNBI, "stairs");
    } else {
      adjacency = globalAdj;
    }
  }

  const result = dijkstraShortestPath({
    adjacency,
    start,
    goal: destination,
  });
  if (!result) {
    return res.status(404).json({
      detail: `No path found from ${start} to ${destination}`,
    });
  }

  const globalNodeById = getGlobalNodeById();

  const instructions = buildInstructionsForPath({
    path: result.path,
    nodeById: globalNodeById,
  });

  const estimated_time = estimateTime({
    path: result.path,
    nodeById: globalNodeById,
    adjacency: getGlobalAdjacency(),
  });

  const responseBody = {
    floors: groupPathByFloor(result.path, globalNodeById),
    instructions,
    total_distance: result.distance,
    estimated_time,
  };

  if (req.user) {
    try {
      saveRoute({
        userId: req.user.user_id,
        start,
        destination,
        preference,
        result: responseBody,
      });
    } catch (e) {
      console.error("Failed to save route history:", e);
    }
  }

  res.json(responseBody);
});

module.exports = router;
