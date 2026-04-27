function dijkstraShortestPath({ adjacency, start, goal }) {
  if (start === goal) return { path: [start], distance: 0 };

  const dist = new Map();
  const prev = new Map();
  const visited = new Set();

  dist.set(start, 0);

  // Simple O(V^2 + E) implementation (fine for ~50-500 nodes).
  while (true) {
    let u = null;
    let best = Infinity;
    for (const [node, d] of dist.entries()) {
      if (!visited.has(node) && d < best) {
        best = d;
        u = node;
      }
    }

    if (u === null) break; // unreachable
    if (u === goal) break;

    visited.add(u);
    const neighbors = adjacency.get(u) || [];
    for (const { to, weight } of neighbors) {
      if (visited.has(to)) continue;
      const alt = best + Number(weight);
      const current = dist.get(to);
      if (current === undefined || alt < current) {
        dist.set(to, alt);
        prev.set(to, u);
      }
    }
  }

  const total = dist.get(goal);
  if (total === undefined) return null;

  const path = [];
  let cur = goal;
  while (cur !== undefined) {
    path.push(cur);
    if (cur === start) break;
    cur = prev.get(cur);
  }
  if (path[path.length - 1] !== start) return null;
  path.reverse();

  return { path, distance: total };
}

function dijkstraAllDistances({ adjacency, start }) {
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  dist.set(start, 0);

  while (true) {
    let u = null;
    let best = Infinity;
    for (const [node, d] of dist.entries()) {
      if (!visited.has(node) && d < best) {
        best = d;
        u = node;
      }
    }
    if (u === null) break;
    visited.add(u);
    const neighbors = adjacency.get(u) || [];
    for (const { to, weight } of neighbors) {
      if (visited.has(to)) continue;
      const alt = best + Number(weight);
      const current = dist.get(to);
      if (current === undefined || alt < current) {
        dist.set(to, alt);
        prev.set(to, u);
      }
    }
  }

  return { dist, prev };
}

function reconstructPath({ prev, start, goal }) {
  if (start === goal) return [start];
  const path = [];
  let cur = goal;
  while (cur !== undefined) {
    path.push(cur);
    if (cur === start) break;
    cur = prev.get(cur);
  }
  if (path[path.length - 1] !== start) return null;
  path.reverse();
  return path;
}

module.exports = {
  dijkstraShortestPath,
  dijkstraAllDistances,
  reconstructPath,
};

