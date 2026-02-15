import { useState, useEffect } from 'react'
import { CombatState, Card, Enemy, StatusEffect } from '../game/types'
import CardComponent from './CardComponent'
import EnemyComponent from './EnemyComponent'

interface CombatScreenProps {
  combatState: CombatState
  onPlayCard: (cardId: string, targetEnemyId?: string) => void
  onEndTurn: () => void
  onCombatEnd: () => void
}

export default function CombatScreen({ combatState, onPlayCard, onEndTurn, onCombatEnd }: CombatScreenProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [screenShake, setScreenShake] = useState(false)
  
  // Check for combat end
  useEffect(() => {
    if (combatState.combatEnded && combatState.victory) {
      const timer = setTimeout(() => {
        onCombatEnd()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [combatState.combatEnded, combatState.victory, onCombatEnd])
  
  // Handle screen shake on big damage
  useEffect(() => {
    if (combatState.player.hp < 20) {
      setScreenShake(true)
      const timer = setTimeout(() => setScreenShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [combatState.player.hp])
  
  const handleCardClick = (card: Card) => {
    if (combatState.combatEnded || !combatState.isPlayerTurn) return
    
    if (combatState.energy < card.cost) return
    
    if (card.type === 'attack') {
      if (selectedCard?.id === card.id) {
        setSelectedCard(null)
      } else {
        setSelectedCard(card)
      }
    } else {
      // Non-attack cards can be played immediately
      onPlayCard(card.id)
      setSelectedCard(null)
    }
  }
  
  const handleEnemyClick = (enemy: Enemy) => {
    if (!selectedCard || combatState.combatEnded || !combatState.isPlayerTurn) return
    if (enemy.hp <= 0) return
    
    onPlayCard(selectedCard.id, enemy.id)
    setSelectedCard(null)
  }
  
  const aliveEnemies = combatState.enemies.filter(e => e.hp > 0)
  
  const renderStatusEffects = (statusEffects: Partial<Record<StatusEffect, number>>) => {
    return Object.entries(statusEffects)
      .filter(([_, amount]) => amount > 0)
      .map(([effect, amount]) => (
        <div key={effect} className={`status-effect status-${effect}`}>
          {effect === 'strength' && '💪'}
          {effect === 'weak' && '🤒'}
          {effect === 'vulnerable' && '🎯'}
          {effect === 'poison' && '☠️'}
          {effect === 'regen' && '💚'}
          {effect === 'thorns' && '🌹'}
          {effect === 'ritual' && '🔮'}
          {amount}
        </div>
      ))
  }
  
  return (
    <div className={`flex flex-col h-full ${screenShake ? 'screen-shake' : ''}`}>
      {/* Combat Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">
              Turn {combatState.turn}
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: combatState.energy }).map((_, i) => (
                <div key={i} className="energy-orb">
                  ⚡
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Draw: {combatState.drawPile.length} • Discard: {combatState.discardPile.length}
            </div>
            <button
              onClick={onEndTurn}
              disabled={combatState.combatEnded || !combatState.isPlayerTurn}
              className="game-button"
            >
              End Turn
            </button>
          </div>
        </div>
      </div>
      
      {/* Enemy Area */}
      <div className="flex-1 mb-6">
        <div className="flex flex-wrap justify-center gap-4">
          {combatState.enemies.map(enemy => (
            <EnemyComponent
              key={enemy.id}
              enemy={enemy}
              isTargetable={selectedCard?.type === 'attack' && enemy.hp > 0}
              onClick={() => handleEnemyClick(enemy)}
            />
          ))}
        </div>
      </div>
      
      {/* Player Area */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        {/* Player Stats */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">❤️</span>
              <div className="hp-bar w-32 h-3">
                <div 
                  className="hp-fill"
                  style={{ width: `${(combatState.player.hp / combatState.player.maxHp) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {combatState.player.hp}/{combatState.player.maxHp}
              </span>
            </div>
            
            {/* Player Status Effects */}
            <div className="flex space-x-1">
              {renderStatusEffects(combatState.player.statusEffects)}
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            Energy: {combatState.energy}/{combatState.maxEnergy}
          </div>
        </div>
        
        {/* Hand */}
        <div className="card-fan flex justify-center space-x-1 min-h-[120px]">
          {combatState.hand.map((card, index) => (
            <CardComponent
              key={`${card.id}-${index}`}
              card={card}
              isPlayable={combatState.energy >= card.cost && combatState.isPlayerTurn && !combatState.combatEnded}
              isSelected={selectedCard?.id === card.id}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
        
        {selectedCard && (
          <div className="mt-4 text-center text-yellow-400 text-sm">
            Selected: <strong>{selectedCard.name}</strong> - Click an enemy to attack!
          </div>
        )}
      </div>
      
      {/* Combat End Overlay */}
      {combatState.combatEnded && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center max-w-md">
            {combatState.victory ? (
              <>
                <h2 className="text-3xl font-bold text-green-400 mb-4">Victory! 🎉</h2>
                <p className="text-gray-300 mb-6">
                  Enemies defeated! Choose a card reward to continue.
                </p>
                <div className="text-sm text-gray-400">
                  Proceeding to card rewards...
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-red-400 mb-4">Defeat 💀</h2>
                <p className="text-gray-300 mb-6">
                  Your journey ends here...
                </p>
                <button onClick={() => window.location.reload()} className="game-button">
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}