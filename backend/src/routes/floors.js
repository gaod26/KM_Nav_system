const express = require("express");
const { getFloor, listFloors } = require("../services/graphStore");

const router = express.Router();

/**
 * GET /floors
 * Spec: List available floors as an array of floor numbers.
 */
router.get("/", (req, res) => {
  res.json(listFloors());
});

/**
 * GET /floors/:floor
 * Spec: Return map data (nodes + edges) for a floor.
 */
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const floor = getFloor(id);
  if (!floor) {
    return res.status(404).json({ detail: `Floor ${id} has no data` });
  }
  res.json({
    floor: id,
    nodes: floor.nodes,
    edges: floor.edges,
  });
});

module.exports = router;
