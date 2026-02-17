import { useState, useEffect, useRef } from 'react'
import { CombatState, Card, Enemy, StatusEffect } from '../game/types'
import CardComponent from './CardComponent'
import EnemyComponent from './EnemyComponent'

interface DamagePopup {
  id: number
  enemyId?: string
  isPlayer?: boolean
  amount: number
  type: 'damage' | 'heal' | 'block'
}

interface SlashEffect {
  id: number
  enemyId: string
  variant: number
}

interface CombatScreenProps {
  combatState: CombatState
  onPlayCard: (cardId: string, targetEnemyId?: string) => void
  onEndTurn: () => void
  onCombatEnd: () => void
}

export default function CombatScreen({ combatState, onPlayCard, onEndTurn, onCombatEnd }: CombatScreenProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [screenShake, setScreenShake] = useState(false)
  const [hitEnemies, setHitEnemies] = useState<Set<string>>(new Set())
  const [playerHit, setPlayerHit] = useState(false)
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([])
  const [turnAnimating, setTurnAnimating] = useState(false)
  const [showTurnBanner, setShowTurnBanner] = useState<'player' | 'enemy' | null>(null)
  const [playingCardId, setPlayingCardId] = useState<string | null>(null)
  const [slashEffects, setSlashEffects] = useState<SlashEffect[]>([])
  const [blockGained, setBlockGained] = useState(false)
  const [shieldFlash, setShieldFlash] = useState(false)
  const prevEnemyHp = useRef<Record<string, number>>({})
  const prevPlayerHp = useRef(combatState.player.hp)
  const prevIsPlayerTurn = useRef(combatState.isPlayerTurn)
  const prevEnergy = useRef(combatState.energy)
  const prevPlayerBlock = useRef(0)
  const popupCounter = useRef(0)
  const slashCounter = useRef(0)
  const isFirstRender = useRef(true)
  
  useEffect(() => {
    if (combatState.combatEnded && combatState.victory) {
      const timer = setTimeout(() => onCombatEnd(), 2000)
      return () => clearTimeout(timer)
    }
  }, [combatState.combatEnded, combatState.victory, onCombatEnd])

  // Detect HP changes for damage/heal popups + hit animations + slash effects
  useEffect(() => {
    const newPopups: DamagePopup[] = []
    const newSlashes: SlashEffect[] = []
    
    // Check enemy HP changes
    combatState.enemies.forEach(enemy => {
      const prevHp = prevEnemyHp.current[enemy.id]
      if (prevHp !== undefined && enemy.hp < prevHp) {
        const dmg = prevHp - enemy.hp
        newPopups.push({ id: popupCounter.current++, enemyId: enemy.id, amount: dmg, type: 'damage' })
        newSlashes.push({ id: slashCounter.current++, enemyId: enemy.id, variant: Math.floor(Math.random() * 3) })
        setHitEnemies(prev => new Set(prev).add(enemy.id))
        setTimeout(() => setHitEnemies(prev => { const s = new Set(prev); s.delete(enemy.id); return s }), 400)
      }
      prevEnemyHp.current[enemy.id] = enemy.hp
    })
    
    if (newSlashes.length > 0) {
      setSlashEffects(prev => [...prev, ...newSlashes])
      setTimeout(() => setSlashEffects(prev => prev.filter(s => !newSlashes.find(ns => ns.id === s.id))), 600)
    }
    
    // Check player HP changes
    if (prevPlayerHp.current > combatState.player.hp) {
      const dmg = prevPlayerHp.current - combatState.player.hp
      newPopups.push({ id: popupCounter.current++, isPlayer: true, amount: dmg, type: 'damage' })
      setPlayerHit(true)
      setScreenShake(true)
      setTimeout(() => { setPlayerHit(false); setScreenShake(false) }, 500)
    } else if (prevPlayerHp.current < combatState.player.hp) {
      const heal = combatState.player.hp - prevPlayerHp.current
      newPopups.push({ id: popupCounter.current++, isPlayer: true, amount: heal, type: 'heal' })
    }
    prevPlayerHp.current = combatState.player.hp
    
    if (newPopups.length > 0) {
      setDamagePopups(prev => [...prev, ...newPopups])
      setTimeout(() => {
        setDamagePopups(prev => prev.filter(p => !newPopups.find(np => np.id === p.id)))
      }, 900)
    }
  }, [combatState])

  // Energy spend animation
  useEffect(() => {
    if (!isFirstRender.current && combatState.energy < prevEnergy.current) {
      setBlockGained(false) // reset
      // If energy went down, a card was played — could be block
    }
    prevEnergy.current = combatState.energy
  }, [combatState.energy])

  // Turn change banner
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevIsPlayerTurn.current = combatState.isPlayerTurn
      return
    }
    if (combatState.isPlayerTurn !== prevIsPlayerTurn.current) {
      setShowTurnBanner(combatState.isPlayerTurn ? 'player' : 'enemy')
      setTimeout(() => setShowTurnBanner(null), 1200)
      if (combatState.isPlayerTurn) {
        setTurnAnimating(true)
        setTimeout(() => setTurnAnimating(false), 800)
      }
      prevIsPlayerTurn.current = combatState.isPlayerTurn
    }
  }, [combatState.isPlayerTurn, combatState.turn])
  
  // Detect block gain for shield flash
  useEffect(() => {
    const currentBlock = (combatState.player as any).block || 0
    if (currentBlock > prevPlayerBlock.current && currentBlock > 0) {
      setShieldFlash(true)
      setBlockGained(true)
      const blockAmt = currentBlock - prevPlayerBlock.current
      setDamagePopups(prev => [...prev, { id: popupCounter.current++, isPlayer: true, amount: blockAmt, type: 'block' }])
      setTimeout(() => {
        setShieldFlash(false)
        setBlockGained(false)
        setDamagePopups(prev => prev.slice(1))
      }, 700)
    }
    prevPlayerBlock.current = currentBlock
  }, [(combatState.player as any).block])

  const handleCardClick = (card: Card) => {
    if (combatState.combatEnded || !combatState.isPlayerTurn) return
    if (combatState.energy < card.cost) return
    
    if (card.type === 'attack') {
      setSelectedCard(selectedCard?.id === card.id ? null : card)
    } else {
      // Play card with animation
      setPlayingCardId(card.id)
      setTimeout(() => {
        onPlayCard(card.id)
        setPlayingCardId(null)
        setSelectedCard(null)
      }, 250)
    }
  }
  
  const handleEnemyClick = (enemy: Enemy) => {
    if (!selectedCard || combatState.combatEnded || !combatState.isPlayerTurn) return
    if (enemy.hp <= 0) return
    // Play card with animation
    setPlayingCardId(selectedCard.id)
    const cardId = selectedCard.id
    setTimeout(() => {
      onPlayCard(cardId, enemy.id)
      setPlayingCardId(null)
      setSelectedCard(null)
    }, 250)
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
  const playerBlock = (combatState.player as any).block || 0
  
  return (
    <div className={`flex flex-col h-full min-h-[80vh] ${screenShake ? 'screen-shake' : ''}`}>
      
      {/* Turn Banner Overlay */}
      {showTurnBanner && (
        <div className="turn-banner-overlay">
          <div className={`turn-banner ${showTurnBanner === 'player' ? 'turn-banner-player' : 'turn-banner-enemy'}`}>
            {showTurnBanner === 'player' ? '⚔️ Your Turn' : '💀 Enemy Turn'}
          </div>
        </div>
      )}
      
      {/* Turn & Energy Header */}
      <div className="panel p-3 mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm font-medium">Turn {combatState.turn}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: combatState.maxEnergy }).map((_, i) => (
              <div key={i} className={`energy-orb ${i >= combatState.energy ? 'energy-orb-spent' : 'energy-orb-active'}`}
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
            <div key={enemy.id} className="relative">
              <EnemyComponent
                enemy={enemy}
                isTargetable={selectedCard?.type === 'attack' && enemy.hp > 0}
                isHit={hitEnemies.has(enemy.id)}
                onClick={() => handleEnemyClick(enemy)}
              />
              {/* Slash VFX */}
              {slashEffects
                .filter(s => s.enemyId === enemy.id)
                .map(s => (
                  <div key={s.id} className={`slash-effect slash-variant-${s.variant}`} />
                ))}
              {/* Damage popups */}
              {/* Slash VFX */}
              {slashEffects
                .filter(s => s.enemyId === enemy.id)
                .map(s => (
                  <div key={s.id} className={`slash-effect slash-variant-${s.variant}`} />
                ))}
              {damagePopups
                .filter(p => p.enemyId === enemy.id)
                .map(p => (
                  <div key={p.id} className="damage-number">-{p.amount}</div>
                ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Player Area (bottom) */}
      <div className={`panel p-4 border-t-2 border-gray-700/40 animate-slide-up ${playerHit ? 'player-hit' : ''} ${turnAnimating ? 'turn-start' : ''} ${shieldFlash ? 'shield-flash' : ''}`}>
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
            
            {/* Block indicator */}
            {playerBlock > 0 && (
              <div className={`block-indicator ${shieldFlash ? 'block-indicator-flash' : ''}`}>
                🛡️ {playerBlock}
              </div>
            )}
            
            {/* Player damage/heal popups */}
            <div className="relative">
              {damagePopups
                .filter(p => p.isPlayer)
                .map(p => (
                  <div key={p.id} className={`damage-number ${p.type === 'heal' ? 'damage-number-heal' : p.type === 'block' ? 'damage-number-block' : ''}`}>
                    {p.type === 'damage' ? `-${p.amount}` : p.type === 'block' ? `+${p.amount} 🛡️` : `+${p.amount}`}
                  </div>
                ))}
            </div>
            
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
            <div
              key={`${card.id}-${index}`}
              className={`card-draw ${playingCardId === card.id ? 'card-playing' : ''}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardComponent
                card={card}
                isPlayable={combatState.energy >= card.cost && combatState.isPlayerTurn && !combatState.combatEnded && playingCardId === null}
                isSelected={selectedCard?.id === card.id}
                onClick={() => handleCardClick(card)}
              />
            </div>
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
                <div className="text-6xl mb-4 animate-victory">🏆</div>
                <h2 className="text-3xl font-black text-green-400 mb-3 animate-victory">Victory!</h2>
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
