const {
  dijkstraShortestPath,
  dijkstraAllDistances,
  reconstructPath
} = require('../src/services/dijkstra');

// Mock graph: 8 nodes across 2 floors
//
//   F1:  A --10-- B --10-- C
//                 |
//                 +--5-- S1 --8-- S2 (F2)
//                 |
//                 +--5-- E1 --4-- E2 (F2)
//
//   F2:  S2 --5-- D
//        E2 --5-- D
//
// Shortest A→D goes via elevator: A→B→E1→E2→D = 10+5+4+5 = 24
function buildMockAdjacency() {
  const adj = new Map();
  adj.set('A',  [{ to: 'B',  weight: 10 }]);
  adj.set('B',  [{ to: 'A',  weight: 10 }, { to: 'C', weight: 10 },
                 { to: 'S1', weight: 5  }, { to: 'E1', weight: 5  }]);
  adj.set('C',  [{ to: 'B',  weight: 10 }]);
  adj.set('S1', [{ to: 'B',  weight: 5  }, { to: 'S2', weight: 8  }]);
  adj.set('S2', [{ to: 'S1', weight: 8  }, { to: 'D',  weight: 5  }]);
  adj.set('E1', [{ to: 'B',  weight: 5  }, { to: 'E2', weight: 4  }]);
  adj.set('E2', [{ to: 'E1', weight: 4  }, { to: 'D',  weight: 5  }]);
  adj.set('D',  [{ to: 'S2', weight: 5  }, { to: 'E2', weight: 5  }]);
  return adj;
}

describe('Dijkstra Routing Algorithm', () => {
  let adjacency;

  beforeEach(() => {
    adjacency = buildMockAdjacency();
  });

  // U01: Adjacent nodes shortest path
  test('U01: shortest path between adjacent nodes (FR-4)', () => {
    const result = dijkstraShortestPath({ adjacency, start: 'A', goal: 'B' });
    expect(result.path).toEqual(['A', 'B']);
    expect(result.distance).toBe(10);
  });

  // U02: Multi-hop shortest path
  test('U02: multi-hop shortest path (FR-4)', () => {
    const result = dijkstraShortestPath({ adjacency, start: 'A', goal: 'C' });
    expect(result.path).toEqual(['A', 'B', 'C']);
    expect(result.distance).toBe(20);
  });

  // U03: Start equals goal (edge case)
  test('U03: start equals goal returns zero-distance path (FR-4 edge case)', () => {
    const result = dijkstraShortestPath({ adjacency, start: 'A', goal: 'A' });
    expect(result.path).toEqual(['A']);
    expect(result.distance).toBe(0);
  });

  // U04: Cross-floor shortest path picks the lower-weight transition
  test('U04: cross-floor shortest path uses lower-weight elevator (FR-9)', () => {
    const result = dijkstraShortestPath({ adjacency, start: 'A', goal: 'D' });
    expect(result.path).toContain('E1');
    expect(result.path).toContain('E2');
    expect(result.distance).toBe(24);
  });

  // U05: Unreachable node returns null
  test('U05: unreachable node returns null (edge case)', () => {
    adjacency.set('X', []); // isolated node, no edges
    const result = dijkstraShortestPath({ adjacency, start: 'A', goal: 'X' });
    expect(result).toBeNull();
  });

  // U06: dijkstraAllDistances returns correct distances to all reachable nodes
  test('U06: dijkstraAllDistances computes all reachable distances (FR-4)', () => {
    const { dist } = dijkstraAllDistances({ adjacency, start: 'A' });
    expect(dist.get('A')).toBe(0);
    expect(dist.get('B')).toBe(10);
    expect(dist.get('C')).toBe(20);
    expect(dist.get('D')).toBe(24);
  });

  // U07: reconstructPath rebuilds path from prev map
  test('U07: reconstructPath rebuilds path from prev map (FR-4)', () => {
    const { prev } = dijkstraAllDistances({ adjacency, start: 'A' });
    const path = reconstructPath({ prev, start: 'A', goal: 'C' });
    expect(path).toEqual(['A', 'B', 'C']);
  });

  // U08: reconstructPath returns null when goal is unreachable
  test('U08: reconstructPath returns null when unreachable (edge case)', () => {
    adjacency.set('X', []);
    const { prev } = dijkstraAllDistances({ adjacency, start: 'A' });
    const path = reconstructPath({ prev, start: 'A', goal: 'X' });
    expect(path).toBeNull();
  });
});