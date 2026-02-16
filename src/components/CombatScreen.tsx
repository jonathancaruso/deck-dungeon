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
  
  useEffect(() => {
    if (combatState.combatEnded && combatState.victory) {
      const timer = setTimeout(() => onCombatEnd(), 2000)
      return () => clearTimeout(timer)
    }
  }, [combatState.combatEnded, combatState.victory, onCombatEnd])
  
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
      setSelectedCard(selectedCard?.id === card.id ? null : card)
    } else {
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
          <span className="ml-0.5">{amount}</span>
        </div>
      ))
  }
  
  const hpPercent = (combatState.player.hp / combatState.player.maxHp) * 100
  
  return (
    <div className={`flex flex-col h-full min-h-[80vh] ${screenShake ? 'screen-shake' : ''}`}>
      
      {/* Turn & Energy Header */}
      <div className="panel p-3 mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm font-medium">Turn {combatState.turn}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: combatState.maxEnergy }).map((_, i) => (
              <div key={i} className={`energy-orb ${i >= combatState.energy ? 'opacity-25 grayscale' : ''}`}
                style={{ width: 36, height: 36, fontSize: '14px' }}>
                {i < combatState.energy ? '⚡' : '·'}
              </div>
            ))}
          </div>
          <span className="text-amber-400 font-bold text-sm">{combatState.energy}/{combatState.maxEnergy}</span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Draw: {combatState.drawPile.length}</span>
          <span>·</span>
          <span>Discard: {combatState.discardPile.length}</span>
        </div>
      </div>
      
      {/* Enemy Area */}
      <div className="flex-1 mb-4 flex items-start justify-center">
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
      
      {/* Player Area (bottom) */}
      <div className="panel p-4 border-t-2 border-gray-700/40 animate-slide-up">
        {/* Player Stats Row */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-lg">♥</span>
            <div className="hp-bar flex-1 max-w-[200px] h-4">
              <div className="hp-fill hp-fill-player" style={{ width: `${hpPercent}%` }} />
            </div>
            <span className={`text-sm font-bold ${hpPercent < 30 ? 'text-red-400' : 'text-green-400'}`}>
              {combatState.player.hp}/{combatState.player.maxHp}
            </span>
            
            {/* Player Status Effects */}
            <div className="flex gap-1 flex-wrap">
              {renderStatusEffects(combatState.player.statusEffects)}
            </div>
          </div>
          
          <button
            onClick={onEndTurn}
            disabled={combatState.combatEnded || !combatState.isPlayerTurn}
            className="game-button-end-turn"
          >
            End Turn
          </button>
        </div>
        
        {/* Hand */}
        <div className="card-fan flex justify-center items-end min-h-[180px] sm:min-h-[200px] pb-1 overflow-x-auto">
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
          <div className="mt-2 text-center text-yellow-400 text-sm font-medium animate-fade-in-up">
            ⚔️ <strong>{selectedCard.name}</strong> — Tap an enemy to attack!
          </div>
        )}
      </div>
      
      {/* Combat End Overlay */}
      {combatState.combatEnded && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 animate-fade-in-up">
          <div className="panel p-8 text-center max-w-md mx-4">
            {combatState.victory ? (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-black text-green-400 mb-3">Victory!</h2>
                <p className="text-gray-400 mb-4">Enemies defeated! Choose a card reward.</p>
                <div className="text-xs text-gray-600">Proceeding...</div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💀</div>
                <h2 className="text-3xl font-black text-red-400 mb-3">Defeat</h2>
                <p className="text-gray-400 mb-6">Your journey ends here...</p>
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
