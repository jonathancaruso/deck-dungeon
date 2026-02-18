import { useState, useMemo } from 'react'
import { Player } from '../game/types'

interface EventScreenProps {
  player: Player
  act: number
  onGainGold: (amount: number) => void
  onHeal: (amount: number) => void
  onTakeDamage: (amount: number) => void
  onGainMaxHp: (amount: number) => void
  onLeave: () => void
}

interface EventChoice {
  text: string
  result: string
  action: () => void
}

interface GameEvent {
  title: string
  icon: string
  description: string
  choices: EventChoice[]
}

export default function EventScreen({ player, act, onGainGold, onHeal, onTakeDamage, onGainMaxHp, onLeave }: EventScreenProps) {
  const [chosen, setChosen] = useState<number | null>(null)
  const [resultText, setResultText] = useState('')
  
  const event = useMemo(() => {
    const events: GameEvent[] = [
      {
        title: 'Mysterious Shrine',
        icon: '🏛️',
        description: 'You discover a crumbling shrine. Glowing runes pulse along its surface. Something ancient waits within.',
        choices: [
          { text: 'Pray at the shrine', result: 'The shrine glows warmly. You feel restored.', action: () => onHeal(15) },
          { text: 'Smash it for gold', result: 'Gold coins scatter from the rubble!', action: () => onGainGold(30) },
          { text: 'Walk away', result: 'You leave the shrine undisturbed.', action: () => {} },
        ]
      },
      {
        title: 'Wandering Merchant',
        icon: '🧳',
        description: 'A hooded figure blocks your path. "Trade? A bit of your blood for a bit of my gold," they rasp.',
        choices: [
          { text: 'Accept the deal (-8 HP, +40 gold)', result: 'Pain shoots through you, but your purse is heavier.', action: () => { onTakeDamage(8); onGainGold(40) } },
          { text: 'Decline politely', result: 'The merchant shrugs and vanishes into shadow.', action: () => {} },
        ]
      },
      {
        title: 'Abandoned Campfire',
        icon: '🔥',
        description: 'Embers still glow in a firepit. Supplies are scattered around. Someone left in a hurry.',
        choices: [
          { text: 'Rest by the fire (+10 HP)', result: 'The warmth soothes your aching body.', action: () => onHeal(10) },
          { text: 'Search the supplies (+20 gold)', result: 'You find a pouch of coins hidden under a bedroll.', action: () => onGainGold(20) },
        ]
      },
      {
        title: 'Strange Fountain',
        icon: '⛲',
        description: 'Crystal-clear water bubbles up from cracked stone. It shimmers with an unnatural light.',
        choices: [
          { text: 'Drink deeply', result: 'Power surges through you! Your body feels stronger.', action: () => onGainMaxHp(5) },
          { text: 'Fill your flask (+8 HP)', result: 'The cool water revitalizes you.', action: () => onHeal(8) },
          { text: "Don't risk it", result: 'Probably wise. You move on.', action: () => {} },
        ]
      },
      {
        title: 'Trapped Chest',
        icon: '🪤',
        description: 'A chest sits in the middle of an otherwise empty room. The floor around it is suspiciously clean.',
        choices: [
          { text: 'Open it carefully (+25 gold)', result: 'Your caution pays off. Gold!', action: () => onGainGold(25) },
          { text: 'Kick it open (risk: -5 HP or +50 gold)', result: Math.random() > 0.4 ? 'The trap fires! A dart catches your arm.' : 'No trap! A pile of gold spills out.', action: () => Math.random() > 0.4 ? onTakeDamage(5) : onGainGold(50) },
          { text: 'Leave it', result: 'Not worth the risk.', action: () => {} },
        ]
      },
      {
        title: 'The Hermit',
        icon: '🧙',
        description: 'An old figure sits cross-legged, eyes closed. "I sense great potential in you," they murmur without looking up.',
        choices: [
          { text: 'Ask for wisdom (+3 Max HP)', result: '"Endurance is the truest strength." You feel hardier.', action: () => onGainMaxHp(3) },
          { text: 'Ask for gold (+15 gold)', result: 'They toss you a pouch. "Buy something useful."', action: () => onGainGold(15) },
        ]
      },
      {
        title: 'Blood Altar',
        icon: '🩸',
        description: 'A stone altar stained dark with ancient offerings. The air hums with a hungry resonance. It wants something from you.',
        choices: [
          { text: 'Offer your blood (-12 HP, +7 Max HP)', result: 'Agony tears through you, but your body rebuilds stronger than before.', action: () => { onTakeDamage(12); onGainMaxHp(7) } },
          { text: 'Offer gold (-30 gold, +20 HP)', result: 'The altar absorbs the coins. Warmth floods your veins.', action: () => { onGainGold(-30); onHeal(20) } },
          { text: 'Back away slowly', result: 'The humming fades. Whatever dwells here lets you go... this time.', action: () => {} },
        ]
      },
      {
        title: 'The Hanging Cage',
        icon: '🗝️',
        description: 'A rusted cage dangles from a dead tree. Inside, a skeletal hand clutches a leather satchel. The lock looks breakable.',
        choices: [
          { text: 'Break the lock (+60 gold)', result: 'The cage crashes down. Inside the satchel: a fortune in old coins.', action: () => onGainGold(60) },
          { text: 'Reach through the bars (-6 HP, +35 gold)', result: 'Jagged metal cuts your arm, but you snag some coins from the satchel.', action: () => { onTakeDamage(6); onGainGold(35) } },
          { text: 'Leave the dead in peace', result: 'Some things are best left undisturbed.', action: () => {} },
        ]
      },
      {
        title: 'Whispering Shadows',
        icon: '👁️',
        description: 'The shadows coalesce into writhing shapes that speak in overlapping voices. They offer forbidden knowledge.',
        choices: [
          { text: 'Listen to their secrets (+5 Max HP, -15 HP)', result: 'Dark truths sear your mind. You stagger, but something deep within you has hardened.', action: () => { onGainMaxHp(5); onTakeDamage(15) } },
          { text: 'Demand tribute (+45 gold)', result: 'The shadows shriek and scatter, leaving behind glittering trinkets.', action: () => onGainGold(45) },
          { text: 'Banish them with light', result: 'You strike a flame. The shadows recoil and dissolve with a hiss.', action: () => onHeal(5) },
        ]
      },
      {
        title: 'The Bone Garden',
        icon: '💀',
        description: 'Flowers of pale bone grow from cracked earth. Among them, you spot a vial of luminous fluid and a buried coin purse.',
        choices: [
          { text: 'Take the vial (+15 HP)', result: 'The fluid tastes of starlight and ash. Your wounds knit closed.', action: () => onHeal(15) },
          { text: 'Dig up the coin purse (+35 gold)', result: 'Dirt-caked coins, still good. You pocket them quickly.', action: () => onGainGold(35) },
          { text: 'Pick a bone flower (+2 Max HP)', result: 'The flower crumbles to dust in your palm and seeps into your skin. You feel... denser.', action: () => onGainMaxHp(2) },
        ]
      },
      {
        title: 'Collapsing Bridge',
        icon: '🌉',
        description: 'A crumbling stone bridge spans a chasm. Below, something glints on a narrow ledge. The bridge groans under your weight.',
        choices: [
          { text: 'Sprint across (+10 gold)', result: 'You dash across as stones crumble behind you, snagging a dropped pouch mid-stride.', action: () => onGainGold(10) },
          { text: 'Climb down for the treasure (-10 HP, +75 gold)', result: 'The descent is brutal, but the treasure trove on the ledge makes it worth every bruise.', action: () => { onTakeDamage(10); onGainGold(75) } },
          { text: 'Find another way around', result: 'You take the long way. Safer, but you wonder what you missed.', action: () => onHeal(3) },
        ]
      },
      {
        title: 'Cursed Mirror',
        icon: '🪞',
        description: 'A tall mirror stands alone in a clearing. Your reflection moves independently, beckoning you closer with a cruel smile.',
        choices: [
          { text: 'Touch the glass (-5 HP, +4 Max HP)', result: 'Your reflection grabs your wrist. Cold fire races up your arm. When it releases you, you feel transformed.', action: () => { onTakeDamage(5); onGainMaxHp(4) } },
          { text: 'Shatter it (+20 gold)', result: 'The mirror explodes into silver shards. Among the fragments: coins fused into the frame.', action: () => onGainGold(20) },
          { text: 'Turn away', result: 'You hear it whisper your name as you leave. Best not to look back.', action: () => {} },
        ]
      },
    ]
    return events[Math.floor(Math.random() * events.length)]
  }, [])
  
  const handleChoice = (index: number) => {
    if (chosen !== null) return
    setChosen(index)
    setResultText(event.choices[index].result)
    event.choices[index].action()
  }
  
  return (
    <div className="animate-fade-in-up max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{event.icon}</div>
        <h2 className="text-2xl sm:text-3xl font-black text-purple-400">{event.title}</h2>
      </div>
      
      <div className="panel p-6 mb-6">
        <p className="text-gray-300 leading-relaxed">{event.description}</p>
      </div>
      
      {chosen === null ? (
        <div className="space-y-3">
          {event.choices.map((choice, i) => (
            <button
              key={i}
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
