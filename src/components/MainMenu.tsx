import { useEffect, useState } from 'react'
import { GameState } from '../game/types'
import { useSoundContext } from '../hooks/SoundContext'
import { hasCompletedToday, getTodayResult } from '../game/utils/dailyChallenge'
import { todayLabel } from '../game/utils/seededRng'

interface MainMenuProps {
  onStartGame: () => void
  onContinueGame?: () => void
  onShowStats?: () => void
  onStartDaily?: () => void
}

export default function MainMenu({ onStartGame, onContinueGame, onShowStats, onStartDaily }: MainMenuProps) {
  const { muted, toggle, play } = useSoundContext()
  const [hasSave, setHasSave] = useState(false)
  const [saveInfo, setSaveInfo] = useState<{ act: number; floor: number; hp: number; maxHp: number } | null>(null)
  const [dailyDone, setDailyDone] = useState(false)
  const [dailyScore, setDailyScore] = useState<number | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('deck-dungeon-save')
      if (saved) {
        const parsed: GameState = JSON.parse(saved)
        if (parsed.gamePhase !== 'menu' && parsed.gamePhase !== 'game_over' && parsed.gamePhase !== 'victory') {
          setHasSave(true)
          setSaveInfo({
            act: parsed.currentAct,
            floor: parsed.currentFloor,
            hp: parsed.player.hp,
            maxHp: parsed.player.maxHp,
          })
        }
      }
    } catch {}
    // Check daily challenge
    setDailyDone(hasCompletedToday())
    const result = getTodayResult()
    if (result) setDailyScore(result.score)
  }, [])

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
      
      {hasSave && onContinueGame && (
        <button 
          onClick={onContinueGame}
          className="game-button text-xl px-10 py-5 mb-4 bg-gradient-to-b from-green-600 to-green-800 border-green-400/50 hover:shadow-xl hover:shadow-green-500/20"
        >
          ▶ Continue Run
          {saveInfo && (
            <span className="block text-sm text-green-300/70 mt-1">
              Act {saveInfo.act} · Floor {saveInfo.floor} · {saveInfo.hp}/{saveInfo.maxHp} HP
            </span>
          )}
        </button>
      )}
      
      <button 
        onClick={() => {
          localStorage.removeItem('deck-dungeon-save')
          play('button_click')
          onStartGame()
        }}
        className={`game-button text-xl px-10 py-5 mb-4 bg-gradient-to-b from-purple-600 to-purple-800 border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20 ${hasSave ? 'opacity-80' : ''}`}
      >
        ⚡ {hasSave ? 'New Run' : 'Start New Run'}
      </button>
      
      {onStartDaily && (
        <button
          onClick={() => {
            if (dailyDone) return
            play('button_click')
            localStorage.removeItem('deck-dungeon-save')
            onStartDaily()
          }}
          disabled={dailyDone}
          className={`game-button text-lg px-10 py-4 mb-8 bg-gradient-to-b ${
            dailyDone
              ? 'from-gray-600 to-gray-800 border-gray-500/50 opacity-60 cursor-not-allowed'
              : 'from-amber-600 to-amber-800 border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/20'
          }`}
        >
          🏆 Daily Challenge
          <span className="block text-sm mt-1 opacity-80">
            {dailyDone
              ? `Completed! Score: ${dailyScore}`
              : `${todayLabel()} · Same map for everyone`}
          </span>
        </button>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        {onShowStats && (
          <button
            onClick={() => { play('button_click'); onShowStats() }}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            📊 Stats
          </button>
        )}
        <button
          onClick={toggle}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {muted ? '🔇 Sound Off' : '🔊 Sound On'}
        </button>
      </div>

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
