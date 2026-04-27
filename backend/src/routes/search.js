const express = require("express");
const { getFloor, listFloors } = require("../services/graphStore");

const router = express.Router();

/**
 * GET /search?q={keyword}&floor={floor?}
 */
router.get("/", (req, res) => {
  const q = req.query.q;
  const floorParam = req.query.floor;

  if (q === undefined || q === null || String(q).trim() === "") {
    return res.status(400).json({ detail: "Missing required parameter: q" });
  }
  const query = String(q).toLowerCase();

  let floors = listFloors();
  if (floorParam !== undefined) {
    floors = [String(floorParam)];
  }

  const results = [];
  for (const f of floors) {
    const floor = getFloor(f);
    if (!floor) continue;
    for (const node of floor.nodes) {
      const id = String(node.node_id || "").toLowerCase();
      const label = String(node.label || "").toLowerCase();
      if (id.includes(query) || label.includes(query)) {
        results.push({
          node_id: node.node_id,
          label: node.label,
          type: node.type,
          floor: node.floor,
        });
      }
    }
  }

  res.json(results);
});

module.exports = router;

