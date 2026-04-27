import api from './api'

/**
 * Generate a route between two locations
 */
export async function generateRoute(start, destination, preference = 'no_preference') {
  try {
    // Map frontend preference values to backend expected values
    const backendPreference = preference === 'no_preference' ? 'none' : preference
    
    const response = await api.post('/route', {
      start,
      destination,
      preference: backendPreference
    })
    
    // Transform backend response to frontend format
    const data = response.data
    
    // Extract the path array from the floors object (e.g., {1: ["R101", ...]} -> ["R101", ...])
    let pathArray = []
    if (data.floors) {
      const floorKeys = Object.keys(data.floors)
      if (floorKeys.length > 0) {
        // For single floor routes, just use that floor's path
        // For multi-floor, concatenate all paths
        floorKeys.forEach(floorNum => {
          pathArray = pathArray.concat(data.floors[floorNum])
        })
      }
    }
    
    return {
      floors: data.floors,
      directions: data.instructions || [],
      distance: data.total_distance,
      path: pathArray // Path as flat array for map rendering
    }
  } catch (error) {
    console.error('Route generation error:', error)
    throw error
  }
}

/**
 * Get all available rooms using search endpoint
 */
export async function getAllRooms() {
  try {
    // Get all rooms by searching with empty or broad query
    // We'll get all nodes from the floors endpoint instead
    const floorsResponse = await api.get('/floors')
    const floors = floorsResponse.data
    
    if (!floors || floors.length === 0) {
      return []
    }
    
    // Get nodes from all available floors
    const allRooms = []
    for (const floorNum of floors) {
      const floorResponse = await api.get(`/floors/${floorNum}`)
      const nodes = floorResponse.data.nodes || []
      
      // Add all nodes as selectable locations
      nodes.forEach(node => {
        allRooms.push({
          id: node.node_id,
          name: node.label,
          floor: node.floor,
          type: node.type
        })
      })
    }
    
    return allRooms.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    throw error
  }
}

/**
 * Search for rooms and facilities
 */
export async function searchLocations(query, floor = null) {
  try {
    const params = { q: query }
    if (floor !== null) {
      params.floor = floor
    }
    
    const response = await api.get('/search', { params })
    return response.data.map(node => ({
      id: node.node_id,
      name: node.label,
      floor: node.floor,
      type: node.type
    }))
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

/**
 * Find nearest facility of a given type
 */
export async function findNearestFacility(fromNode, facilityType) {
  try {
    const response = await api.get('/nearest', {
      params: {
        from_node: fromNode,
        type: facilityType
      }
    })
    
    const data = response.data
    return {
      targetNode: data.target_node,
      targetLabel: data.target_label,
      distance: data.total_distance,
      floors: data.floors,
      directions: data.instructions || []
    }
  } catch (error) {
    console.error('Find nearest facility error:', error)
    throw error
  }
}

/**
 * Get floor metadata
 */
export async function getFloors() {
  try {
    const response = await api.get('/floors')
    return response.data.map(floorNum => ({
      number: floorNum,
      name: `Floor ${floorNum}`,
      available: true
    }))
  } catch (error) {
    console.error('Failed to fetch floors:', error)
    // Fallback to floor 1
    return [{ number: 1, name: 'Floor 1', available: true }]
  }
}

/**
 * Get floor map data (nodes and edges)
 */
export async function getFloorData(floorNumber) {
  try {
    const response = await api.get(`/floors/${floorNumber}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch floor ${floorNumber} data:`, error)
    throw error
  }
}
