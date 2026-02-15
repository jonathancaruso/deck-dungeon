interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          ⚔️ Deck Dungeon
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          A roguelike deck-building adventure inspired by Slay the Spire. 
          Build your deck, climb the tower, and conquer the dungeon!
        </p>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={onStartGame}
          className="game-button text-xl px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
        >
          ⚡ Start New Run
        </button>
        
        <div className="text-gray-400 text-sm space-y-2">
          <p>🎯 Navigate through 3 acts of increasing difficulty</p>
          <p>⚔️ Battle enemies with strategic card play</p>
          <p>🃏 Collect powerful cards and relics</p>
          <p>💀 Survive to reach the final boss</p>
        </div>
      </div>
      
      <div className="mt-16 text-gray-500 text-sm">
        <p>Tips: Click cards to play them • Target enemies for attack cards</p>
        <p>Mobile: Tap cards and enemies • Optimized for touch</p>
      </div>
    </div>
  )
}