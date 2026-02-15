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

export default function Home() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

  // Auto-save game state
  useEffect(() => {
    if (gameState.gamePhase !== 'menu') {
      dispatch({ type: 'SAVE_GAME' })
    }
  }, [gameState])

  // Load saved game on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">⚔️ Deck Dungeon</h1>
          
          {gameState.gamePhase !== 'menu' && (
            <div className="flex items-center space-x-6">
              <div className="text-sm">
                <span className="text-gray-400">Act:</span>{' '}
                <span className="text-white font-semibold">{gameState.currentAct}/3</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Floor:</span>{' '}
                <span className="text-white font-semibold">{gameState.currentFloor}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">HP:</span>{' '}
                <span className={`font-semibold ${
                  gameState.player.hp < gameState.player.maxHp * 0.3 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {gameState.player.hp}/{gameState.player.maxHp}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Gold:</span>{' '}
                <span className="text-yellow-400 font-semibold">{gameState.player.gold}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Deck:</span>{' '}
                <span className="text-blue-400 font-semibold">{gameState.player.deck.length}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        {gameState.gamePhase === 'menu' && (
          <MainMenu onStartGame={() => dispatch({ type: 'START_NEW_GAME' })} />
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