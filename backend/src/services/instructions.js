function nodeDisplay(node) {
  if (!node) return "Unknown location";
  const label = node.label;
  if (!label || label === "---" || label.trim() === "") return node.node_id;
  return label;
}

function floorDisplayName(floor) {
  const f = String(floor);
  if (f === "B") return "Basement";
  if (f === "0") return "Ground Floor";
  return "Floor " + f;
}

function nodeKindForSentence(node) {
  if (!node) return "location";
  switch (node.type) {
    case "hallway":
      return "hallway";
    case "junction":
      return "junction";
    case "stairs":
      return "stairs";
    case "elevator":
      return "elevator";
    case "mens_restroom":
      return "men's restroom";
    case "womens_restroom":
      return "women's restroom";
    case "all_gender_restroom":
      return "all-gender restroom";
    case "room":
      return "room";
    default:
      return "location";
  }
}

function buildInstructionsForPath({ path, nodeById }) {
  if (!path || path.length === 0) return [];
  const startNode = nodeById.get(path[0]);
  const endNode = nodeById.get(path[path.length - 1]);

  const instructions = [`Start at ${nodeDisplay(startNode)}`];

  // Single-node path: start and destination are the same location.
  // The loop below would never execute, so "Arrive at" must be added here.
  if (path.length === 1) {
    instructions.push(`Arrive at ${nodeDisplay(startNode)}`);
    return instructions;
  }

  for (let i = 1; i < path.length; i++) {
    const id = path[i];
    const node = nodeById.get(id);
    const isLast = i === path.length - 1;
    if (isLast) {
      instructions.push(`Arrive at ${nodeDisplay(endNode)}`);
      continue;
    }

    const kind = nodeKindForSentence(node);
    if (kind === "hallway") {
      instructions.push(`Walk through hallway ${id}`);
    } else if (kind === "junction") {
      instructions.push(`Continue past Junction ${id}`);
    } else if (kind === "room") {
      instructions.push(`Pass ${nodeDisplay(node)}`);
    } else if (kind === "elevator" || kind === "stairs") {
      const nextNode = nodeById.get(path[i + 1]);
      if (nextNode && node && node.floor !== nextNode.floor) {
        // Floor transition: emit one instruction and skip the landing node.
        const cleanLabel = nodeDisplay(node).replace(/\s+Floor\s+\d+$/i, "");
        instructions.push(`Take ${cleanLabel} from ${floorDisplayName(node.floor)} to ${floorDisplayName(nextNode.floor)}`);
        i++; // skip the arriving stairs/elevator node on the next floor
      } else {
        instructions.push(`Continue toward ${nodeDisplay(node)}`);
      }
    } else {
      instructions.push(`Continue past ${id}`);
    }
  }

  return instructions;
}

module.exports = {
  buildInstructionsForPath,
};
