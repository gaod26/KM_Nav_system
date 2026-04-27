import './FloorSwitcher.css'

function FloorSwitcher({ currentFloor, onFloorChange, availableFloors = [1], routeFloors = [] }) {
  const hasMultiFloorRoute = routeFloors.length > 1
  
  return (
    <div className="floor-switcher">
      <span className="floor-label">
        Floor: {hasMultiFloorRoute && <span className="multi-floor-badge">Multi-Floor Route</span>}
      </span>
      <div className="floor-tabs">
        {availableFloors.map(floorNum => {
          const isActive = currentFloor === floorNum
          const isInRoute = routeFloors.includes(floorNum)
          
          return (
            <button
              key={floorNum}
              className={`floor-tab ${isActive ? 'active' : ''} ${isInRoute ? 'in-route' : ''}`}
              onClick={() => onFloorChange(floorNum)}
              disabled={isActive}
              title={isInRoute ? `Floor ${floorNum} (in route)` : `Floor ${floorNum}`}
            >
              {floorNum}
              {isInRoute && !isActive && <span className="route-indicator">●</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FloorSwitcher
