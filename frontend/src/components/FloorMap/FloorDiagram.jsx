// Floor diagram using the actual image as background
function FloorDiagram({ floor = 1 }) {
  // Use different floor plan images for each floor
  const floorImages = {
    'B': "/images/floorB-plan.png",
    0: "/images/floor0-plan.png",
    1: "/images/floor1-plan.png",
    2: "/images/floor2-plan.png",
    3: "/images/floor3-plan.png"
  }
  
  const imagePath = floorImages[floor] || floorImages[1]
  
  return (
    <g className="floor-diagram">
      {/* Use the actual floor plan image as background */}
      <image
        href={imagePath}
        x="0"
        y="0"
        width="1700"
        height="900"
        preserveAspectRatio="none"
      />
    </g>
  )
}

export default FloorDiagram
