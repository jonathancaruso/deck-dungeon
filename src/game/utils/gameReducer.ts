import { GameState, CombatState, Card, Enemy } from '../types'
import { CARDS, STARTER_DECK } from '../data/cards'
import { ENEMIES, ENEMY_ENCOUNTERS } from '../data/enemies'
import { generateMap, getAvailableNodes } from './mapGenerator'
import { shuffleDeck, drawCards, applyCardEffects, processStatusEffects, enemyAI } from './combat'

export type GameAction = 
  | { type: 'START_NEW_GAME' }
  | { type: 'ENTER_NODE'; nodeId: string }
  | { type: 'START_COMBAT'; enemies: string[] }
  | { type: 'PLAY_CARD'; cardId: string; targetEnemyId?: string }
  | { type: 'END_TURN' }
  | { type: 'CHOOSE_CARD_REWARD'; cardId: string | null }
  | { type: 'SET_PHASE'; phase: GameState['gamePhase'] }
  | { type: 'REST_HEAL' }
  | { type: 'REST_UPGRADE'; cardId: string }
  | { type: 'REST_REMOVE'; cardId: string }
  | { type: 'BUY_CARD'; card: Card; price: number }
  | { type: 'BUY_POTION'; potion: import('../types').Potion; price: number }
  | { type: 'SHOP_REMOVE_CARD'; cardId: string; price: number }
  | { type: 'SHOP_HEAL'; amount: number; price: number }
  | { type: 'LEAVE_SHOP' }
  | { type: 'BUY_RELIC'; relicId: string }
  | { type: 'REMOVE_CARD'; cardId: string }
  | { type: 'CHOOSE_EVENT_OPTION'; choiceId: string }
  | { type: 'EVENT_GAIN_GOLD'; amount: number }
  | { type: 'EVENT_HEAL'; amount: number }
  | { type: 'EVENT_DAMAGE'; amount: number }
  | { type: 'EVENT_GAIN_MAX_HP'; amount: number }
  | { type: 'LEAVE_EVENT' }
  | { type: 'USE_POTION'; potionId: string; targetEnemyId?: string }
  | { type: 'ADVANCE_ACT' }
  | { type: 'GAME_OVER' }
  | { type: 'LOAD_GAME'; gameState: GameState }
  | { type: 'SAVE_GAME' }

export const initialGameState: GameState = {
  player: {
    hp: 70,
    maxHp: 70,
    block: 0,
    gold: 99,
    deck: STARTER_DECK.map(cardId => ({ ...CARDS[cardId] })),
    relics: [],
    potions: [],
    statusEffects: {}
  },
  currentAct: 1,
  currentFloor: 0,
  map: generateMap(1),
  gamePhase: 'menu',
  runStats: {
    floorsCleared: 0,
    enemiesKilled: 0,
    damageDealt: 0,
    cardsPlayed: 0,
    goldEarned: 0,
    startTime: Date.now()
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_NEW_GAME':
      return {
        ...initialGameState,
        map: generateMap(1),
        gamePhase: 'map',
        runStats: {
          ...initialGameState.runStats,
          startTime: Date.now()
        }
      }
    
    case 'ENTER_NODE': {
      const node = state.map.find(n => n.id === action.nodeId)
      if (!node || !node.available) return state
      
      const newState = {
        ...state,
        currentNode: node,
        currentFloor: node.y + 1
      }
      
      switch (node.type) {
        case 'combat':
        case 'elite':
        case 'boss':
          const encounterType = node.type === 'boss' ? 'boss' : node.type === 'elite' ? 'elite' : 'normal'
          const encounters = ENEMY_ENCOUNTERS[state.currentAct as keyof typeof ENEMY_ENCOUNTERS][encounterType as keyof typeof ENEMY_ENCOUNTERS[1]]
          const randomEncounter = encounters[Math.floor(Math.random() * encounters.length)]
          return startCombat(newState, randomEncounter)
        
        case 'rest':
          return { ...newState, gamePhase: 'rest' }
        
        case 'shop':
          return { ...newState, gamePhase: 'shop' }
        
        case 'event':
          return { ...newState, gamePhase: 'event' }
        
        case 'treasure':
          // TODO: Implement treasure
          return { ...newState, gamePhase: 'map' }
        
        default:
          return newState
      }
    }
    
    case 'START_COMBAT':
      return startCombat(state, action.enemies)
    
    case 'PLAY_CARD': {
      if (!state.combatState || state.gamePhase !== 'combat') return state
      
      const card = state.combatState.hand.find(c => c.id === action.cardId)
      if (!card) return state
      
      // Corruption: skills cost 0
      const hasCorruption = state.combatState.activePowers.some(p => p.special === 'corruption')
      const effectiveCost = (hasCorruption && card.type === 'skill') ? 0 : card.cost
      if (state.combatState.energy < effectiveCost) return state
      
      let targetEnemy: Enemy | undefined
      if (card.type === 'attack' && action.targetEnemyId) {
        targetEnemy = state.combatState.enemies.find(e => e.id === action.targetEnemyId && e.hp > 0)
        if (!targetEnemy) return state
      }
      
      const newCombatState = { ...state.combatState }
      
      // Remove card from hand
      newCombatState.hand = newCombatState.hand.filter(c => c !== card)
      
      // Pay energy cost
      newCombatState.energy -= effectiveCost
      
      // Apply card effects
      const updatedCombatState = applyCardEffects(card, newCombatState, targetEnemy)
      
      // Move card to appropriate pile
      if (card.type === 'power') {
        // Power cards stay active for the rest of combat
        updatedCombatState.activePowers.push(card)
      } else if (card.exhaust || (hasCorruption && card.type === 'skill')) {
        // Exhausted cards are removed from game
      } else {
        updatedCombatState.discardPile.push(card)
      }
      
      // Update run stats will be handled in main game state
      
      // Check for combat end
      const aliveEnemies = updatedCombatState.enemies.filter(e => e.hp > 0)
      if (aliveEnemies.length === 0) {
        updatedCombatState.combatEnded = true
        updatedCombatState.victory = true
        
        // Transition to card reward phase after a brief delay
        // Will transition to card reward screen
      }
      
      // Update run stats
      const newRunStats = {
        ...state.runStats,
        cardsPlayed: state.runStats.cardsPlayed + 1,
        damageDealt: state.runStats.damageDealt + (card.damage || 0),
        enemiesKilled: state.runStats.enemiesKilled + (aliveEnemies.length === 0 ? 1 : 0)
      }

      return {
        ...state,
        combatState: updatedCombatState,
        runStats: newRunStats
      }
    }
    
    case 'END_TURN': {
      if (!state.combatState || state.gamePhase !== 'combat') return state
      
      let newCombatState = { ...state.combatState }
      
      // End-of-turn powers: Metallicize (+3 block)
      if (newCombatState.activePowers.some(p => p.special === 'metallicize')) {
        newCombatState.player = { ...newCombatState.player, block: (newCombatState.player.block || 0) + 3 }
        // Juggernaut triggers on metallicize block gain too
        if (newCombatState.activePowers.some(p => p.special === 'juggernaut')) {
          const aliveEnemies = newCombatState.enemies.filter(e => e.hp > 0)
          if (aliveEnemies.length > 0) {
            const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
            target.hp = Math.max(0, target.hp - 5)
          }
        }
      }
      
      // Discard hand
      newCombatState.discardPile.push(...newCombatState.hand)
      newCombatState.hand = []
      
      // Enemy turn
      newCombatState.enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          enemyAI(enemy, newCombatState)
        }
      })
      
      // Process status effects
      newCombatState = processStatusEffects(newCombatState)
      
      // Check for player death
      if (newCombatState.player.hp <= 0) {
        return {
          ...state,
          gamePhase: 'game_over',
          combatState: newCombatState
        }
      }
      
      // Start new turn
      newCombatState.turn++
      newCombatState.energy = newCombatState.maxEnergy
      
      // Barricade: block persists between turns
      const hasBarricade = newCombatState.activePowers.some(p => p.special === 'barricade')
      if (!hasBarricade) {
        newCombatState.player = { ...newCombatState.player, block: 0 }
      }
      
      // Demon Form: gain 2 Strength at start of turn
      if (newCombatState.activePowers.some(p => p.special === 'demon_form')) {
        newCombatState.player.statusEffects.strength = (newCombatState.player.statusEffects.strength || 0) + 2
      }
      
      // Battle Trance: draw 1 extra card
      const hasBattleTrance = newCombatState.activePowers.some(p => p.special === 'battle_trance')
      newCombatState = drawCards(newCombatState, hasBattleTrance ? 6 : 5)
      
      return {
        ...state,
        combatState: newCombatState
      }
    }
    
    case 'CHOOSE_CARD_REWARD': {
      if (!state.combatState) return state
      
      let newState = { ...state }
      
      if (action.cardId) {
        const card = CARDS[action.cardId]
        if (card) {
          newState.player.deck.push({ ...card })
        }
      }
      
      // Update map availability
      newState.map = [...state.map]
      getAvailableNodes(newState.map, state.currentNode?.id)
      newState.runStats.floorsCleared++
      
      return {
        ...newState,
        gamePhase: 'map',
        combatState: undefined,
        currentNode: undefined
      }
    }
    
    case 'REST_HEAL': {
      const healAmount = Math.floor(state.player.maxHp * 0.3)
      const newHp = Math.min(state.player.maxHp, state.player.hp + healAmount)
      
      const newState = {
        ...state,
        player: {
          ...state.player,
          hp: newHp
        }
      }
      
      // Update map and return to map
      newState.map = [...state.map]
      getAvailableNodes(newState.map, state.currentNode?.id)
      newState.runStats.floorsCleared++
      
      return {
        ...newState,
        gamePhase: 'map',
        currentNode: undefined
      }
    }
    
    case 'REST_UPGRADE': {
      const cardIndex = state.player.deck.findIndex(c => c.id === action.cardId)
      if (cardIndex === -1) return state
      
      const newDeck = [...state.player.deck]
      const card = { ...newDeck[cardIndex] }
      
      // Upgrade card (simplified)
      if (card.damage) card.damage += 3
      if (card.block) card.block += 3
      card.upgraded = true
      card.name += '+'
      
      newDeck[cardIndex] = card
      
      const newState = {
        ...state,
        player: {
          ...state.player,
          deck: newDeck
        }
      }
      
      // Update map and return to map
      newState.map = [...state.map]
      getAvailableNodes(newState.map, state.currentNode?.id)
      newState.runStats.floorsCleared++
      
      return {
        ...newState,
        gamePhase: 'map',
        currentNode: undefined
      }
    }
    
    case 'REST_REMOVE': {
      const newDeck = state.player.deck.filter(c => c.id !== action.cardId)
      
      const newState = {
        ...state,
        player: {
          ...state.player,
          deck: newDeck
        }
      }
      
      // Update map and return to map
      newState.map = [...state.map]
      getAvailableNodes(newState.map, state.currentNode?.id)
      newState.runStats.floorsCleared++
      
      return {
        ...newState,
        gamePhase: 'map',
        currentNode: undefined
      }
    }
    
    case 'BUY_CARD': {
      if (state.player.gold < action.price) return state
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - action.price,
          deck: [...state.player.deck, { ...action.card }]
        }
      }
    }
    
    case 'BUY_POTION': {
      if (state.player.gold < action.price || state.player.potions.length >= 3) return state
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - action.price,
          potions: [...state.player.potions, action.potion]
        }
      }
    }
    
    case 'SHOP_REMOVE_CARD': {
      if (state.player.gold < action.price) return state
      const idx = state.player.deck.findIndex(c => c.id === action.cardId)
      if (idx === -1) return state
      const newDeck = [...state.player.deck]
      newDeck.splice(idx, 1)
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - action.price,
          deck: newDeck
        }
      }
    }
    
    case 'SHOP_HEAL': {
      if (state.player.gold < action.price) return state
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - action.price,
          hp: Math.min(state.player.maxHp, state.player.hp + action.amount)
        }
      }
    }
    
    case 'EVENT_GAIN_GOLD':
      return { ...state, player: { ...state.player, gold: state.player.gold + action.amount } }
    
    case 'EVENT_HEAL':
      return { ...state, player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + action.amount) } }
    
    case 'EVENT_DAMAGE': {
      const newHp = state.player.hp - action.amount
      if (newHp <= 0) return { ...state, player: { ...state.player, hp: 0 }, gamePhase: 'game_over' }
      return { ...state, player: { ...state.player, hp: newHp } }
    }
    
    case 'EVENT_GAIN_MAX_HP':
      return { ...state, player: { ...state.player, maxHp: state.player.maxHp + action.amount, hp: state.player.hp + action.amount } }
    
    case 'LEAVE_EVENT': {
      const newState = { ...state }
      newState.map = [...state.map]
      getAvailableNodes(newState.map, state.currentNode?.id)
      newState.runStats = { ...state.runStats, floorsCleared: state.runStats.floorsCleared + 1 }
      return { ...newState, gamePhase: 'map', currentNode: undefined }
    }
    
    case 'LEAVE_SHOP': {
      const newState = { ...state }
      newState.map = [...state.map]
      getAvailableNodes(newState.map, state.currentNode?.id)
      newState.runStats = { ...state.runStats, floorsCleared: state.runStats.floorsCleared + 1 }
      return { ...newState, gamePhase: 'map', currentNode: undefined }
    }
    
    case 'ADVANCE_ACT': {
      if (state.currentAct >= 3) {
        return {
          ...state,
          gamePhase: 'victory'
        }
      }
      
      const newAct = state.currentAct + 1
      return {
        ...state,
        currentAct: newAct,
        currentFloor: 0,
        map: generateMap(newAct),
        gamePhase: 'map'
      }
    }
    
    case 'GAME_OVER':
      return {
        ...state,
        gamePhase: 'game_over'
      }
    
    case 'SET_PHASE':
      return {
        ...state,
        gamePhase: action.phase
      }
    
    case 'SAVE_GAME':
      if (typeof window !== 'undefined') {
        localStorage.setItem('deck-dungeon-save', JSON.stringify(state))
      }
      return state
    
    case 'LOAD_GAME':
      return action.gameState
    
    default:
      return state
  }
}

function startCombat(state: GameState, enemyIds: string[]): GameState {
  const enemies: Enemy[] = enemyIds.map(enemyId => {
    const enemyTemplate = ENEMIES[enemyId]
    return {
      ...enemyTemplate,
      hp: enemyTemplate.maxHp,
      statusEffects: {}
    }
  })
  
  const shuffledDeck = shuffleDeck([...state.player.deck])
  const initialHand = shuffledDeck.slice(0, 5)
  const drawPile = shuffledDeck.slice(5)
  
  const combatState: CombatState = {
    player: { ...state.player },
    enemies,
    hand: initialHand,
    drawPile,
    discardPile: [],
    activePowers: [],
    energy: 3,
    maxEnergy: 3,
    turn: 1,
    isPlayerTurn: true,
    combatEnded: false,
    victory: false
  }
  
  return {
    ...state,
    gamePhase: 'combat',
    combatState
  }
}