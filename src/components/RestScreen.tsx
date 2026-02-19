import { useState } from 'react'
import { Player } from '../game/types'
import CardComponent from './CardComponent'
import { useSoundContext } from '../hooks/SoundContext'

interface RestScreenProps {
  player: Player
  onRestHeal: () => void
  onRestUpgrade: (cardId: string) => void
  onRestRemove: (cardId: string) => void
}

export default function RestScreen({ player, onRestHeal, onRestUpgrade, onRestRemove }: RestScreenProps) {
  const { play } = useSoundContext()
  const [mode, setMode] = useState<'choose' | 'upgrade' | 'remove'>('choose')
  
  const healAmount = Math.floor(player.maxHp * 0.3)
  const canHeal = player.hp < player.maxHp
  const upgradableCards = player.deck.filter(card => !card.upgraded)
  const removableCards = [...player.deck]
  
  if (mode === 'upgrade') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔨</div>
          <h2 className="text-2xl font-black mb-1">Upgrade a Card</h2>
          <p className="text-gray-500 text-sm">Permanently improve a card</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-4xl">
          {upgradableCards.map((card, index) => (
            <CardComponent key={`${card.id}-${index}`} card={card} onClick={() => { play('level_up'); onRestUpgrade(card.id) }} />
          ))}
        </div>
        <button onClick={() => setMode('choose')} className="game-button-secondary">Back</button>
      </div>
    )
  }
  
  if (mode === 'remove') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🗑️</div>
          <h2 className="text-2xl font-black mb-1">Remove a Card</h2>
          <p className="text-gray-500 text-sm">Permanently remove from your deck</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-4xl">
          {removableCards.map((card, index) => (
            <CardComponent key={`${card.id}-${index}`} card={card} onClick={() => onRestRemove(card.id)} />
          ))}
        </div>
        <button onClick={() => setMode('choose')} className="game-button-secondary">Back</button>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] rest-site animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔥</div>
        <h2 className="text-3xl font-black mb-1 text-amber-300">Rest Site</h2>
        <p className="text-gray-500 text-sm">Recover and improve</p>
      </div>
      
      <div className="panel p-5 max-w-lg w-full space-y-3">
        {/* Heal */}
        <div className="rest-option" onClick={canHeal ? () => { play('heal'); onRestHeal() } : undefined}
          style={{ opacity: canHeal ? 1 : 0.4 }}>
          <div className="flex items-center gap-4">
            <div className="text-3xl">❤️</div>
            <div>
              <h3 className="font-bold text-green-400">Rest & Recover</h3>
              <p className="text-xs text-gray-400">Heal {healAmount} HP</p>
            </div>
          </div>
          <button disabled={!canHeal} className="game-button text-sm px-4 py-2">Rest</button>
        </div>
        
        {/* Upgrade */}
        <div className="rest-option" onClick={upgradableCards.length > 0 ? () => setMode('upgrade') : undefined}
          style={{ opacity: upgradableCards.length > 0 ? 1 : 0.4 }}>
          <div className="flex items-center gap-4">
            <div className="text-3xl">🔨</div>
            <div>
              <h3 className="font-bold text-blue-400">Upgrade</h3>
              <p className="text-xs text-gray-400">{upgradableCards.length} cards available</p>
            </div>
          </div>
          <button disabled={upgradableCards.length === 0} className="game-button text-sm px-4 py-2">Choose</button>
        </div>
        
        {/* Remove */}
        <div className="rest-option" onClick={removableCards.length > 0 ? () => setMode('remove') : undefined}
          style={{ opacity: removableCards.length > 0 ? 1 : 0.4 }}>
          <div className="flex items-center gap-4">
            <div className="text-3xl">🗑️</div>
            <div>
              <h3 className="font-bold text-purple-400">Remove</h3>
              <p className="text-xs text-gray-400">{removableCards.length} cards removable</p>
            </div>
          </div>
          <button disabled={removableCards.length === 0} className="game-button text-sm px-4 py-2">Choose</button>
        </div>
      </div>
    </div>
  )
}
