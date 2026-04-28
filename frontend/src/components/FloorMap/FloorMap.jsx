import { useState, useEffect, useRef, useMemo } from 'react'
import { getNodeType, isEdgeInRoute } from '../../utils/graphUtils'
import FloorSwitcher from '../Controls/FloorSwitcher'
import FloorDiagram from './FloorDiagram'
import floorBData from '../../data/floorB.json'
import floor0Data from '../../data/floor0.json'
import floor1Data from '../../data/floor1.json'
import floor2Data from '../../data/floor2.json'
import floor3Data from '../../data/floor3.json'
import nodePositions from '../../data/nodePositions.json'
import combinedNodesRaw from '../../data/combined_nodes.json'
import './FloorMap.css'

function FloorMap({ floor, onFloorChange, routeData, startLocation, destination, onNodeClick }) {
  const [positions] = useState(nodePositions)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1700, height: 900 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const svgRef = useRef(null)

  const nodeTypeMap = useMemo(() => {
    const map = {}
    for (const n of combinedNodesRaw) {
      map[n.node_id] = n.type
    }
    return map
  }, [])

  const nodeFloorMap = useMemo(() => {
    const map = {}
    for (const n of combinedNodesRaw) {
      map[n.node_id] = n.floor
    }
    return map
  }, [])

  const mapWidth = 1700
  const mapHeight = 900

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (!isPanning) return

    const dx = (e.clientX - panStart.x) / zoom
    const dy = (e.clientY - panStart.y) / zoom

    setViewBox(vb => ({
      ...vb,
      x: vb.x - dx,
      y: vb.y - dy
    }))

    setPanStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleZoom = (zoomFactor) => {
    const newZoom = Math.max(0.5, Math.min(3, zoom * zoomFactor))
    setZoom(newZoom)

    const newWidth = mapWidth / newZoom
    const newHeight = mapHeight / newZoom

    // Zoom towards center
    const centerX = viewBox.x + viewBox.width / 2
    const centerY = viewBox.y + viewBox.height / 2

    setViewBox({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    })
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.5, Math.min(3, zoom * delta))
    setZoom(newZoom)

    // Adjust viewBox to zoom towards mouse position
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height

    const newWidth = mapWidth / newZoom
    const newHeight = mapHeight / newZoom

    setViewBox({
      x: svgX - (mouseX / rect.width) * newWidth,
      y: svgY - (mouseY / rect.height) * newHeight,
      width: newWidth,
      height: newHeight
    })
  }

  const handleNodeClick = (nodeId) => {
    if (onNodeClick) {
      onNodeClick(nodeId)
    }
  }

  const getNodeColor = (nodeId) => {
    if (nodeId === startLocation) return '#10b981' // Green for start
    if (nodeId === destination) return '#ef4444' // Red for destination
    
    const type = getNodeType(nodeId)
    const colorMap = {
      room: '#3b82f6',
      hallway: '#94a3b8',
      junction: '#8b5cf6',
      stairs: '#f59e0b',
      elevator: '#f59e0b',
      office: '#06b6d4',
      restroom: '#ec4899'
    }
    return colorMap[type] || '#6b7280'
  }

  const getNodeRadius = (nodeId) => {
    if (nodeId === startLocation || nodeId === destination) return 12
    
    const type = getNodeType(nodeId)
    if (type === 'stairs' || type === 'elevator') return 10
    if (type === 'junction') return 8
    if (type === 'hallway') return 6
    return 8
  }

  const getNodeEmoji = (nodeId) => {
    if (nodeId === startLocation) return "🏁"
    if (nodeId === destination) return "📍"
    const type = nodeTypeMap[nodeId]
    const emojiMap = {
      room: "🏢",
      mens_restroom: "🚹",
      womens_restroom: "🚺",
      all_gender_restroom: "🚻",
      stairs: "🪜",
      elevator: "🛗",
      hallway: "↔️",
      junction: "🔀",
      other: "📌"
    }
    return emojiMap[type] || "📌"
  }

  const routePath = routeData?.path || []
  
  // Convert floors object to array of floor numbers
  const routeFloors = routeData?.floors ? Object.keys(routeData.floors).map(f => parseInt(f)) : []
  
  // Get the path for the current floor only
  const currentFloorPath = routeData?.floors?.[floor] || []

  // Select floor data based on current floor
  const floorDataMap = {
    'B': floorBData,
    0: floor0Data,
    1: floor1Data,
    2: floor2Data,
    3: floor3Data
  }
  const currentFloorData = floorDataMap[floor] || floor1Data

  // Filter nodes to only show nodes from the current floor.
  // Uses the authoritative floor field from combined_nodes.json via nodeFloorMap.
  // This replaces the previous regex-based approach which incorrectly matched
  // basement nodes (e.g. RB01A) on the floor 0 view.
  const currentFloorNodes = Object.entries(positions).filter(([nodeId]) => {
    return nodeFloorMap[nodeId] === floor
  })
  
  // Highlight stairs/elevators that are transition points in multi-floor routes
  const isTransitionNode = (nodeId) => {
    if (!routeData?.floors || routeFloors.length <= 1) return false
    const nodeType = getNodeType(nodeId)
    if (nodeType !== 'stairs' && nodeType !== 'elevator') return false
    
    // Check if this node appears in the route path
    return routePath.includes(nodeId)
  }

  return (
    <div className="floor-map-container">
      <FloorSwitcher
        currentFloor={floor}
        onFloorChange={onFloorChange}
        availableFloors={['B', 0, 1, 2, 3]}
        routeFloors={routeFloors}
      />

      <div className="map-controls">
        <button
          className="map-control-button"
          onClick={() => handleZoom(1.2)}
          aria-label="Zoom in"
        >
          +
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button
          className="map-control-button"
          onClick={() => handleZoom(1 / 1.2)}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          className="map-control-button"
          onClick={() => {
            setZoom(1)
            setViewBox({ x: 0, y: 0, width: mapWidth, height: mapHeight })
          }}
          aria-label="Reset view"
        >
          ⟲
        </button>
      </div>

      <svg
        ref={svgRef}
        className={`floor-map ${isPanning ? 'panning' : ''}`}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#15803d" />
          </marker>
          <filter id="transitionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Floor Diagram Background */}
        <FloorDiagram floor={floor} />

        {/* Draw edges */}
        <g className="edges">
          {currentFloorData.map((edge, index) => {
            const fromPos = positions[edge.from]
            const toPos = positions[edge.to]
            if (!fromPos || !toPos) return null

            const isInRoute = isEdgeInRoute(edge.from, edge.to, currentFloorPath)
            const hasActiveRoute = routePath.length > 0

            // Hide non-route edges when no route is active
            if (!isInRoute && !hasActiveRoute) return null

            return (
              <line
                key={index}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isInRoute ? '#15803d' : '#cbd5e1'}
                strokeWidth={isInRoute ? 4 : 2}
                strokeOpacity={isInRoute ? 1 : 0.1}
                className={isInRoute ? 'route-edge' : ''}
              />
            )
          })}
        </g>

        {/* Draw nodes */}
        <g className="nodes">
          {currentFloorNodes.map(([nodeId, pos]) => {
            const isTransition = isTransitionNode(nodeId)
            
            return (
              <g key={nodeId} className="node-group" transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Invisible larger click hitbox */}
                <circle
                  r={20}
                  fill="transparent"
                  onClick={() => handleNodeClick(nodeId)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Emoji icon */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="26"
                  opacity="0.7"
                  onClick={() => handleNodeClick(nodeId)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  className="node-emoji"
                >
                  {getNodeEmoji(nodeId)}
                </text>
                {/* Transition indicator */}
                {isTransition && (
                  <circle
                    r={30}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    className="transition-indicator"
                    filter="url(#transitionGlow)"
                    pointerEvents="none"
                  />
                )}
              </g>
            )
          })}
        </g>
      </svg>

      <div className="map-legend">
        <div className="legend-item"><span className="legend-emoji">🏁</span> Start</div>
        <div className="legend-item"><span className="legend-emoji">📍</span> Destination</div>
        <div className="legend-item"><span className="legend-emoji">🏢</span> Room</div>
        <div className="legend-item"><span className="legend-emoji">🚹</span> Mens Restroom</div>
        <div className="legend-item"><span className="legend-emoji">🚺</span> Womens Restroom</div>
        <div className="legend-item"><span className="legend-emoji">🚻</span> All-Gender Restroom</div>
        <div className="legend-item"><span className="legend-emoji">🪜</span> Stairs</div>
        <div className="legend-item"><span className="legend-emoji">🛗</span> Elevator</div>
        <div className="legend-item"><span className="legend-emoji">↔️</span> Hallway</div>
        <div className="legend-item"><span className="legend-emoji">🔀</span> Junction</div>
        <div className="legend-item"><span className="legend-emoji">📌</span> Other</div>
      </div>
    </div>
  )
}

export default FloorMap
