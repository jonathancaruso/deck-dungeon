import { GameState } from '../game/types'

interface GameOverScreenProps {
  runStats: GameState['runStats']
  onNewGame: () => void
}

export default function GameOverScreen({ runStats, onNewGame }: GameOverScreenProps) {
  const playTime = Math.floor((Date.now() - runStats.startTime) / 1000 / 60)
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in-up px-4">
      <div className="text-7xl mb-4">💀</div>
      <h1 className="text-4xl font-black text-red-400 mb-2">Defeat</h1>
      <p className="text-gray-400 mb-8">Your journey ends here...</p>
      
      <div className="panel p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4 text-gray-300">Run Stats</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            [runStats.floorsCleared, 'Floors', 'text-blue-400'],
            [runStats.enemiesKilled, 'Enemies', 'text-red-400'],
            [runStats.cardsPlayed, 'Cards Played', 'text-purple-400'],
            [runStats.damageDealt, 'Damage', 'text-orange-400'],
            [runStats.goldEarned, 'Gold', 'text-yellow-400'],
            [`${playTime}m`, 'Time', 'text-green-400'],
          ].map(([val, label, color]) => (
            <div key={label as string} className="panel p-3 text-center">
              <div className={`text-xl font-black ${color}`}>{val}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={onNewGame} className="game-button text-lg px-8 py-4 mt-8">
        🔄 Try Again
      </button>
    </div>
  )
}
