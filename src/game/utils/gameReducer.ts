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
  | { type: 'BUY_CARD'; cardId: string }
  | { type: 'BUY_RELIC'; relicId: string }
  | { type: 'REMOVE_CARD'; cardId: string }
  | { type: 'CHOOSE_EVENT_OPTION'; choiceId: string }
  | { type: 'USE_POTION'; potionId: string; targetEnemyId?: string }
  | { type: 'ADVANCE_ACT' }
  | { type: 'GAME_OVER' }
  | { type: 'LOAD_GAME'; gameState: GameState }
  | { type: 'SAVE_GAME' }

export const initialGameState: GameState = {
  player: {
    hp: 70,
    maxHp: 70,
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
      if (!card || state.combatState.energy < card.cost) return state
      
      let targetEnemy: Enemy | undefined
      if (card.type === 'attack' && action.targetEnemyId) {
        targetEnemy = state.combatState.enemies.find(e => e.id === action.targetEnemyId && e.hp > 0)
        if (!targetEnemy) return state
      }
      
      const newCombatState = { ...state.combatState }
      
      // Remove card from hand
      newCombatState.hand = newCombatState.hand.filter(c => c !== card)
      
      // Pay energy cost
      newCombatState.energy -= card.cost
      
      // Apply card effects
      const updatedCombatState = applyCardEffects(card, newCombatState, targetEnemy)
      
      // Move card to discard pile (unless it exhausts)
      if (card.exhaust) {
        // Card is exhausted and removed from game
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
      newCombatState = drawCards(newCombatState, 5)
      
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