import { GameState, CombatState, Card, Enemy, Potion } from '../types'
import { CARDS, STARTER_DECK } from '../data/cards'
import { ENEMIES, ENEMY_ENCOUNTERS } from '../data/enemies'
import { RELICS } from '../data/relics'
import { POTIONS } from '../data/potions'
import { generateMap, getAvailableNodes } from './mapGenerator'
import { shuffleDeck, drawCards, applyCardEffects, processStatusEffects, enemyAI } from './combat'
import { createRng, todaySeed, todayLabel } from './seededRng'

export type GameAction = 
  | { type: 'START_NEW_GAME' }
  | { type: 'START_DAILY_CHALLENGE' }
  | { type: 'ENTER_NODE'; nodeId: string }
  | { type: 'START_COMBAT'; enemies: string[] }
  | { type: 'PLAY_CARD'; cardId: string; cardIndex?: number; targetEnemyId?: string }
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
  | { type: 'COLLECT_TREASURE' }
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
        dailyChallenge: undefined,
        runStats: {
          ...initialGameState.runStats,
          startTime: Date.now()
        }
      }
    
    case 'START_DAILY_CHALLENGE': {
      const seed = todaySeed()
      const rng = createRng(seed)
      return {
        ...initialGameState,
        player: {
          ...initialGameState.player,
          hp: 60,
          maxHp: 60,
          gold: 50,
          deck: STARTER_DECK.map(cardId => ({ ...CARDS[cardId] })),
          relics: [],
          potions: [],
          statusEffects: {}
        },
        map: generateMap(1, rng),
        gamePhase: 'map',
        dailyChallenge: {
          seed,
          date: todayLabel()
        },
        runStats: {
          floorsCleared: 0,
          enemiesKilled: 0,
          damageDealt: 0,
          cardsPlayed: 0,
          goldEarned: 0,
          startTime: Date.now()
        }
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
        
        case 'treasure': {
          const goldReward = 50 + Math.floor(Math.random() * 50)
          const treasurePlayer = { ...newState.player, gold: newState.player.gold + goldReward }
          const availableRelics = Object.values(RELICS).filter(
            r => !newState.player.relics.some(pr => pr.id === r.id)
          )
          let treasureRelic: typeof availableRelics[0] | undefined
          if (availableRelics.length > 0 && Math.random() < 0.5) {
            treasureRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)]
            treasurePlayer.relics = [...treasurePlayer.relics, treasureRelic]
          }
          return { ...newState, player: treasurePlayer, gamePhase: 'treasure', treasureReward: { gold: goldReward, relic: treasureRelic }, runStats: { ...newState.runStats, goldEarned: newState.runStats.goldEarned + goldReward } }
        }
        
        default:
          return newState
      }
    }
    
    case 'START_COMBAT':
      return startCombat(state, action.enemies)
    
    case 'PLAY_CARD': {
      if (!state.combatState || state.gamePhase !== 'combat') return state
      
      // FIX BUG-11: Use cardIndex when available for precise card selection
      const card = action.cardIndex !== undefined 
        ? state.combatState.hand[action.cardIndex]
        : state.combatState.hand.find(c => c.id === action.cardId)
      if (!card) return state
      if (card.special === 'unplayable') return state
      
      // Corruption: skills cost 0
      const hasCorruption = state.combatState.activePowers.some(p => p.special === 'corruption')
      let effectiveCost = (hasCorruption && card.type === 'skill') ? 0 : card.cost
      // BUG-06 FIX: Blood for Blood cost reduction
      if (card.special === 'blood_cost') {
        const startHp = state.player.maxHp
        const hpLost = startHp - state.combatState.player.hp
        const timesLostHp = Math.floor(hpLost / 1) // each HP lost counts
        effectiveCost = Math.max(0, effectiveCost - Math.min(timesLostHp, 4))
      }
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
      
      // Rage: gain 3 Block when playing an Attack
      if (card.type === 'attack' && updatedCombatState.activePowers.some(p => p.special === 'rage_passive')) {
        updatedCombatState.player = { ...updatedCombatState.player, block: (updatedCombatState.player.block || 0) + 3 }
      }
      
      // Relic: leech_fang — heal 1 HP when playing an Attack
      if (card.type === 'attack' && state.player.relics.some(r => r.effect === 'attack_heal')) {
        updatedCombatState.player = { ...updatedCombatState.player, hp: Math.min(state.player.maxHp, updatedCombatState.player.hp + 1) }
      }
      
      // Relic: ember_crown — gain 1 energy when playing a Power
      if (card.type === 'power' && state.player.relics.some(r => r.effect === 'power_energy')) {
        updatedCombatState.energy += 1
      }
      
      // Relic: ancient_tome — draw 1 card when playing a Power
      if (card.type === 'power' && state.player.relics.some(r => r.effect === 'power_draw')) {
        const drawn = drawCards(updatedCombatState, 1)
        updatedCombatState.hand = drawn.hand
        updatedCombatState.drawPile = drawn.drawPile
        updatedCombatState.discardPile = drawn.discardPile
      }
      
      // Relic: rage_crystal — gain 1 Block when playing an Attack
      if (card.type === 'attack' && state.player.relics.some(r => r.effect === 'attack_block')) {
        updatedCombatState.player = { ...updatedCombatState.player, block: (updatedCombatState.player.block || 0) + 1 }
      }
      
      // Move card to appropriate pile
      if (card.type === 'power') {
        // Power cards stay active for the rest of combat
        updatedCombatState.activePowers.push(card)
      } else if (card.exhaust || (hasCorruption && card.type === 'skill')) {
        // Exhausted cards are removed from game
        // Dark Embrace: draw 1 card on exhaust
        if (updatedCombatState.activePowers.some(p => p.special === 'dark_embrace')) {
          const drawn = drawCards(updatedCombatState, 1)
          updatedCombatState.hand = drawn.hand
          updatedCombatState.drawPile = drawn.drawPile
          updatedCombatState.discardPile = drawn.discardPile
        }
      } else {
        updatedCombatState.discardPile.push(card)
      }
      
      // Update run stats will be handled in main game state
      
      // Calculate actual damage dealt by comparing enemy HP before and after
      const totalHpBefore = state.combatState.enemies.reduce((sum, e) => sum + Math.max(0, e.hp), 0)
      const totalHpAfter = updatedCombatState.enemies.reduce((sum, e) => sum + Math.max(0, e.hp), 0)
      const actualDamageDealt = totalHpBefore - totalHpAfter

      // Relic: kill_strength — gain 2 Strength when killing an enemy
      const enemiesBefore = state.combatState.enemies.filter(e => e.hp > 0).length
      const aliveEnemies = updatedCombatState.enemies.filter(e => e.hp > 0)
      const enemiesKilledNow = enemiesBefore - aliveEnemies.length
      if (enemiesKilledNow > 0 && state.player.relics.some(r => r.effect === 'kill_strength')) {
        updatedCombatState.player.statusEffects = { ...updatedCombatState.player.statusEffects }
        updatedCombatState.player.statusEffects.strength = (updatedCombatState.player.statusEffects.strength || 0) + (2 * enemiesKilledNow)
      }
      
      // Check for combat end
      if (aliveEnemies.length === 0) {
        updatedCombatState.combatEnded = true
        updatedCombatState.victory = true
      }
      
      // Update run stats
      const newRunStats = {
        ...state.runStats,
        cardsPlayed: state.runStats.cardsPlayed + 1,
        damageDealt: state.runStats.damageDealt + actualDamageDealt,
        enemiesKilled: state.runStats.enemiesKilled + enemiesKilledNow
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
      
      // Relic: shadow_cloak — if 0 block at end of turn, gain 8 block
      if (state.player.relics.some(r => r.effect === 'no_block_shield') && newCombatState.player.block === 0) {
        newCombatState.player = { ...newCombatState.player, block: 8 }
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
      
      // Check if all enemies died during END_TURN (poison, thorns, Juggernaut, etc.)
      const aliveAfterTurn = newCombatState.enemies.filter(e => e.hp > 0)
      if (aliveAfterTurn.length === 0) {
        newCombatState.combatEnded = true
        newCombatState.victory = true
        return {
          ...state,
          combatState: newCombatState
        }
      }
      
      // Check for player death
      if (newCombatState.player.hp <= 0) {
        // BUG-04 FIX: Phoenix Feather — revive once
        const phoenixIdx = state.player.relics.findIndex(r => r.effect === 'phoenix_revival')
        if (phoenixIdx !== -1) {
          const reviveHp = Math.floor(state.player.maxHp * 0.25)
          newCombatState.player = { ...newCombatState.player, hp: reviveHp }
          // Remove phoenix feather (one use)
          const newRelics = [...state.player.relics]
          newRelics.splice(phoenixIdx, 1)
          return { ...state, player: { ...state.player, relics: newRelics }, combatState: newCombatState }
        }
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
      
      // Relic: demon_heart — gain 1 Strength at start of turn
      if (state.player.relics.some(r => r.effect === 'turn_strength')) {
        newCombatState.player.statusEffects.strength = (newCombatState.player.statusEffects.strength || 0) + 1
      }
      
      // Relic: soul_gem — lose 1 HP at start of turn
      if (state.player.relics.some(r => r.effect === 'energy_hp_cost')) {
        newCombatState.player.hp = Math.max(1, newCombatState.player.hp - 1)
      }
      
      // Relic: void_shard — +1 energy, -1 draw
      if (state.player.relics.some(r => r.effect === 'energy_less_draw')) {
        newCombatState.energy += 1
      }
      
      // Battle Trance: draw 1 extra card
      const hasBattleTrance = newCombatState.activePowers.some(p => p.special === 'battle_trance')
      // Relic: draw_ring — draw 1 extra card
      const hasDrawRing = state.player.relics.some(r => r.effect === 'extra_draw')
      const hasVoidShard = state.player.relics.some(r => r.effect === 'energy_less_draw')
      let drawCount = 5
      if (hasBattleTrance) drawCount += 1
      if (hasDrawRing) drawCount += 1
      if (hasVoidShard) drawCount -= 1
      newCombatState = drawCards(newCombatState, drawCount)
      
      return {
        ...state,
        combatState: newCombatState
      }
    }
    
    case 'CHOOSE_CARD_REWARD': {
      if (!state.combatState) return state
      
      let newState = { ...state }
      newState.player = { ...state.player, deck: [...state.player.deck] }
      
      if (action.cardId) {
        const card = CARDS[action.cardId]
        if (card) {
          newState.player.deck.push({ ...card })
        }
      }
      
      // FIX BUG-13: Grant gold reward after combat
      const goldReward = 15 + Math.floor(Math.random() * 10) + (state.currentNode?.type === 'elite' ? 15 : 0) + (state.currentNode?.type === 'boss' ? 30 : 0)
      newState.player = { ...newState.player, gold: newState.player.gold + goldReward }
      let combatGoldTotal = goldReward
      
      // Apply relic effects after combat
      if (newState.player.relics.some(r => r.effect === 'hp_after_combat') && state.currentNode?.type !== 'boss') {
        newState.player = { ...newState.player, maxHp: newState.player.maxHp + 3, hp: newState.player.hp + 3 }
      }
      if (newState.player.relics.some(r => r.effect === 'gold_per_combat')) {
        newState.player = { ...newState.player, gold: newState.player.gold + 10 }
        combatGoldTotal += 10
      }
      if (newState.player.relics.some(r => r.effect === 'heal_after_combat')) {
        newState.player = { ...newState.player, hp: Math.min(newState.player.maxHp, newState.player.hp + 2) }
      }
      if (newState.player.relics.some(r => r.effect === 'extra_gold_5')) {
        newState.player = { ...newState.player, gold: newState.player.gold + 5 }
        combatGoldTotal += 5
      }
      newState.runStats = { ...newState.runStats, goldEarned: newState.runStats.goldEarned + combatGoldTotal }
      
      // Update map availability
      newState.map = getAvailableNodes([...state.map], state.currentNode?.id)
      newState.runStats.floorsCleared++
      
      // BUG-03 FIX: If boss was defeated, advance act instead of returning to map
      if (state.currentNode?.type === 'boss') {
        if (state.currentAct >= 3) {
          return { ...newState, gamePhase: 'victory', combatState: undefined, currentNode: undefined }
        }
        const newAct = state.currentAct + 1
        const actRng = state.dailyChallenge ? createRng(state.dailyChallenge.seed + newAct) : undefined
        return {
          ...newState,
          currentAct: newAct,
          currentFloor: 0,
          map: generateMap(newAct, actRng),
          gamePhase: 'map',
          combatState: undefined,
          currentNode: undefined
        }
      }
      
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
      newState.map = getAvailableNodes([...state.map], state.currentNode?.id)
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
      newState.map = getAvailableNodes([...state.map], state.currentNode?.id)
      newState.runStats.floorsCleared++
      
      return {
        ...newState,
        gamePhase: 'map',
        currentNode: undefined
      }
    }
    
    case 'REST_REMOVE': {
      // FIX BUG-12: Only remove first matching card, not all copies
      const removeIdx = state.player.deck.findIndex(c => c.id === action.cardId)
      if (removeIdx === -1) return state
      const newDeck = [...state.player.deck]
      newDeck.splice(removeIdx, 1)
      
      const newState = {
        ...state,
        player: {
          ...state.player,
          deck: newDeck
        }
      }
      
      // Update map and return to map
      newState.map = getAvailableNodes([...state.map], state.currentNode?.id)
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
      return { ...state, player: { ...state.player, gold: state.player.gold + action.amount }, runStats: { ...state.runStats, goldEarned: state.runStats.goldEarned + action.amount } }
    
    case 'EVENT_HEAL':
      return { ...state, player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + action.amount) } }
    
    case 'EVENT_DAMAGE': {
      const newHp = state.player.hp - action.amount
      if (newHp <= 0) return { ...state, player: { ...state.player, hp: 0 }, gamePhase: 'game_over' }
      return { ...state, player: { ...state.player, hp: newHp } }
    }
    
    case 'EVENT_GAIN_MAX_HP':
      return { ...state, player: { ...state.player, maxHp: state.player.maxHp + action.amount, hp: state.player.hp + action.amount } }
    
    case 'COLLECT_TREASURE': {
      const newState = { ...state }
      newState.map = getAvailableNodes([...state.map], state.currentNode?.id)
      newState.runStats = { ...state.runStats, floorsCleared: state.runStats.floorsCleared + 1 }
      return { ...newState, gamePhase: 'map', currentNode: undefined, treasureReward: undefined }
    }

    case 'LEAVE_EVENT': {
      const newState = { ...state }
      newState.map = getAvailableNodes([...state.map], state.currentNode?.id)
      newState.runStats = { ...state.runStats, floorsCleared: state.runStats.floorsCleared + 1 }
      return { ...newState, gamePhase: 'map', currentNode: undefined }
    }
    
    case 'LEAVE_SHOP': {
      const newState = { ...state }
      newState.map = getAvailableNodes([...state.map], state.currentNode?.id)
      newState.runStats = { ...state.runStats, floorsCleared: state.runStats.floorsCleared + 1 }
      return { ...newState, gamePhase: 'map', currentNode: undefined }
    }
    
    case 'USE_POTION': {
      if (!state.combatState || state.gamePhase !== 'combat') return state
      const potionIndex = state.player.potions.findIndex(p => p.id === action.potionId)
      if (potionIndex === -1) return state
      
      const potion = state.player.potions[potionIndex]
      const newPotions = [...state.player.potions]
      newPotions.splice(potionIndex, 1)
      
      let newCombat = { ...state.combatState }
      let newPlayer = { ...state.player, potions: newPotions }
      
      switch (potion.effect) {
        case 'heal_20':
          newCombat.player = { ...newCombat.player, hp: Math.min(newCombat.player.maxHp, newCombat.player.hp + 20) }
          newPlayer.hp = newCombat.player.hp
          break
        case 'strength_2':
          newCombat.player.statusEffects = { ...newCombat.player.statusEffects, strength: (newCombat.player.statusEffects.strength || 0) + 2 }
          break
        case 'block_12':
          newCombat.player = { ...newCombat.player, block: (newCombat.player.block || 0) + 12 }
          break
        case 'damage_all_20':
          newCombat.enemies.forEach(e => { if (e.hp > 0) e.hp = Math.max(0, e.hp - 20) })
          break
        case 'draw_3': {
          newCombat = drawCards(newCombat, 3)
          break
        }
        case 'poison_6': {
          const target = action.targetEnemyId ? newCombat.enemies.find(e => e.id === action.targetEnemyId) : newCombat.enemies.find(e => e.hp > 0)
          if (target) target.statusEffects.poison = (target.statusEffects.poison || 0) + 6
          break
        }
        case 'energy_2':
          newCombat.energy += 2
          break
      }
      
      // Check if combat ended
      const alive = newCombat.enemies.filter(e => e.hp > 0)
      if (alive.length === 0) {
        newCombat.combatEnded = true
        newCombat.victory = true
      }
      
      return { ...state, player: newPlayer, combatState: newCombat }
    }
    
    case 'ADVANCE_ACT': {
      if (state.currentAct >= 3) {
        return {
          ...state,
          gamePhase: 'victory'
        }
      }
      
      const newAct = state.currentAct + 1
      const actRng = state.dailyChallenge ? createRng(state.dailyChallenge.seed + newAct) : undefined
      return {
        ...state,
        currentAct: newAct,
        currentFloor: 0,
        map: generateMap(newAct, actRng),
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
  const enemies: Enemy[] = enemyIds.map((enemyId, index) => {
    const enemyTemplate = ENEMIES[enemyId]
    return {
      ...enemyTemplate,
      id: `${enemyTemplate.id}_${index}`,
      hp: enemyTemplate.maxHp,
      statusEffects: {}
    }
  })
  
  const shuffledDeck = shuffleDeck([...state.player.deck])
  const initialHand = shuffledDeck.slice(0, 5)
  const drawPile = shuffledDeck.slice(5)
  
  // Base energy
  let startEnergy = 3
  let startMaxEnergy = 3
  let startBlock = 0
  const playerRelics = state.player.relics
  
  // Apply relic effects at combat start
  if (playerRelics.some(r => r.effect === 'combat_energy')) startMaxEnergy += 1
  if (playerRelics.some(r => r.effect === 'first_turn_energy')) startEnergy += 1
  if (playerRelics.some(r => r.effect === 'combat_block')) startBlock = 5
  if (playerRelics.some(r => r.effect === 'energy_hp_cost')) startMaxEnergy += 1
  
  startEnergy = Math.max(startEnergy, startMaxEnergy)
  
  const combatPlayer = { ...state.player, block: startBlock, statusEffects: {} as Partial<Record<import('../types').StatusEffect, number>> }
  
  // Relic: combat_strength
  if (playerRelics.some(r => r.effect === 'combat_strength')) {
    combatPlayer.statusEffects = { ...combatPlayer.statusEffects, strength: (combatPlayer.statusEffects.strength || 0) + 1 }
  }
  
  // Relic: thorns_ring — start with 1 thorns
  if (playerRelics.some(r => r.effect === 'thorns_passive')) {
    combatPlayer.statusEffects = { ...combatPlayer.statusEffects, thorns: (combatPlayer.statusEffects.thorns || 0) + 1 }
  }
  
  // Relic: combat_poison — apply 1 poison to all enemies
  if (playerRelics.some(r => r.effect === 'combat_poison')) {
    enemies.forEach(e => { e.statusEffects.poison = (e.statusEffects.poison || 0) + 1 })
  }
  
  // Relic: random_start_energy — gain 0-2 bonus energy
  if (playerRelics.some(r => r.effect === 'random_start_energy')) {
    const bonus = Math.floor(Math.random() * 3)
    startEnergy += bonus
  }
  
  // Relic: curse_trade — 2 Vulnerable on self, 2 Weak on all enemies
  if (playerRelics.some(r => r.effect === 'curse_trade')) {
    combatPlayer.statusEffects = { ...combatPlayer.statusEffects, vulnerable: (combatPlayer.statusEffects.vulnerable || 0) + 2 }
    enemies.forEach(e => { e.statusEffects.weak = (e.statusEffects.weak || 0) + 2 })
  }
  
  const combatState: CombatState = {
    player: combatPlayer,
    enemies,
    hand: initialHand,
    drawPile,
    discardPile: [],
    activePowers: [],
    energy: startEnergy,
    maxEnergy: startMaxEnergy,
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