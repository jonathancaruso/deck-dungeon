export type CardType = 'attack' | 'skill' | 'power'
export type Rarity = 'common' | 'uncommon' | 'rare'
export type NodeType = 'combat' | 'elite' | 'rest' | 'shop' | 'event' | 'treasure' | 'boss'
export type StatusEffect = 'strength' | 'weak' | 'vulnerable' | 'poison' | 'regen' | 'thorns' | 'ritual'
export type EnemyIntent = 'attack' | 'defend' | 'buff' | 'debuff'

export interface Card {
  id: string
  name: string
  type: CardType
  cost: number
  damage?: number
  block?: number
  description: string
  rarity: Rarity
  exhaust?: boolean
  statusEffect?: {
    type: StatusEffect
    amount: number
    target: 'self' | 'enemy' | 'all_enemies'
  }
  upgraded?: boolean
  special?: string // For special effects like "Cleave", "Execute", etc.
}

export interface Enemy {
  id: string
  name: string
  maxHp: number
  hp: number
  intent: EnemyIntent
  nextAction: {
    type: EnemyIntent
    damage?: number
    block?: number
    statusEffect?: {
      type: StatusEffect
      amount: number
    }
  }
  statusEffects: Partial<Record<StatusEffect, number>>
  act: number
}

export interface Relic {
  id: string
  name: string
  description: string
  rarity: Rarity
  effect: string // JSON string or effect identifier
}

export interface Potion {
  id: string
  name: string
  description: string
  effect: string
}

export interface MapNode {
  id: string
  type: NodeType
  x: number
  y: number
  connections: string[]
  completed: boolean
  available: boolean
}

export interface GameEvent {
  id: string
  name: string
  description: string
  choices: EventChoice[]
}

export interface EventChoice {
  id: string
  text: string
  consequence: EventConsequence
}

export interface EventConsequence {
  type: 'damage' | 'heal' | 'gold' | 'relic' | 'card' | 'remove_card' | 'nothing'
  amount?: number
  relic?: Relic
  card?: Card
}

export interface Player {
  hp: number
  maxHp: number
  block: number
  gold: number
  deck: Card[]
  relics: Relic[]
  potions: Potion[]
  statusEffects: Partial<Record<StatusEffect, number>>
}

export interface CombatState {
  player: Player
  enemies: Enemy[]
  hand: Card[]
  drawPile: Card[]
  discardPile: Card[]
  activePowers: Card[]
  energy: number
  maxEnergy: number
  turn: number
  selectedCard?: Card
  selectedEnemy?: Enemy
  isPlayerTurn: boolean
  combatEnded: boolean
  victory: boolean
}

export interface GameState {
  player: Player
  currentAct: number
  currentFloor: number
  map: MapNode[]
  currentNode?: MapNode
  gamePhase: 'menu' | 'map' | 'combat' | 'card_reward' | 'rest' | 'shop' | 'event' | 'treasure' | 'game_over' | 'victory'
  combatState?: CombatState
  currentEvent?: GameEvent
  treasureReward?: { gold: number; relic?: Relic }
  runStats: {
    floorsCleared: number
    enemiesKilled: number
    damageDealt: number
    cardsPlayed: number
    goldEarned: number
    startTime: number
  }
}