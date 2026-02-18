import { MapNode, NodeType } from '../types'

type RngFn = () => number

export function generateMap(act: number, rng?: RngFn): MapNode[] {
  const rand = rng || Math.random
  const nodes: MapNode[] = []
  const floors = 15
  const pathsPerFloor = 3
  
  // Generate nodes for each floor
  for (let floor = 0; floor < floors; floor++) {
    const y = floor
    
    for (let path = 0; path < pathsPerFloor; path++) {
      const x = path
      const nodeId = `${act}-${floor}-${path}`
      
      let nodeType: NodeType
      
      // Determine node type based on floor
      if (floor === 0) {
        nodeType = 'combat' // Always start with combat
      } else if (floor === floors - 1) {
        nodeType = 'boss' // Always end with boss
      } else if (floor === Math.floor(floors / 2)) {
        nodeType = rand() < 0.3 ? 'rest' : getRandomNodeType(rand)
      } else {
        nodeType = getRandomNodeType(rand)
      }
      
      const node: MapNode = {
        id: nodeId,
        type: nodeType,
        x,
        y,
        connections: [],
        completed: false,
        available: floor === 0 // Only first floor is initially available
      }
      
      nodes.push(node)
    }
  }
  
  // Connect nodes
  for (let floor = 0; floor < floors - 1; floor++) {
    const currentFloorNodes = nodes.filter(n => n.y === floor)
    const nextFloorNodes = nodes.filter(n => n.y === floor + 1)
    
    currentFloorNodes.forEach((currentNode, index) => {
      // Each node connects to 1-2 nodes in the next floor
      const connections = rand() < 0.6 ? 1 : 2
      
      for (let i = 0; i < connections; i++) {
        let targetIndex = index + (i === 0 ? 0 : (rand() < 0.5 ? -1 : 1))
        targetIndex = Math.max(0, Math.min(nextFloorNodes.length - 1, targetIndex))
        
        const targetNode = nextFloorNodes[targetIndex]
        if (!currentNode.connections.includes(targetNode.id)) {
          currentNode.connections.push(targetNode.id)
        }
      }
    })
  }
  
  return nodes
}

function getRandomNodeType(rand: RngFn = Math.random): NodeType {
  const weights = {
    combat: 0.5,
    elite: 0.1,
    rest: 0.1,
    shop: 0.1,
    event: 0.15,
    treasure: 0.05
  }
  
  const random = rand()
  let cumulative = 0
  
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight
    if (random <= cumulative) {
      return type as NodeType
    }
  }
  
  return 'combat'
}

export function getAvailableNodes(nodes: MapNode[], completedNodeId?: string): MapNode[] {
  if (!completedNodeId) {
    return nodes.filter(n => n.available && !n.completed)
  }
  
  const completedNode = nodes.find(n => n.id === completedNodeId)
  if (!completedNode) return nodes.filter(n => n.available)
  
  // Mark completed node as completed
  completedNode.completed = true
  
  // Mark all other nodes on the same floor as unavailable
  nodes.forEach(n => {
    if (n.y === completedNode.y && n.id !== completedNode.id) {
      n.available = false
    }
  })
  
  // Make connected nodes available
  completedNode.connections.forEach(connectionId => {
    const connectedNode = nodes.find(n => n.id === connectionId)
    if (connectedNode && !connectedNode.completed) {
      connectedNode.available = true
    }
  })
  
  return nodes.filter(n => n.available && !n.completed)
}

export function getNodeTypeIcon(nodeType: NodeType): string {
  switch (nodeType) {
    case 'combat': return '⚔️'
    case 'elite': return '👹'
    case 'rest': return '🔥'
    case 'shop': return '🏪'
    case 'event': return '❓'
    case 'treasure': return '📦'
    case 'boss': return '💀'
    default: return '⚫'
  }
}

export function getNodeTypeColor(nodeType: NodeType): string {
  switch (nodeType) {
    case 'combat': return 'bg-red-600'
    case 'elite': return 'bg-purple-600'
    case 'rest': return 'bg-green-600'
    case 'shop': return 'bg-yellow-600'
    case 'event': return 'bg-blue-600'
    case 'treasure': return 'bg-amber-600'
    case 'boss': return 'bg-gray-900'
    default: return 'bg-gray-600'
  }
}