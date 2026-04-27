import { useState, useEffect } from 'react'
import { getHistory } from '../../services/authService'
import './HistoryPanel.css'

function HistoryPanel({ onClose, onSelectRoute }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getHistory(20, 0)
      if (result.success) {
        setHistory(result.history)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatDistance = (dist) => {
    if (dist >= 5280) {
      return `${(dist / 5280).toFixed(2)} mi`
    }
    return `${Math.round(dist)} ft`
  }

  const handleRouteClick = (route) => {
    if (onSelectRoute) {
      onSelectRoute(route.origin, route.destination, route.preference)
    }
    onClose()
  }

  return (
    <div className="history-panel-overlay" onClick={onClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>Navigation History</h2>
          <button className="history-close" onClick={onClose}>✕</button>
        </div>

        <div className="history-content">
          {loading && (
            <div className="history-loading">
              <div className="spinner"></div>
              <p>Loading history...</p>
            </div>
          )}

          {error && (
            <div className="history-error">
              <p>{error}</p>
              <button onClick={loadHistory} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="history-empty">
              <div className="empty-icon">📍</div>
              <h3>No Navigation History</h3>
              <p>Your navigation history will appear here once you start using the route finder.</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="history-list">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => handleRouteClick(item)}
                >
                  <div className="history-item-main">
                    <div className="history-route">
                      <span className="route-origin">{item.origin}</span>
                      <span className="route-arrow">→</span>
                      <span className="route-destination">{item.destination}</span>
                    </div>
                    <div className="history-meta">
                      <span className="meta-item">
                        📏 {formatDistance(item.distance)}
                      </span>
                      {item.estimated_time && (
                        <span className="meta-item">
                          ⏱️ {item.estimated_time.display}
                        </span>
                      )}
                      {item.preference && item.preference !== 'no_preference' && (
                        <span className="meta-badge">
                          {item.preference === 'avoid_stairs' ? '🚫 Stairs' : '🚶 Stairs'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="history-timestamp">
                    {formatDate(item.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryPanel
