import { Enemy, StatusEffect } from '../game/types'

interface EnemyComponentProps {
  enemy: Enemy
  isTargetable?: boolean
  onClick?: () => void
}

export default function EnemyComponent({ enemy, isTargetable = false, onClick }: EnemyComponentProps) {
  const getIntentIcon = () => {
    switch (enemy.intent) {
      case 'attack': return '⚔️'
      case 'defend': return '🛡️'
      case 'buff': return '💪'
      case 'debuff': return '😵'
      default: return '❓'
    }
  }
  
  const getIntentColor = () => {
    switch (enemy.intent) {
      case 'attack': return 'text-red-400 border-red-500/30 bg-red-950/40'
      case 'defend': return 'text-blue-400 border-blue-500/30 bg-blue-950/40'
      case 'buff': return 'text-green-400 border-green-500/30 bg-green-950/40'
      case 'debuff': return 'text-purple-400 border-purple-500/30 bg-purple-950/40'
      default: return 'text-gray-400 border-gray-500/30 bg-gray-950/40'
    }
  }
  
  const renderStatusEffects = (statusEffects: Partial<Record<StatusEffect, number>>) => {
    return Object.entries(statusEffects)
      .filter(([_, amount]) => amount > 0)
      .map(([effect, amount]) => (
        <div key={effect} className={`status-effect status-${effect} text-xs`}>
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
  
  const getEnemyEmoji = () => {
    if (enemy.name.toLowerCase().includes('slime')) return '🟢'
    if (enemy.name.toLowerCase().includes('cultist')) return '👺'
    if (enemy.name.toLowerCase().includes('guardian')) return '🗿'
    if (enemy.name.toLowerCase().includes('louse')) return '🐛'
    if (enemy.name.toLowerCase().includes('gremlin')) return '👹'
    if (enemy.name.toLowerCase().includes('sentry')) return '🤖'
    if (enemy.name.toLowerCase().includes('jaw')) return '🦎'
    if (enemy.name.toLowerCase().includes('byrd')) return '🦅'
    if (enemy.name.toLowerCase().includes('chosen')) return '⚡'
    if (enemy.name.toLowerCase().includes('centurion')) return '🛡️'
    if (enemy.name.toLowerCase().includes('mystic')) return '🔮'
    if (enemy.name.toLowerCase().includes('automaton')) return '🤖'
    if (enemy.name.toLowerCase().includes('collector')) return '👻'
    if (enemy.name.toLowerCase().includes('orb')) return '🔵'
    if (enemy.name.toLowerCase().includes('spiker')) return '🦔'
    if (enemy.name.toLowerCase().includes('exploder')) return '💣'
    if (enemy.name.toLowerCase().includes('repulsor')) return '🌪️'
    if (enemy.name.toLowerCase().includes('head')) return '🗿'
    if (enemy.name.toLowerCase().includes('nemesis')) return '😈'
    if (enemy.name.toLowerCase().includes('awakened')) return '👁️'
    if (enemy.name.toLowerCase().includes('time')) return '⏰'
    if (enemy.name.toLowerCase().includes('donu') || enemy.name.toLowerCase().includes('deca')) return '⚖️'
    return '👾'
  }
  
  const isDead = enemy.hp <= 0
  const hpPercent = (enemy.hp / enemy.maxHp) * 100
  
  return (
    <div
      className={`enemy ${isTargetable ? 'enemy-targetable' : ''} ${
        isDead ? 'opacity-40 grayscale' : ''
      } w-44 sm:w-52 min-h-[200px] animate-fade-in-up`}
      onClick={isTargetable && !isDead ? onClick : undefined}
    >
      {/* Enemy Avatar + Name */}
      <div className="text-center mb-3">
        <div className="text-4xl mb-1">{getEnemyEmoji()}</div>
        <h3 className="font-bold text-sm text-gray-200 truncate">{enemy.name}</h3>
      </div>
      
      {/* HP Bar */}
      <div className="mb-3">
        <div className="hp-bar w-full h-3">
          <div className="hp-fill hp-fill-red" style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="text-center text-xs font-bold text-gray-400 mt-1">
          {enemy.hp}/{enemy.maxHp}
        </div>
      </div>
      
      {/* Intent */}
      {!isDead && (
        <div className={`rounded-lg p-2.5 text-center border ${getIntentColor()} mb-2`}>
          <div className="text-xl mb-0.5">{getIntentIcon()}</div>
          {enemy.nextAction.damage && (
            <div className="text-red-400 font-black text-sm">{enemy.nextAction.damage} dmg</div>
          )}
          {enemy.nextAction.block && (
            <div className="text-blue-400 font-black text-sm">{enemy.nextAction.block} blk</div>
          )}
          {enemy.nextAction.statusEffect && (
            <div className="text-yellow-400 text-xs font-medium">
              {enemy.nextAction.statusEffect.type} +{enemy.nextAction.statusEffect.amount}
            </div>
          )}
          {!enemy.nextAction.damage && !enemy.nextAction.block && !enemy.nextAction.statusEffect && (
            <div className="text-xs capitalize font-medium">{enemy.intent}</div>
          )}
        </div>
      )}
      
      {/* Status Effects */}
      {Object.values(enemy.statusEffects).some(amount => amount > 0) && (
        <div className="flex flex-wrap gap-1 justify-center">
          {renderStatusEffects(enemy.statusEffects)}
        </div>
      )}
      
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl opacity-60">💀</div>
        </div>
      )}
      
      {isTargetable && !isDead && (
        <div className="absolute inset-0 border-2 border-yellow-400 rounded-xl animate-pulse pointer-events-none" />
      )}
    </div>
  )
}
