import { useState, useEffect } from 'react'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import FloorMap from './components/FloorMap/FloorMap'
import DirectionsList from './components/RouteDisplay/DirectionsList'
import AuthModal from './components/Auth/AuthModal'
import HistoryPanel from './components/History/HistoryPanel'
import { generateRoute, getAllRooms } from './services/routeService'
import { getUser, logout as authLogout, isAuthenticated } from './services/authService'
import './App.css'

function App() {
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [startLocation, setStartLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [preference, setPreference] = useState('no_preference')
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rooms, setRooms] = useState([])
  const [showDirections, setShowDirections] = useState(false)
  
  // Authentication state
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)

  useEffect(() => {
    // Load available rooms
    loadRooms()
    
    // Check for existing authentication
    if (isAuthenticated()) {
      setUser(getUser())
    }
  }, [])

  const loadRooms = async () => {
    try {
      const roomsData = await getAllRooms()
      setRooms(roomsData)
    } catch (err) {
      console.error('Failed to load rooms:', err)
      // Use mock data if backend is not available
      setRooms([])
    }
  }

  const handleGenerateRoute = async () => {
    console.log('Generate Route clicked!', { startLocation, destination, preference })
    
    if (!startLocation || !destination) {
      console.log('Missing locations')
      setError('Please select both start and destination locations')
      return
    }

    if (startLocation === destination) {
      console.log('Same location selected')
      setError('Start and destination cannot be the same')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('Calling generateRoute...')
      const route = await generateRoute(startLocation, destination, preference)
      console.log('Route received:', route)
      setRouteData(route)
      setShowDirections(true)
      
      // Switch to the floor of the start location if needed
      if (route.floors && Object.keys(route.floors).length > 0) {
        const firstFloorKey = Object.keys(route.floors)[0]
        const firstFloor = firstFloorKey === "B" ? "B" : parseInt(firstFloorKey)
        setSelectedFloor(firstFloor)
      }
    } catch (err) {
      console.error('Route generation failed:', err)
      setError(err.message || 'Failed to generate route. Please try again.')
      setRouteData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleClearRoute = () => {
    setRouteData(null)
    setStartLocation('')
    setDestination('')
    setPreference('no_preference')
    setError(null)
    setShowDirections(false)
  }

  const handleFloorChange = (floor) => {
    setSelectedFloor(floor)
  }

  // Authentication handlers
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    authLogout()
    setUser(null)
    setShowHistoryPanel(false)
  }

  const handleSelectRouteFromHistory = (origin, dest, pref) => {
    setStartLocation(origin)
    setDestination(dest)
    setPreference(pref || 'no_preference')
    setShowHistoryPanel(false)
  }

  return (
    <div className="app">
      <Header 
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onHistoryClick={() => setShowHistoryPanel(true)}
      />
      
      <div className="app-content">
        <Sidebar
          startLocation={startLocation}
          setStartLocation={setStartLocation}
          destination={destination}
          setDestination={setDestination}
          preference={preference}
          setPreference={setPreference}
          onGenerateRoute={handleGenerateRoute}
          onClearRoute={handleClearRoute}
          loading={loading}
          error={error}
          rooms={rooms}
          hasRoute={!!routeData}
        />
        
        <main className="main-content">
          <FloorMap
            floor={selectedFloor}
            onFloorChange={handleFloorChange}
            routeData={routeData}
            startLocation={startLocation}
            destination={destination}
            onNodeClick={(nodeId) => {
              if (!startLocation) {
                setStartLocation(nodeId)
              } else if (!destination && nodeId !== startLocation) {
                setDestination(nodeId)
              }
            }}
          />
          
          {showDirections && routeData && (
            <DirectionsList
              directions={routeData.directions}
              distance={routeData.distance}
              estimatedTime={routeData.estimated_time}
              onClose={() => setShowDirections(false)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showHistoryPanel && (
        <HistoryPanel
          onClose={() => setShowHistoryPanel(false)}
          onSelectRoute={handleSelectRouteFromHistory}
        />
      )}
    </div>
  )
}

export default App
