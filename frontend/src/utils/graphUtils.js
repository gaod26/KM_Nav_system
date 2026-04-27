/**
 * Build a graph structure from edge data
 */
export function buildGraph(edges) {
  const graph = {}
  const nodes = new Set()
  
  edges.forEach(edge => {
    // Add nodes
    nodes.add(edge.from)
    nodes.add(edge.to)
    
    // Build adjacency list (undirected graph)
    if (!graph[edge.from]) {
      graph[edge.from] = []
    }
    if (!graph[edge.to]) {
      graph[edge.to] = []
    }
    
    graph[edge.from].push({ node: edge.to, distance: edge.distance })
    graph[edge.to].push({ node: edge.from, distance: edge.distance })
  })
  
  return { graph, nodes: Array.from(nodes) }
}

/**
 * Calculate node positions using force-directed layout
 */
export function calculateNodePositions(edges, width = 800, height = 600) {
  const { nodes } = buildGraph(edges)
  const positions = {}
  
  // Simple circular layout as starting point
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.35
  
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    positions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })
  
  // Run simple force-directed iterations
  const iterations = 50
  const repulsionStrength = 3000
  const attractionStrength = 0.01
  const damping = 0.9
  
  for (let iter = 0; iter < iterations; iter++) {
    const forces = {}
    
    // Initialize forces
    nodes.forEach(node => {
      forces[node] = { x: 0, y: 0 }
    })
    
    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i]
        const node2 = nodes[j]
        
        const dx = positions[node2].x - positions[node1].x
        const dy = positions[node2].y - positions[node1].y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = repulsionStrength / (distance * distance)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        forces[node1].x -= fx
        forces[node1].y -= fy
        forces[node2].x += fx
        forces[node2].y += fy
      }
    }
    
    // Attraction along edges
    edges.forEach(edge => {
      const dx = positions[edge.to].x - positions[edge.from].x
      const dy = positions[edge.to].y - positions[edge.from].y
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      
      const force = attractionStrength * (distance - edge.distance)
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force
      
      forces[edge.from].x += fx
      forces[edge.from].y += fy
      forces[edge.to].x -= fx
      forces[edge.to].y -= fy
    })
    
    // Apply forces with damping
    nodes.forEach(node => {
      positions[node].x += forces[node].x * damping
      positions[node].y += forces[node].y * damping
      
      // Keep within bounds
      positions[node].x = Math.max(50, Math.min(width - 50, positions[node].x))
      positions[node].y = Math.max(50, Math.min(height - 50, positions[node].y))
    })
  }
  
  return positions
}

/**
 * Get node type from ID
 */
export function getNodeType(nodeId) {
  const prefix = nodeId.match(/^[A-Z]+/)?.[0]
  
  const typeMap = {
    'R': 'room',
    'H': 'hallway',
    'J': 'junction',
    'S': 'stairs',
    'E': 'elevator',
    'O': 'office',
    'M': 'restroom',
    'W': 'restroom'
  }
  
  return typeMap[prefix] || 'other'
}

/**
 * Check if two nodes are connected in the route
 */
export function isEdgeInRoute(from, to, routePath) {
  if (!routePath || routePath.length < 2) return false
  
  for (let i = 0; i < routePath.length - 1; i++) {
    if (
      (routePath[i] === from && routePath[i + 1] === to) ||
      (routePath[i] === to && routePath[i + 1] === from)
    ) {
      return true
    }
  }
  
  return false
}
