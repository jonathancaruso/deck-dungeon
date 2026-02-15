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
  
  const getCardBorderColor = () => {
    switch (card.rarity) {
      case 'common': return 'border-gray-400'
      case 'uncommon': return 'border-blue-400'
      case 'rare': return 'border-yellow-400'
      default: return 'border-gray-400'
    }
  }
  
  const formatDescription = (description: string) => {
    // Replace numbers with colored spans for better visibility
    return description.replace(/\b(\d+)\b/g, '<span class="text-yellow-300 font-bold">$1</span>')
  }
  
  return (
    <div
      className={`card ${getCardTypeClass()} ${getCardBorderColor()} ${
        isPlayable ? 'card-playable' : 'card-unplayable'
      } ${isSelected ? 'card-selected' : ''} ${
        isReward ? 'w-48 h-64' : 'w-32 h-44 md:w-36 md:h-48'
      }`}
      onClick={isPlayable ? onClick : undefined}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
        <div className={`text-xs font-medium ${isReward ? 'text-sm' : ''}`}>
          <div className="truncate">{card.name}</div>
          <div className="text-gray-400 text-xs">
            {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            {card.rarity !== 'common' && ` • ${card.rarity}`}
          </div>
        </div>
        
        <div className={`bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-xs ${
          !isPlayable ? 'bg-gray-600' : ''
        }`}>
          {card.cost}
        </div>
      </div>
      
      {/* Card Art/Icon */}
      <div className="flex justify-center mb-2">
        <div className={`text-2xl ${isReward ? 'text-4xl' : ''}`}>
          {card.type === 'attack' && '⚔️'}
          {card.type === 'skill' && '🛡️'}
          {card.type === 'power' && '✨'}
        </div>
      </div>
      
      {/* Card Stats */}
      <div className="flex justify-center space-x-4 mb-2">
        {card.damage && (
          <div className="text-center">
            <div className="text-xs text-red-300">DMG</div>
            <div className="text-red-400 font-bold">{card.damage}</div>
          </div>
        )}
        {card.block && (
          <div className="text-center">
            <div className="text-xs text-blue-300">BLK</div>
            <div className="text-blue-400 font-bold">{card.block}</div>
          </div>
        )}
      </div>
      
      {/* Card Description */}
      <div 
        className={`text-xs text-gray-300 text-center leading-tight ${
          isReward ? 'text-sm' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: formatDescription(card.description) }}
      />
      
      {/* Special Indicators */}
      <div className="absolute top-1 left-1 flex flex-col space-y-1">
        {card.exhaust && (
          <div className="bg-red-600 text-white text-xs px-1 rounded">
            Exhaust
          </div>
        )}
        {card.upgraded && (
          <div className="bg-green-600 text-white text-xs px-1 rounded">
            +
          </div>
        )}
      </div>
      
      {/* Rarity Gem */}
      {card.rarity !== 'common' && (
        <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
          card.rarity === 'uncommon' ? 'bg-blue-400' : 'bg-yellow-400'
        }`} />
      )}
      
      {/* Hover Effects for Desktop */}
      {!isReward && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  )
}