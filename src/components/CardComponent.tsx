import { Card } from '../game/types'

interface CardComponentProps {
  card: Card
  isPlayable?: boolean
  isSelected?: boolean
  isReward?: boolean
  onClick?: () => void
}

export default function CardComponent({ 
  card, 
  isPlayable = true, 
  isSelected = false,
  isReward = false,
  onClick 
}: CardComponentProps) {
  const getCardTypeClass = () => {
    switch (card.type) {
      case 'attack': return 'card-attack'
      case 'skill': return 'card-skill'
      case 'power': return 'card-power'
      default: return ''
    }
  }

  const getCostColor = () => {
    switch (card.type) {
      case 'attack': return 'from-red-500 to-red-700 border-red-400/60'
      case 'skill': return 'from-blue-500 to-blue-700 border-blue-400/60'
      case 'power': return 'from-purple-500 to-purple-700 border-purple-400/60'
      default: return 'from-gray-500 to-gray-700 border-gray-400/60'
    }
  }
  
  const getRarityGlow = () => {
    switch (card.rarity) {
      case 'uncommon': return 'border-blue-400/60'
      case 'rare': return 'border-yellow-400/60'
      default: return ''
    }
  }
  
  const formatDescription = (description: string) => {
    return description.replace(/\b(\d+)\b/g, '<span class="text-yellow-300 font-bold">$1</span>')
  }
  
  return (
    <div
      className={`card ${getCardTypeClass()} ${getRarityGlow()} ${
        isPlayable ? 'card-playable' : 'card-unplayable'
      } ${isSelected ? 'card-selected' : ''} ${
        isReward ? 'w-44 sm:w-48' : 'w-[130px] sm:w-36'
      }`}
      onClick={isPlayable ? onClick : undefined}
      style={{ minHeight: isReward ? '240px' : '170px' }}
    >
      {/* Energy Cost Circle */}
      <div className={`absolute -top-1 -left-1 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm bg-gradient-to-b ${getCostColor()} border-2 z-10`}
        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
        {card.cost}
      </div>

      {/* Card Header */}
      <div className="mt-3 mb-1.5 text-center">
        <div className={`font-bold truncate ${isReward ? 'text-sm' : 'text-xs'} text-gray-100`}>
          {card.name}
        </div>
        <div className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">
          {card.type}
          {card.rarity !== 'common' && ` · ${card.rarity}`}
        </div>
      </div>
      
      {/* Card Art/Icon */}
      <div className="flex justify-center my-2">
        <div className={`${isReward ? 'text-4xl' : 'text-2xl'} leading-none`}>
          {card.type === 'attack' && '⚔️'}
          {card.type === 'skill' && '🛡️'}
          {card.type === 'power' && '✨'}
        </div>
      </div>
      
      {/* Card Stats */}
      <div className="flex justify-center gap-4 mb-1.5">
        {card.damage && (
          <div className="text-center">
            <div className="text-[10px] text-red-400 font-medium">DMG</div>
            <div className="text-red-400 font-black text-sm">{card.damage}</div>
          </div>
        )}
        {card.block && (
          <div className="text-center">
            <div className="text-[10px] text-blue-400 font-medium">BLK</div>
            <div className="text-blue-400 font-black text-sm">{card.block}</div>
          </div>
        )}
      </div>
      
      {/* Card Description */}
      <div 
        className={`text-gray-400 text-center leading-tight mt-auto ${
          isReward ? 'text-xs' : 'text-[10px]'
        }`}
        dangerouslySetInnerHTML={{ __html: formatDescription(card.description) }}
      />
      
      {/* Special Indicators */}
      {card.exhaust && (
        <div className="absolute bottom-1.5 left-1.5 bg-red-900/60 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-bold border border-red-700/40">
          Exhaust
        </div>
      )}
      {card.upgraded && (
        <div className="absolute top-1 right-1 bg-green-900/60 text-green-300 text-[9px] px-1.5 py-0.5 rounded font-bold border border-green-700/40">
          +
        </div>
      )}
      
      {/* Rarity Gem */}
      {card.rarity !== 'common' && (
        <div className={`absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full ${
          card.rarity === 'uncommon' ? 'bg-blue-400 shadow-blue-400/50' : 'bg-yellow-400 shadow-yellow-400/50'
        }`} style={{ boxShadow: `0 0 8px ${card.rarity === 'uncommon' ? 'rgba(96,165,250,0.5)' : 'rgba(250,204,21,0.5)'}` }} />
      )}
    </div>
  )
}
