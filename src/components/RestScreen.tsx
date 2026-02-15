import { useState } from 'react'
import { Player } from '../game/types'
import CardComponent from './CardComponent'

interface RestScreenProps {
  player: Player
  onRestHeal: () => void
  onRestUpgrade: (cardId: string) => void
  onRestRemove: (cardId: string) => void
}

export default function RestScreen({ player, onRestHeal, onRestUpgrade, onRestRemove }: RestScreenProps) {
  const [mode, setMode] = useState<'choose' | 'upgrade' | 'remove'>('choose')
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  
  const healAmount = Math.floor(player.maxHp * 0.3)
  const canHeal = player.hp < player.maxHp
  
  const upgradableCards = player.deck.filter(card => !card.upgraded)
  const removableCards = player.deck.filter(card => card.rarity === 'common' || card.name.includes('Strike') || card.name.includes('Defend'))
  
  const handleAction = (action: string, cardId?: string) => {
    switch (action) {
      case 'heal':
        onRestHeal()
        break
      case 'upgrade':
        if (cardId) onRestUpgrade(cardId)
        break
      case 'remove':
        if (cardId) onRestRemove(cardId)
        break
    }
  }
  
  if (mode === 'upgrade') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">🔨 Upgrade a Card</h2>
          <p className="text-gray-400">
            Choose a card to permanently improve its effectiveness
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8 max-w-4xl">
          {upgradableCards.map((card, index) => (
            <CardComponent
              key={`${card.id}-${index}`}
              card={card}
              onClick={() => handleAction('upgrade', card.id)}
            />
          ))}
        </div>
        
        <button
          onClick={() => setMode('choose')}
          className="game-button-secondary"
        >
          Back
        </button>
        
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>💡 Upgraded cards deal more damage, provide more block, or have enhanced effects</p>
        </div>
      </div>
    )
  }
  
  if (mode === 'remove') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">🗑️ Remove a Card</h2>
          <p className="text-gray-400">
            Choose a card to permanently remove from your deck
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8 max-w-4xl">
          {removableCards.map((card, index) => (
            <CardComponent
              key={`${card.id}-${index}`}
              card={card}
              onClick={() => handleAction('remove', card.id)}
            />
          ))}
        </div>
        
        <button
          onClick={() => setMode('choose')}
          className="game-button-secondary"
        >
          Back
        </button>
        
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>💡 Removing weak cards makes your deck more consistent</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">🔥 Rest Site</h2>
        <p className="text-gray-400">
          Take a moment to recover and improve your capabilities
        </p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-2xl">
        <div className="space-y-6">
          {/* Heal Option */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">❤️</div>
              <div>
                <h3 className="font-semibold text-green-400">Rest and Recover</h3>
                <p className="text-sm text-gray-300">
                  Heal {healAmount} HP {!canHeal && '(Already at full health)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAction('heal')}
              disabled={!canHeal}
              className={`${canHeal ? 'game-button' : 'game-button-secondary cursor-not-allowed'}`}
            >
              Rest
            </button>
          </div>
          
          {/* Upgrade Option */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🔨</div>
              <div>
                <h3 className="font-semibold text-blue-400">Upgrade a Card</h3>
                <p className="text-sm text-gray-300">
                  Permanently improve a card {upgradableCards.length === 0 && '(No cards to upgrade)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMode('upgrade')}
              disabled={upgradableCards.length === 0}
              className={`${upgradableCards.length > 0 ? 'game-button' : 'game-button-secondary cursor-not-allowed'}`}
            >
              Upgrade
            </button>
          </div>
          
          {/* Remove Option */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🗑️</div>
              <div>
                <h3 className="font-semibold text-purple-400">Remove a Card</h3>
                <p className="text-sm text-gray-300">
                  Permanently remove a card from your deck {removableCards.length === 0 && '(No cards to remove)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMode('remove')}
              disabled={removableCards.length === 0}
              className={`${removableCards.length > 0 ? 'game-button' : 'game-button-secondary cursor-not-allowed'}`}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm max-w-md">
        <p>💡 Choose wisely! Each rest site offers only one action.</p>
        <p>Consider your current HP and deck composition when deciding.</p>
      </div>
    </div>
  )
}