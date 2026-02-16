import { useState } from 'react'
import { CARDS, CARD_POOLS } from '../game/data/cards'
import { Card, Rarity } from '../game/types'
import CardComponent from './CardComponent'

interface CardRewardScreenProps {
  act: number
  onChooseCard: (cardId: string | null) => void
}

export default function CardRewardScreen({ act, onChooseCard }: CardRewardScreenProps) {
  const [rewardCards] = useState<Card[]>(() => {
    const cards: Card[] = []
    const actPools = CARD_POOLS[act as keyof typeof CARD_POOLS]
    for (let i = 0; i < 3; i++) {
      let rarity: Rarity
      const rand = Math.random()
      if (rand < 0.7) rarity = 'common'
      else if (rand < 0.95) rarity = 'uncommon'
      else rarity = 'rare'
      const pool = actPools[rarity]
      const randomCardId = pool[Math.floor(Math.random() * pool.length)]
      const card = CARDS[randomCardId]
      if (card) cards.push({ ...card })
    }
    return cards
  })
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🃏</div>
        <h2 className="text-3xl font-black mb-1">Choose Your Reward</h2>
        <p className="text-gray-500 text-sm">Add a card to your deck, or skip</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
        {rewardCards.map((card, index) => (
          <div key={index} className="flex flex-col items-center">
            <CardComponent
              card={card}
              isReward={true}
              onClick={() => onChooseCard(card.id)}
            />
            <div className={`mt-2 text-xs font-bold ${
              card.rarity === 'common' ? 'text-gray-500' :
              card.rarity === 'uncommon' ? 'text-blue-400' : 'text-yellow-400'
            }`}>
              {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={() => onChooseCard(null)} className="game-button-secondary">
        Skip Reward
      </button>
    </div>
  )
}
