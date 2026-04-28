import { useState, useEffect } from 'react'
import './DirectionsList.css'

function DirectionsList({ directions = [], distance, estimatedTime, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Reset to expanded whenever a new route is generated
  useEffect(() => {
    setIsCollapsed(false)
  }, [directions])

  if (!directions || directions.length === 0) {
    return null
  }

  const formatDistance = (dist) => {
    if (dist >= 5280) {
      return `${(dist / 5280).toFixed(2)} mi`
    }
    return `${Math.round(dist)} ft`
  }

  // Check if a direction involves floor transition
  const isFloorTransition = (direction) => {
    const lowerDir = direction.toLowerCase()
    return lowerDir.includes('floor') || 
           lowerDir.includes('stairs') || 
           lowerDir.includes('stairwell') ||
           lowerDir.includes('elevator')
  }

  return (
    <div className="directions-panel">
      <div className="directions-header">
        <div>
          <h3 className="directions-title">Directions</h3>
          <div className="directions-summary">
            {distance && (
              <span className="summary-item">
                📏 <strong>{formatDistance(distance)}</strong>
              </span>
            )}
            {estimatedTime && (
              <span className="summary-item">
                ⏱️ <strong>{estimatedTime.display}</strong>
              </span>
            )}
          </div>
        </div>
        <div className="directions-controls">
          <button
            className="directions-btn directions-btn-close"
            onClick={onClose}
            aria-label="Close directions"
          >
            <span className="directions-btn-icon">✕</span>
          </button>
          <button
            className="directions-btn directions-btn-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand directions' : 'Collapse directions'}
          >
            <span className="directions-btn-icon">⤢</span>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <ol className="directions-list">
          {directions.map((direction, index) => {
            const isTransition = isFloorTransition(direction)
            return (
              <li 
                key={index} 
                className={`direction-step ${isTransition ? 'floor-transition' : ''}`}
              >
                <span className="step-number">{index + 1}</span>
                <span className="step-text">
                  {isTransition && <span className="transition-icon">🔄 </span>}
                  {direction}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default DirectionsList
