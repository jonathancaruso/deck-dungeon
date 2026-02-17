'use client'

import { useReducer, useEffect } from 'react'
import { gameReducer, initialGameState } from '../game/utils/gameReducer'
import MainMenu from '../components/MainMenu'
import MapScreen from '../components/MapScreen'
import CombatScreen from '../components/CombatScreen'
import CardRewardScreen from '../components/CardRewardScreen'
import RestScreen from '../components/RestScreen'
import GameOverScreen from '../components/GameOverScreen'
import VictoryScreen from '../components/VictoryScreen'
import ShopScreen from '../components/ShopScreen'
import EventScreen from '../components/EventScreen'

export default function Home() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

  useEffect(() => {
    if (gameState.gamePhase !== 'menu') {
      dispatch({ type: 'SAVE_GAME' })
    }
  }, [gameState])

  // Clear save on game over or victory
  useEffect(() => {
    if (gameState.gamePhase === 'game_over' || gameState.gamePhase === 'victory') {
      localStorage.removeItem('deck-dungeon-save')
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
            <div className="text-lg font-black text-purple-400 tracking-tight">⚔️ Deck Dungeon</div>
            
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
        {gameState.gamePhase === 'menu' && (
          <MainMenu 
            onStartGame={() => dispatch({ type: 'START_NEW_GAME' })} 
            onContinueGame={handleContinueGame}
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
        
        {gameState.gamePhase === 'game_over' && (
          <GameOverScreen 
            runStats={gameState.runStats}
            onNewGame={() => dispatch({ type: 'START_NEW_GAME' })}
          />
        )}
        
        {gameState.gamePhase === 'victory' && (
          <VictoryScreen 
            runStats={gameState.runStats}
            onNewGame={() => dispatch({ type: 'START_NEW_GAME' })}
          />
        )}
      </main>
    </div>
  )
}
