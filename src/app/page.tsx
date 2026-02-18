'use client'

import { useReducer, useEffect, useRef, useState } from 'react'
import { gameReducer, initialGameState } from '../game/utils/gameReducer'
import { getLifetimeStats, recordRunEnd } from '../game/utils/lifetimeStats'
import { recordDailyResult } from '../game/utils/dailyChallenge'
import MainMenu from '../components/MainMenu'
import StatsScreen from '../components/StatsScreen'
import MapScreen from '../components/MapScreen'
import CombatScreen from '../components/CombatScreen'
import CardRewardScreen from '../components/CardRewardScreen'
import RestScreen from '../components/RestScreen'
import GameOverScreen from '../components/GameOverScreen'
import VictoryScreen from '../components/VictoryScreen'
import ShopScreen from '../components/ShopScreen'
import EventScreen from '../components/EventScreen'
import TreasureScreen from '../components/TreasureScreen'
import { SoundProvider, useSoundContext } from '../hooks/SoundContext'

export default function Home() {
  return (
    <SoundProvider>
      <GameInner />
    </SoundProvider>
  )
}

function GameInner() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)
  const { play, muted, toggle } = useSoundContext()
  const prevPhase = useRef(gameState.gamePhase)
  const [showStats, setShowStats] = useState(false)
  const recordedRef = useRef(false)

  useEffect(() => {
    if (gameState.gamePhase !== 'menu') {
      dispatch({ type: 'SAVE_GAME' })
    }
  }, [gameState])

  // Sound effects on phase changes
  useEffect(() => {
    const prev = prevPhase.current
    const curr = gameState.gamePhase
    prevPhase.current = curr
    if (prev === curr) return

    if (curr === 'combat') play('boss_appear')
    else if (curr === 'game_over') play('defeat')
    else if (curr === 'victory') play('victory')
    else if (curr === 'card_reward') play('gold_gain')
    else if (curr === 'shop') play('button_click')
    else if (curr === 'rest') play('button_click')
    else if (curr === 'event') play('button_click')
  }, [gameState.gamePhase, play])

  // Clear save and record lifetime stats on game over or victory
  useEffect(() => {
    if (gameState.gamePhase === 'game_over' || gameState.gamePhase === 'victory') {
      localStorage.removeItem('deck-dungeon-save')
      if (!recordedRef.current) {
        recordedRef.current = true
        recordRunEnd(gameState, gameState.gamePhase === 'victory')
        if (gameState.dailyChallenge) {
          recordDailyResult(gameState, gameState.gamePhase === 'victory')
        }
      }
    } else if (gameState.gamePhase === 'map' || gameState.gamePhase === 'combat') {
      recordedRef.current = false
    }
  }, [gameState.gamePhase])

  const handleContinueGame = () => {
    const savedGame = localStorage.getItem('deck-dungeon-save')
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame)
        dispatch({ type: 'LOAD_GAME', gameState: parsedGame })
      } catch (e) {
        console.error('Failed to load saved game:', e)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* HUD Header */}
      {gameState.gamePhase !== 'menu' && (
        <header className="sticky top-0 z-40 px-3 py-2 border-b border-gray-800/80" style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
          backdropFilter: 'blur(12px)',
        }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="text-lg font-black text-purple-400 tracking-tight">⚔️ Deck Dungeon</div>
              {gameState.dailyChallenge && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-600/30 text-amber-400 border border-amber-500/40">
                  🏆 DAILY
                </span>
              )}
              <button
                onClick={toggle}
                className="text-lg opacity-60 hover:opacity-100 transition-opacity"
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="hud-bar">
                <span className="text-gray-400 text-xs">ACT</span>
                <span className="text-white">{gameState.currentAct}</span>
              </div>
              <div className="hud-bar">
                <span className="text-gray-400 text-xs">FLOOR</span>
                <span className="text-white">{gameState.currentFloor}</span>
              </div>
              {gameState.gamePhase !== 'combat' && (
                <div className="hud-bar">
                  <span className="text-red-400">♥</span>
                  <span className={gameState.player.hp < gameState.player.maxHp * 0.3 ? 'text-red-400' : 'text-green-400'}>
                    {gameState.player.hp}/{gameState.player.maxHp}
                  </span>
                </div>
              )}
              <div className="hud-bar">
                <span className="text-yellow-400">⬡</span>
                <span className="text-yellow-400">{gameState.player.gold}</span>
              </div>
              <div className="hud-bar">
                <span className="text-blue-400">🃏</span>
                <span className="text-blue-400">{gameState.player.deck.length}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-3 sm:p-4">
        {gameState.gamePhase === 'menu' && !showStats && (
          <MainMenu 
            onStartGame={() => dispatch({ type: 'START_NEW_GAME' })} 
            onContinueGame={handleContinueGame}
            onShowStats={() => setShowStats(true)}
            onStartDaily={() => dispatch({ type: 'START_DAILY_CHALLENGE' })}
          />
        )}

        {gameState.gamePhase === 'menu' && showStats && (
          <StatsScreen
            stats={getLifetimeStats()}
            onBack={() => setShowStats(false)}
          />
        )}
        
        {gameState.gamePhase === 'map' && (
          <MapScreen 
            gameState={gameState}
            onEnterNode={(nodeId) => dispatch({ type: 'ENTER_NODE', nodeId })}
          />
        )}
        
        {gameState.gamePhase === 'combat' && gameState.combatState && (
          <CombatScreen 
            combatState={gameState.combatState}
            onPlayCard={(cardId, targetEnemyId) => dispatch({ type: 'PLAY_CARD', cardId, targetEnemyId })}
            onEndTurn={() => dispatch({ type: 'END_TURN' })}
            onCombatEnd={() => {
              dispatch({ type: 'SET_PHASE', phase: 'card_reward' })
            }}
          />
        )}
        
        {gameState.gamePhase === 'card_reward' && (
          <CardRewardScreen 
            act={gameState.currentAct}
            onChooseCard={(cardId) => dispatch({ type: 'CHOOSE_CARD_REWARD', cardId })}
          />
        )}
        
        {gameState.gamePhase === 'rest' && (
          <RestScreen 
            player={gameState.player}
            onRestHeal={() => dispatch({ type: 'REST_HEAL' })}
            onRestUpgrade={(cardId) => dispatch({ type: 'REST_UPGRADE', cardId })}
            onRestRemove={(cardId) => dispatch({ type: 'REST_REMOVE', cardId })}
          />
        )}
        
        {gameState.gamePhase === 'shop' && (
          <ShopScreen
            player={gameState.player}
            act={gameState.currentAct}
            onBuyCard={(card) => dispatch({ type: 'BUY_CARD', card, price: card.rarity === 'rare' ? 150 : card.rarity === 'uncommon' ? 100 : 50 })}
            onBuyPotion={(potion) => dispatch({ type: 'BUY_POTION', potion, price: 50 })}
            onRemoveCard={(cardId) => dispatch({ type: 'SHOP_REMOVE_CARD', cardId, price: 75 })}
            onHeal={(amount) => dispatch({ type: 'SHOP_HEAL', amount, price: 30 })}
            onLeave={() => dispatch({ type: 'LEAVE_SHOP' })}
          />
        )}
        
        {gameState.gamePhase === 'event' && (
          <EventScreen
            player={gameState.player}
            act={gameState.currentAct}
            onGainGold={(amount) => dispatch({ type: 'EVENT_GAIN_GOLD', amount })}
            onHeal={(amount) => dispatch({ type: 'EVENT_HEAL', amount })}
            onTakeDamage={(amount) => dispatch({ type: 'EVENT_DAMAGE', amount })}
            onGainMaxHp={(amount) => dispatch({ type: 'EVENT_GAIN_MAX_HP', amount })}
            onLeave={() => dispatch({ type: 'LEAVE_EVENT' })}
          />
        )}
        
        {gameState.gamePhase === 'treasure' && gameState.treasureReward && (
          <TreasureScreen
            treasureReward={gameState.treasureReward}
            onCollect={() => dispatch({ type: 'COLLECT_TREASURE' })}
          />
        )}
        
        {gameState.gamePhase === 'game_over' && (
          <GameOverScreen 
            runStats={gameState.runStats}
            onNewGame={() => dispatch({ type: 'START_NEW_GAME' })}
            dailyChallenge={!!gameState.dailyChallenge}
          />
        )}
        
        {gameState.gamePhase === 'victory' && (
          <VictoryScreen 
            runStats={gameState.runStats}
            onNewGame={() => dispatch({ type: 'START_NEW_GAME' })}
            dailyChallenge={!!gameState.dailyChallenge}
          />
        )}
      </main>
    </div>
  )
}
