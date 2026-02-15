import { GameState } from '../game/types'

interface VictoryScreenProps {
  runStats: GameState['runStats']
  onNewGame: () => void
}

export default function VictoryScreen({ runStats, onNewGame }: VictoryScreenProps) {
  const playTime = Math.floor((Date.now() - runStats.startTime) / 1000 / 60) // minutes
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="mb-8">
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">Victory!</h1>
        <p className="text-xl text-gray-300">
          You have conquered the Deck Dungeon and emerged victorious!
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-600 rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6 text-yellow-300">Victorious Run Statistics</h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-800/50 rounded border border-yellow-600/30">
            <div className="text-2xl font-bold text-blue-400">{runStats.floorsCleared}</div>
            <div className="text-gray-300">Floors Cleared</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded border border-yellow-600/30">
            <div className="text-2xl font-bold text-red-400">{runStats.enemiesKilled}</div>
            <div className="text-gray-300">Enemies Defeated</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded border border-yellow-600/30">
            <div className="text-2xl font-bold text-purple-400">{runStats.cardsPlayed}</div>
            <div className="text-gray-300">Cards Played</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded border border-yellow-600/30">
            <div className="text-2xl font-bold text-orange-400">{runStats.damageDealt}</div>
            <div className="text-gray-300">Damage Dealt</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded border border-yellow-600/30">
            <div className="text-2xl font-bold text-yellow-400">{runStats.goldEarned}</div>
            <div className="text-gray-300">Gold Earned</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded border border-yellow-600/30">
            <div className="text-2xl font-bold text-green-400">{playTime}m</div>
            <div className="text-gray-300">Time Played</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-600/20 rounded border border-yellow-500/50">
          <div className="text-yellow-300 font-bold text-lg mb-2">🎯 Perfect Victory!</div>
          <div className="text-yellow-200 text-sm">
            You've mastered the art of deck building and strategic combat.
            Your tactical prowess has earned you a place among the greatest dungeon conquerors!
          </div>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <button 
          onClick={onNewGame}
          className="game-button text-xl px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500"
        >
          🌟 Ascend Again
        </button>
        
        <div className="text-gray-400 text-sm">
          <p>🎉 Congratulations on your victory!</p>
          <p>Ready for another challenge? The dungeon awaits your return!</p>
        </div>
      </div>
    </div>
  )
}