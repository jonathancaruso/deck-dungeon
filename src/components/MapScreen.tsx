import { GameState } from '../game/types'
import { getNodeTypeIcon, getNodeTypeColor, getAvailableNodes } from '../game/utils/mapGenerator'

interface MapScreenProps {
  gameState: GameState
  onEnterNode: (nodeId: string) => void
}

export default function MapScreen({ gameState, onEnterNode }: MapScreenProps) {
  const availableNodes = getAvailableNodes(gameState.map)
  
  const renderPath = (fromNode: any, toNode: any) => {
    const dx = toNode.x - fromNode.x
    const dy = toNode.y - fromNode.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    
    return (
      <div
        key={`path-${fromNode.id}-${toNode.id}`}
        className="map-path"
        style={{
          left: `${fromNode.x * 120 + 60}px`,
          top: `${fromNode.y * 120 + 60}px`,
          width: `${distance * 120}px`,
          height: '2px',
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 50%'
        }}
      />
    )
  }
  
  const groupedNodes = gameState.map.reduce((acc, node) => {
    if (!acc[node.y]) acc[node.y] = []
    acc[node.y].push(node)
    return acc
  }, {} as Record<number, typeof gameState.map>)
  
  const maxFloor = Math.max(...Object.keys(groupedNodes).map(Number))
  
  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-2">Act {gameState.currentAct} - The Ascent</h2>
        <p className="text-gray-400">Choose your path through the dungeon</p>
      </div>
      
      <div className="relative bg-gray-800/50 rounded-lg p-8 border border-gray-700" style={{ minHeight: '600px', minWidth: '500px' }}>
        {/* Render paths first (background) */}
        {gameState.map.map(node => 
          node.connections.map(connectionId => {
            const connectedNode = gameState.map.find(n => n.id === connectionId)
            if (!connectedNode) return null
            return renderPath(node, connectedNode)
          })
        ).flat()}
        
        {/* Render nodes by floor (bottom to top) */}
        {Object.keys(groupedNodes)
          .map(Number)
          .sort((a, b) => b - a) // Reverse order (bottom to top)
          .map(floor => (
            <div key={floor} className="flex justify-center mb-4" style={{ marginBottom: '100px' }}>
              <div className="flex space-x-8">
                {groupedNodes[floor].map(node => {
                  const isAvailable = availableNodes.includes(node)
                  const isCompleted = node.completed
                  const isCurrentFloor = floor === gameState.currentFloor - 1
                  
                  return (
                    <div
                      key={node.id}
                      className={`map-node ${getNodeTypeColor(node.type)} ${
                        isCompleted ? 'map-node-completed' : 
                        isAvailable ? 'map-node-available' : 'map-node-unavailable'
                      } ${isCurrentFloor ? 'ring-2 ring-yellow-400' : ''}`}
                      onClick={() => isAvailable && onEnterNode(node.id)}
                      style={{
                        position: 'relative',
                        zIndex: 10
                      }}
                    >
                      <span className="text-lg">{getNodeTypeIcon(node.type)}</span>
                      
                      {/* Node tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                        {isCompleted && ' (Completed)'}
                        {!isAvailable && !isCompleted && ' (Locked)'}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Floor label */}
              <div className="absolute right-0 text-gray-500 text-sm font-medium" style={{ top: `${(maxFloor - floor) * 100 + 20}px` }}>
                Floor {floor + 1}
              </div>
            </div>
          ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚔️</span>
            <span>Combat</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">👹</span>
            <span>Elite</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔥</span>
            <span>Rest Site</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏪</span>
            <span>Shop</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">❓</span>
            <span>Event</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📦</span>
            <span>Treasure</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">💀</span>
            <span>Boss</span>
          </div>
        </div>
      </div>
    </div>
  )
}