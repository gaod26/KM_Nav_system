import { useState } from 'react'
import LocationInput from '../LocationPicker/LocationInput'
import PreferenceToggle from '../Controls/PreferenceToggle'
import './Sidebar.css'

function Sidebar({
  startLocation,
  setStartLocation,
  destination,
  setDestination,
  preference,
  setPreference,
  onGenerateRoute,
  onClearRoute,
  loading,
  error,
  rooms,
  hasRoute
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? '◀' : '▶'}
      </button>

      {isExpanded && (
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h2 className="sidebar-title">Plan Your Route</h2>
            <p className="sidebar-description">
              Select start and destination to find the best path
            </p>
          </div>

          <div className="sidebar-section">
            <LocationInput
              label="Start Location"
              value={startLocation}
              onChange={setStartLocation}
              rooms={rooms}
              placeholder="Select starting point"
              disabled={loading}
            />
          </div>

          <div className="sidebar-section">
            <LocationInput
              label="Destination"
              value={destination}
              onChange={setDestination}
              rooms={rooms}
              placeholder="Select destination"
              disabled={loading}
            />
          </div>

          <div className="sidebar-section">
            <PreferenceToggle
              value={preference}
              onChange={setPreference}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="sidebar-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="sidebar-actions">
            <button
              className="button button-primary"
              onClick={onGenerateRoute}
              disabled={loading || !startLocation || !destination}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                'Generate Route'
              )}
            </button>

            {hasRoute && (
              <button
                className="button button-secondary"
                onClick={onClearRoute}
                disabled={loading}
              >
                Clear Route
              </button>
            )}
          </div>

          <div className="sidebar-footer">
            <p className="help-text">
              💡 Tip: Click on the map to select locations
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
