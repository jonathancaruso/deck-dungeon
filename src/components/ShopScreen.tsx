import { useState, useMemo } from 'react'
import { Player, Card, Potion } from '../game/types'
import { CARDS } from '../game/data/cards'
import { POTIONS, POTION_POOLS } from '../game/data/potions'
import CardComponent from './CardComponent'
import { useSoundContext } from '../hooks/SoundContext'

interface ShopScreenProps {
  player: Player
  act: number
  onBuyCard: (card: Card) => void
  onBuyPotion: (potion: Potion) => void
  onRemoveCard: (cardId: string) => void
  onHeal: (amount: number) => void
  onLeave: () => void
}

function getCardPrice(card: Card): number {
  switch (card.rarity) {
    case 'rare': return 150
    case 'uncommon': return 100
    default: return 50
  }
}

function getPotionPrice(): number {
  return 50
}

export default function ShopScreen({ player, act, onBuyCard, onBuyPotion, onRemoveCard, onHeal, onLeave }: ShopScreenProps) {
  const { play } = useSoundContext()
  const [removingCard, setRemovingCard] = useState(false)
  
  const shopCards = useMemo(() => {
    const allCards = Object.values(CARDS).filter(c => c.rarity !== 'common' || Math.random() > 0.3)
    const shuffled = allCards.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5).map(c => ({ ...c, shopKey: `shop-${c.id}-${Math.random().toString(36).slice(2)}` }))
  }, [])
  
  const shopPotions = useMemo(() => {
    const pool = POTION_POOLS[act as keyof typeof POTION_POOLS] || POTION_POOLS[1]
    const shuffled = pool.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map(id => POTIONS[id]).filter(Boolean)
  }, [act])
  
  const [boughtCards, setBoughtCards] = useState<Set<string>>(new Set())
  const [boughtPotions, setBoughtPotions] = useState<Set<string>>(new Set())
  const [healed, setHealed] = useState(false)
  const [removedCard, setRemovedCard] = useState(false)
  
  const healCost = 30
  const removeCost = 75
  
  const handleBuyCard = (card: Card & { shopKey?: string }) => {
    const price = getCardPrice(card)
    const shopKey = card.shopKey || card.id
    if (player.gold < price || boughtCards.has(shopKey)) return
    // Pass card without shopKey to reducer so deck gets clean template ID
    const { shopKey: _, ...cleanCard } = card
    onBuyCard(cleanCard as Card)
    play('shop_buy')
    setBoughtCards(prev => new Set(prev).add(shopKey))
  }
  
  const handleBuyPotion = (potion: Potion) => {
    if (player.gold < getPotionPrice() || boughtPotions.has(potion.id)) return
    if (player.potions.length >= 3) return
    onBuyPotion(potion)
    play('shop_buy')
    setBoughtPotions(prev => new Set(prev).add(potion.id))
  }
  
  const handleRemoveCard = (cardId: string) => {
    if (player.gold < removeCost || removedCard) return
    onRemoveCard(cardId)
    play('card_exhaust')
    setRemovedCard(true)
    setRemovingCard(false)
  }
  
  const handleHeal = () => {
    if (player.gold < healCost || healed || player.hp >= player.maxHp) return
    onHeal(Math.min(15, player.maxHp - player.hp))
    play('heal')
    setHealed(true)
  }
  
  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🏪</div>
        <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">Shop</h2>
        <p className="text-gray-400 text-sm mt-1">Spend your gold wisely</p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-900/30 border border-yellow-700/40">
          <span className="text-yellow-400 text-lg">⬡</span>
          <span className="text-yellow-400 font-black text-xl">{player.gold}</span>
          <span className="text-yellow-600 text-sm">gold</span>
        </div>
      </div>
      
      {/* Cards for Sale */}
      <div className="panel p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Cards</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {shopCards.map(card => {
            const price = getCardPrice(card)
            const shopKey = (card as Card & { shopKey?: string }).shopKey || card.id
            const bought = boughtCards.has(shopKey)
            const canAfford = player.gold >= price
            
            return (
              <div key={shopKey} className="flex flex-col items-center gap-2">
                <div className={bought ? 'opacity-30 pointer-events-none' : ''}>
                  <CardComponent
                    card={card}
                    isPlayable={canAfford && !bought}
                    isReward
                    onClick={() => handleBuyCard(card)}
                  />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  bought ? 'text-gray-600 line-through' : canAfford ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  <span>⬡</span>
                  <span>{price}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Potions for Sale */}
      <div className="panel p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Potions</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {shopPotions.map(potion => {
            const bought = boughtPotions.has(potion.id)
            const canAfford = player.gold >= getPotionPrice()
            const potionsFull = player.potions.length >= 3
            
            return (
              <button
                key={potion.id}
                disabled={bought || !canAfford || potionsFull}
                onClick={() => handleBuyPotion(potion)}
                className={`p-4 rounded-xl border transition-all duration-200 w-36 text-left ${
                  bought ? 'opacity-30 border-gray-800 bg-gray-900' :
                  canAfford && !potionsFull ? 'border-green-700/40 bg-green-950/20 hover:border-green-500/60 hover:bg-green-950/40 cursor-pointer' :
                  'border-gray-700/40 bg-gray-900/40 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">🧪</div>
                <div className="text-sm font-bold text-gray-200">{potion.name}</div>
                <div className="text-xs text-gray-500 mt-1">{potion.description}</div>
                <div className={`mt-2 text-sm font-bold ${bought ? 'text-gray-600 line-through' : canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                  ⬡ {getPotionPrice()}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Services */}
      <div className="panel p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Services</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {/* Heal */}
          <button
            disabled={healed || player.gold < healCost || player.hp >= player.maxHp}
            onClick={handleHeal}
            className={`p-4 rounded-xl border transition-all duration-200 w-44 text-center ${
              healed ? 'opacity-30 border-gray-800' :
              player.gold >= healCost && player.hp < player.maxHp ? 'border-green-700/40 bg-green-950/20 hover:border-green-500/60 cursor-pointer' :
              'border-gray-700/40 bg-gray-900/40 opacity-50'
            }`}
          >
            <div className="text-2xl mb-1">❤️‍🩹</div>
            <div className="text-sm font-bold text-gray-200">Heal 15 HP</div>
            <div className="text-xs text-gray-500 mt-1">{player.hp}/{player.maxHp} HP</div>
            <div className={`mt-2 text-sm font-bold ${healed ? 'text-gray-600 line-through' : 'text-yellow-400'}`}>
              ⬡ {healCost}
            </div>
          </button>
          
          {/* Remove Card */}
          <button
            disabled={removedCard || player.gold < removeCost}
            onClick={() => setRemovingCard(!removingCard)}
            className={`p-4 rounded-xl border transition-all duration-200 w-44 text-center ${
              removedCard ? 'opacity-30 border-gray-800' :
              player.gold >= removeCost ? 'border-red-700/40 bg-red-950/20 hover:border-red-500/60 cursor-pointer' :
              'border-gray-700/40 bg-gray-900/40 opacity-50'
            } ${removingCard ? 'ring-2 ring-red-400' : ''}`}
          >
            <div className="text-2xl mb-1">🗑️</div>
            <div className="text-sm font-bold text-gray-200">Remove a Card</div>
            <div className="text-xs text-gray-500 mt-1">Thin your deck</div>
            <div className={`mt-2 text-sm font-bold ${removedCard ? 'text-gray-600 line-through' : 'text-yellow-400'}`}>
              ⬡ {removeCost}
            </div>
          </button>
        </div>
      </div>
      
      {/* Card removal picker */}
      {removingCard && !removedCard && (
        <div className="panel p-4 mb-4 border-red-700/40 animate-fade-in-up">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Choose a card to remove</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {player.deck.map((card, i) => (
              <button
                key={`${card.id}-${i}`}
                onClick={() => handleRemoveCard(card.id)}
                className="text-xs px-3 py-2 rounded-lg border border-red-700/40 bg-red-950/20 hover:border-red-400 hover:bg-red-950/40 transition-all text-gray-300"
              >
                {card.name}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setRemovingCard(false)}
            className="mt-3 text-sm text-gray-500 hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Leave Shop */}
      <div className="text-center mt-6">
        <button onClick={onLeave} className="game-button">
          Leave Shop →
        </button>
      </div>
    </div>
  )
}
