import { useEffect, useRef } from 'react'
import { GameState } from '../game/types'
import { getNodeTypeIcon, getNodeTypeColor, getAvailableNodes } from '../game/utils/mapGenerator'

interface MapScreenProps {
  gameState: GameState
  onEnterNode: (nodeId: string) => void
}

export default function MapScreen({ gameState, onEnterNode }: MapScreenProps) {
  const availableNodes = getAvailableNodes(gameState.map)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Group nodes by floor
  const groupedNodes = gameState.map.reduce((acc, node) => {
    if (!acc[node.y]) acc[node.y] = []
    acc[node.y].push(node)
    return acc
  }, {} as Record<number, typeof gameState.map>)
  
  const maxFloor = Math.max(...Object.keys(groupedNodes).map(Number))
  const floors = Object.keys(groupedNodes).map(Number).sort((a, b) => b - a)
  
  // Auto-scroll to current floor area
  useEffect(() => {
    if (scrollRef.current) {
      if (gameState.currentFloor <= 1) {
        // New game: scroll to bottom immediately so player sees floor 1
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else {
        const currentFloorIndex = floors.indexOf(gameState.currentFloor - 1)
        if (currentFloorIndex >= 0) {
          const scrollTarget = (currentFloorIndex / floors.length) * scrollRef.current.scrollHeight
          scrollRef.current.scrollTo({ top: Math.max(0, scrollTarget - 200), behavior: 'smooth' })
        }
      }
    }
  }, [gameState.currentFloor])

  const getNodeBg = (type: string) => {
    switch (type) {
      case 'combat': return 'from-red-700 to-red-900'
      case 'elite': return 'from-purple-600 to-purple-900'
      case 'rest': return 'from-green-700 to-green-900'
      case 'shop': return 'from-yellow-600 to-yellow-900'
      case 'event': return 'from-blue-600 to-blue-900'
      case 'treasure': return 'from-amber-600 to-amber-900'
      case 'boss': return 'from-red-800 to-gray-900'
      default: return 'from-gray-600 to-gray-900'
    }
  }
  
  return (
    <div className="flex flex-col items-center py-4 animate-fade-in-up">
      <div className="mb-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-black mb-1 text-gray-100">Act {gameState.currentAct}</h2>
        <p className="text-gray-500 text-sm">Choose your path</p>
      </div>
      
      {/* Scrollable Map */}
      <div 
        ref={scrollRef}
        className="panel p-4 sm:p-6 w-full max-w-lg overflow-y-auto"
        style={{ maxHeight: '65vh' }}
      >
        {floors.map((floor, floorIdx) => {
          const nodes = groupedNodes[floor]
          const isCurrentFloor = availableNodes.some(n => n.y === floor)
          
          return (
            <div key={floor} className="mb-6 last:mb-0">
              {/* Floor label */}
              <div className={`text-xs font-bold mb-2 ${isCurrentFloor ? 'text-yellow-400' : 'text-gray-600'}`}>
                {floor === maxFloor ? '⚔ BOSS' : `Floor ${floor + 1}`}
              </div>
              
              {/* Nodes row */}
              <div className="flex justify-center gap-3 sm:gap-4">
                {nodes.map(node => {
                  const isAvailable = availableNodes.includes(node)
                  const isCompleted = node.completed
                  
                  return (
                    <button
                      key={node.id}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onEnterNode(node.id)}
                      className={`map-node bg-gradient-to-b ${getNodeBg(node.type)} ${
                        isCompleted ? 'map-node-completed' : 
                        isAvailable ? 'map-node-available' : 'map-node-unavailable'
                      }`}
                      title={`${node.type.charAt(0).toUpperCase() + node.type.slice(1)}${isCompleted ? ' (Done)' : ''}`}
                    >
                      <span className="text-xl">{getNodeTypeIcon(node.type)}</span>
                    </button>
                  )
                })}
              </div>
              
              {/* Connection lines (simple) */}
              {floorIdx < floors.length - 1 && (
                <div className="flex justify-center my-1.5">
                  <div className="w-px h-4 bg-gray-700" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="panel p-3 mt-4 w-full max-w-lg">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
          {[
            ['⚔️', 'Fight'],
            ['👹', 'Elite'],
            ['🔥', 'Rest'],
            ['🏪', 'Shop'],
            ['❓', 'Event'],
            ['📦', 'Loot'],
            ['💀', 'Boss'],
          ].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-base">{icon}</span>
              <span className="text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
