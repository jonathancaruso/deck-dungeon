import { GameState } from '../game/types'

interface GameOverScreenProps {
  runStats: GameState['runStats']
  onNewGame: () => void
}

export default function GameOverScreen({ runStats, onNewGame }: GameOverScreenProps) {
  const playTime = Math.floor((Date.now() - runStats.startTime) / 1000 / 60) // minutes
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="mb-8">
        <div className="text-8xl mb-4">💀</div>
        <h1 className="text-4xl font-bold text-red-400 mb-2">Defeat</h1>
        <p className="text-xl text-gray-300">
          Your journey through the dungeon has come to an end...
        </p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6">Run Statistics</h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-blue-400">{runStats.floorsCleared}</div>
            <div className="text-gray-400">Floors Cleared</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-red-400">{runStats.enemiesKilled}</div>
            <div className="text-gray-400">Enemies Defeated</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-purple-400">{runStats.cardsPlayed}</div>
            <div className="text-gray-400">Cards Played</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-orange-400">{runStats.damageDealt}</div>
            <div className="text-gray-400">Damage Dealt</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-yellow-400">{runStats.goldEarned}</div>
            <div className="text-gray-400">Gold Earned</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-green-400">{playTime}m</div>
            <div className="text-gray-400">Time Played</div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <button 
          onClick={onNewGame}
          className="game-button text-xl px-8 py-4"
        >
          🔄 Try Again
        </button>
        
        <div className="text-gray-400 text-sm">
          <p>💡 Learn from defeat and ascend higher next time!</p>
          <p>Each run teaches new strategies and card synergies.</p>
        </div>
      </div>
    </div>
  )
}