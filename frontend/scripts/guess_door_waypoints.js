import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Paths ────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const COMBINED_NODES_PATH = path.join(DATA_DIR, 'combined_nodes.json');
const NODE_POSITIONS_PATH = path.join(DATA_DIR, 'nodePositions.json');

const FLOORS = ['B', '0', '1', '2', '3'];

const inputPath  = (f) => path.join(DATA_DIR, `floor${f}.json`);
const outputPath = (f) => path.join(DATA_DIR, `floor${f}_with_waypoints.json`);

// ── Load shared data ─────────────────────────────────────────────────────────

const combinedNodes = JSON.parse(fs.readFileSync(COMBINED_NODES_PATH, 'utf8'));
const nodePositions = JSON.parse(fs.readFileSync(NODE_POSITIONS_PATH, 'utf8'));

// Build type lookup: node_id → type
const nodeTypeMap = {};
for (const n of combinedNodes) {
  nodeTypeMap[n.node_id] = n.type;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isHallwayLike(type) {
  return type === 'hallway' || type === 'junction';
}

// ── Per-floor processing ─────────────────────────────────────────────────────

const statsPerFloor = {};
const grandTotal = {
  total: 0,
  with_waypoint: 0,
  skipped_both_hallway: 0,
  skipped_both_room: 0,
  skipped_missing_pos: 0,
};

for (const floor of FLOORS) {
  const edges = JSON.parse(fs.readFileSync(inputPath(floor), 'utf8'));

  let cnt_waypoint       = 0;
  let cnt_both_hallway   = 0;
  let cnt_both_room      = 0;
  let cnt_missing_pos    = 0;

  const outputEdges = edges.map((edge) => {
    const posFrom = nodePositions[edge.from];
    const posTo   = nodePositions[edge.to];

    // Skip if either endpoint missing from nodePositions
    if (!posFrom || !posTo) {
      cnt_missing_pos++;
      return { ...edge };
    }

    const typeFrom = nodeTypeMap[edge.from];
    const typeTo   = nodeTypeMap[edge.to];

    const fromIsHallway = isHallwayLike(typeFrom);
    const toIsHallway   = isHallwayLike(typeTo);

    // Both hallway-like → corridor segment, skip
    if (fromIsHallway && toIsHallway) {
      cnt_both_hallway++;
      return { ...edge };
    }

    // Both room-like → rare, skip
    if (!fromIsHallway && !toIsHallway) {
      cnt_both_room++;
      return { ...edge };
    }

    // Exactly one room-like, one hallway-like → compute door waypoint
    const R = fromIsHallway ? posTo   : posFrom;  // room-like position
    const H = fromIsHallway ? posFrom : posTo;    // hallway-like position

    let doorX, doorY;
    if (Math.abs(R.x - H.x) < Math.abs(R.y - H.y)) {
      // Corridor is vertical → door shares corridor X, room Y
      doorX = H.x;
      doorY = R.y;
    } else {
      // Corridor is horizontal → door shares room X, corridor Y
      doorX = R.x;
      doorY = H.y;
    }

    cnt_waypoint++;
    return { ...edge, waypoints: [[Math.round(doorX), Math.round(doorY)]] };
  });

  // Write NEW output file — never overwrites original
  fs.writeFileSync(outputPath(floor), JSON.stringify(outputEdges, null, 2), 'utf8');

  statsPerFloor[floor] = {
    total: edges.length,
    with_waypoint: cnt_waypoint,
    skipped_both_hallway: cnt_both_hallway,
    skipped_both_room: cnt_both_room,
    skipped_missing_pos: cnt_missing_pos,
  };

  grandTotal.total                += edges.length;
  grandTotal.with_waypoint        += cnt_waypoint;
  grandTotal.skipped_both_hallway += cnt_both_hallway;
  grandTotal.skipped_both_room    += cnt_both_room;
  grandTotal.skipped_missing_pos  += cnt_missing_pos;
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log('=== Door waypoint generation summary ===');
for (const floor of FLOORS) {
  const s = statsPerFloor[floor];
  console.log(
    `floor${floor}:  total=${s.total}  with_waypoint=${s.with_waypoint}` +
    `  skipped_both_hallway=${s.skipped_both_hallway}  skipped_both_room=${s.skipped_both_room}` +
    `  skipped_missing_pos=${s.skipped_missing_pos}`
  );
}
console.log(
  `TOTAL:   total=${grandTotal.total}  with_waypoint=${grandTotal.with_waypoint}` +
  `  skipped_both_hallway=${grandTotal.skipped_both_hallway}  skipped_both_room=${grandTotal.skipped_both_room}` +
  `  skipped_missing_pos=${grandTotal.skipped_missing_pos}`
);
