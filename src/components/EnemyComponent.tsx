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
      case 'attack': return 'text-red-400'
      case 'defend': return 'text-blue-400'
      case 'buff': return 'text-green-400'
      case 'debuff': return 'text-purple-400'
      default: return 'text-gray-400'
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
          <span className="ml-1">{amount}</span>
        </div>
      ))
  }
  
  const getEnemyEmoji = () => {
    // Simple mapping based on enemy name
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
    return '👾' // Default enemy emoji
  }
  
  const isDead = enemy.hp <= 0
  
  return (
    <div
      className={`enemy ${isTargetable ? 'enemy-targetable' : ''} ${
        isDead ? 'opacity-50 grayscale' : ''
      } w-48 min-h-[200px]`}
      onClick={isTargetable && !isDead ? onClick : undefined}
    >
      {/* Enemy Name and Icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg truncate">{enemy.name}</h3>
        <div className="text-3xl">{getEnemyEmoji()}</div>
      </div>
      
      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">HP</span>
          <span className="text-sm font-medium">
            {enemy.hp}/{enemy.maxHp}
          </span>
        </div>
        <div className="hp-bar w-full h-3">
          <div 
            className="hp-fill bg-red-500"
            style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Intent */}
      {!isDead && (
        <div className="mb-3">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className={`text-2xl ${getIntentColor()} mb-1`}>
              {getIntentIcon()}
            </div>
            <div className="text-xs text-gray-300 capitalize">
              {enemy.intent}
            </div>
            
            {/* Intent Details */}
            {enemy.nextAction.damage && (
              <div className="text-red-400 font-bold text-sm mt-1">
                {enemy.nextAction.damage} damage
              </div>
            )}
            {enemy.nextAction.block && (
              <div className="text-blue-400 font-bold text-sm mt-1">
                {enemy.nextAction.block} block
              </div>
            )}
            {enemy.nextAction.statusEffect && (
              <div className="text-yellow-400 text-xs mt-1">
                {enemy.nextAction.statusEffect.type} +{enemy.nextAction.statusEffect.amount}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Status Effects */}
      {Object.values(enemy.statusEffects).some(amount => amount > 0) && (
        <div className="flex flex-wrap gap-1">
          {renderStatusEffects(enemy.statusEffects)}
        </div>
      )}
      
      {/* Death Indicator */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl">💀</div>
        </div>
      )}
      
      {/* Targeting Highlight */}
      {isTargetable && !isDead && (
        <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-pulse pointer-events-none" />
      )}
    </div>
  )
}