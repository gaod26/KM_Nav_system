"use strict";

const { pixelsToFeet } = require("./units");

/**
 * estimateTime({ path, nodeById, adjacency })
 *
 * Estimates travel time for an ordered path of node IDs.
 *
 * @param {string[]} path       - Ordered array of node IDs.
 * @param {Map}      nodeById   - Map<nodeId, { floor, type, ... }>
 * @param {Map}      adjacency  - Map<nodeId, [{ to, weight }, ...]>
 * @returns {{ total_seconds: number, display: string }}
 */
function estimateTime({ path, nodeById, adjacency }) {
  if (!path || path.length < 2) {
    return { total_seconds: 0, display: "Less than a minute" };
  }

  let totalSeconds = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];

    const fromNode = nodeById.get(fromId);
    const toNode = nodeById.get(toId);

    // Edge weight (distance); treat missing as 0
    const neighbors = adjacency.get(fromId);
    const edge = neighbors ? neighbors.find((n) => n.to === toId) : undefined;
    const weight = edge && edge.weight != null ? edge.weight : 0;

    const fromFloor = fromNode ? fromNode.floor : null;
    const toFloor = toNode ? toNode.floor : null;

    if (fromFloor !== null && toFloor !== null && fromFloor !== toFloor) {
      // ── Cross-floor segment: add transition time, no walking distance ──
      const FLOOR_NUMERIC = { "B": -1, 0: 0, 1: 1, 2: 2, 3: 3,
                              "0": 0, "1": 1, "2": 2, "3": 3 };
      const fromN = FLOOR_NUMERIC[fromFloor];
      const toN = FLOOR_NUMERIC[toFloor];
      const floorDiff = (fromN != null && toN != null) ? Math.abs(fromN - toN) : 1;
      const fromType = fromNode ? fromNode.type : null;
      const toType = toNode ? toNode.type : null;

      if (fromType === "stairs" || toType === "stairs") {
        totalSeconds += 15 * floorDiff;
      } else if (fromType === "elevator" || toType === "elevator") {
        totalSeconds += 20 * floorDiff;
      }
      // else: unknown cross-floor type → add 0 (safe fallback)
    } else {
      // ── Same-floor segment: walking time = (distance / 250) * 60 ──
      totalSeconds += (pixelsToFeet(weight) / 250) * 60; // Correction: SVG pixel units → feet (~3 px per ft)
    }
  }

  const rounded = Math.round(totalSeconds);

  // ── Format display string ──
  let display;
  if (rounded < 60) {
    display = "Less than a minute";
  } else {
    const m = Math.round(rounded / 60);
    display = m === 1 ? "About 1 minute" : `About ${m} minutes`;
  }

  return { total_seconds: rounded, display };
}

module.exports = { estimateTime };
