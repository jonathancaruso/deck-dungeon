import { useState, useMemo } from 'react'
import { Player, GameEvent, EventChoice, EventConsequence } from '../game/types'
import { EVENTS, EVENT_POOLS } from '../game/data/events'

interface EventScreenProps {
  player: Player
  act: number
  onGainGold: (amount: number) => void
  onHeal: (amount: number) => void
  onTakeDamage: (amount: number) => void
  onGainMaxHp: (amount: number) => void
  onLeave: () => void
}

const EVENT_ICONS: Record<string, string> = {
  mysterious_chest: '📦',
  fountain: '⛲',
  gambler: '🎲',
  dead_adventurer: '💀',
  strange_machine: '⚙️',
  cursed_tome: '📖',
  golden_idol: '🏆',
  healing_well: '💧',
  merchant_tent: '🧳',
  ritual_site: '🩸',
}

function getResultText(consequence: EventConsequence): string {
  switch (consequence.type) {
    case 'heal':
      return consequence.amount === 999
        ? 'A surge of energy fills you. All wounds close!'
        : `You feel restored. Healed ${consequence.amount} HP.`
    case 'damage':
      return `Pain shoots through you! Took ${consequence.amount} damage.`
    case 'gold':
      if (!consequence.amount || consequence.amount === 0) return 'Nothing happens.'
      return consequence.amount > 0
        ? `You gained ${consequence.amount} gold!`
        : `You spent ${Math.abs(consequence.amount)} gold.`
    case 'relic':
      return consequence.relic
        ? `You found a relic: ${consequence.relic.name}!`
        : 'You found a mysterious relic!'
    case 'card':
      return 'You gained a new card!'
    case 'nothing':
      return 'You move on.'
    default:
      return 'Nothing happens.'
  }
}

export default function EventScreen({ player, act, onGainGold, onHeal, onTakeDamage, onGainMaxHp, onLeave }: EventScreenProps) {
  const [chosen, setChosen] = useState<number | null>(null)
  const [resultText, setResultText] = useState('')

  const event = useMemo(() => {
    const poolKey = Math.min(act, 3) as 1 | 2 | 3
    const pool = EVENT_POOLS[poolKey]
    const eventId = pool[Math.floor(Math.random() * pool.length)]
    return EVENTS[eventId]
  }, [])

  const applyConsequence = (consequence: EventConsequence) => {
    switch (consequence.type) {
      case 'heal':
        onHeal(consequence.amount || 0)
        break
      case 'damage':
        onTakeDamage(consequence.amount || 0)
        break
      case 'gold':
        if (consequence.amount && consequence.amount !== 0) {
          onGainGold(consequence.amount)
        }
        break
      case 'nothing':
        break
      // relic and card consequences need reducer support — for now just show text
      case 'relic':
      case 'card':
        break
    }
  }

  const handleChoice = (index: number) => {
    if (chosen !== null) return
    setChosen(index)
    const choice = event.choices[index]
    setResultText(getResultText(choice.consequence))
    applyConsequence(choice.consequence)
  }

  const icon = EVENT_ICONS[event.id] || '❓'

  return (
    <div className="animate-fade-in-up max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{icon}</div>
        <h2 className="text-2xl sm:text-3xl font-black text-purple-400">{event.name}</h2>
      </div>

      <div className="panel p-6 mb-6">
        <p className="text-gray-300 leading-relaxed">{event.description}</p>
      </div>

      {chosen === null ? (
        <div className="space-y-3">
          {event.choices.map((choice, i) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(i)}
              className="w-full p-4 rounded-xl border border-gray-700/40 bg-slate-800/60 hover:border-purple-500/60 hover:bg-slate-700/60 transition-all duration-200 text-left text-gray-200 font-medium"
            >
              {choice.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <div className="panel p-6 mb-6 border-purple-700/40">
            <p className="text-purple-300 font-medium">{resultText}</p>
          </div>
          <div className="text-center">
            <button onClick={onLeave} className="game-button">
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
