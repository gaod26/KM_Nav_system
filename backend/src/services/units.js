// Edge weights in combined_edges.json are stored in SVG pixel units,
// but the rest of the system (UI display, walking-speed estimates) assumes feet.
// Empirical calibration: ~3 SVG pixels per real-world foot.
// Apply this conversion at every site that consumes raw edge weights.
const PIXELS_PER_FOOT = 3;

function pixelsToFeet(pixels) {
  return pixels / PIXELS_PER_FOOT;
}

module.exports = { PIXELS_PER_FOOT, pixelsToFeet };
