interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in-up">
      <div className="mb-10">
        <div className="text-7xl mb-4">⚔️</div>
        <h1 className="text-5xl sm:text-6xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          Deck Dungeon
        </h1>
        <p className="text-lg text-gray-400 max-w-md mx-auto">
          A roguelike deck-building adventure. Build your deck, climb the tower, conquer the dungeon.
        </p>
      </div>
      
      <button 
        onClick={onStartGame}
        className="game-button text-xl px-10 py-5 mb-8 bg-gradient-to-b from-purple-600 to-purple-800 border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20"
      >
        ⚡ Start New Run
      </button>
      
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 max-w-sm">
        <div className="panel p-3 text-center">
          <div className="text-2xl mb-1">🗺️</div>
          <div>3 Acts</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-2xl mb-1">⚔️</div>
          <div>Strategic Combat</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-2xl mb-1">🃏</div>
          <div>Deck Building</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-2xl mb-1">💀</div>
          <div>Boss Fights</div>
        </div>
      </div>
    </div>
  )
}
