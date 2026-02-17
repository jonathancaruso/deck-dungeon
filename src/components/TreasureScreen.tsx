import { GameState, Relic } from '../game/types'

interface TreasureScreenProps {
  treasureReward: { gold: number; relic?: Relic }
  onCollect: () => void
}

export default function TreasureScreen({ treasureReward, onCollect }: TreasureScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in-up">
      <div className="text-6xl mb-4">📦</div>
      <h2 className="text-2xl font-black text-amber-400 mb-6">Treasure Found!</h2>
      
      <div className="panel p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-900/30 border border-yellow-700/30">
          <span className="text-yellow-400 font-bold text-lg">💰 Gold</span>
          <span className="text-yellow-300 font-black text-xl">+{treasureReward.gold}</span>
        </div>
        
        {treasureReward.relic && (
          <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-700/30">
            <div className="text-purple-400 font-bold text-lg mb-1">🔮 Relic</div>
            <div className="text-gray-200 font-bold">{treasureReward.relic.name}</div>
            <div className="text-gray-400 text-sm mt-1">{treasureReward.relic.description}</div>
          </div>
        )}
      </div>
      
      <button
        onClick={onCollect}
        className="game-button mt-6 px-8 py-3 text-lg font-bold"
      >
        Continue
      </button>
    </div>
  )
}
