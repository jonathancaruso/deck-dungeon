import { CombatState, Card, Enemy, StatusEffect } from '../types'
import { CARDS } from '../data/cards'

export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function drawCards(combatState: CombatState, count: number): CombatState {
  const newState = { ...combatState }
  let drawn = 0
  
  while (drawn < count && (newState.drawPile.length > 0 || newState.discardPile.length > 0)) {
    if (newState.drawPile.length === 0) {
      // Reshuffle discard pile into draw pile
      newState.drawPile = shuffleDeck([...newState.discardPile])
      newState.discardPile = []
    }
    
    if (newState.drawPile.length > 0) {
      const card = newState.drawPile.shift()!
      newState.hand.push(card)
      drawn++
    } else {
      break
    }
  }
  
  return newState
}

export function calculateCardDamage(card: Card, combatState: CombatState): number {
  let damage = card.damage || 0
  const strength = combatState.player.statusEffects.strength || 0
  const weak = combatState.player.statusEffects.weak || 0
  
  damage += strength
  if (weak > 0) {
    damage = Math.floor(damage * 0.75)
  }
  
  return Math.max(0, damage)
}

export function calculateCardBlock(card: Card, combatState: CombatState): number {
  let block = card.block || 0
  // Block is not affected by strength in this simplified version
  return Math.max(0, block)
}

export function applyCardEffects(card: Card, combatState: CombatState, targetEnemy?: Enemy): CombatState {
  const newState = { ...combatState }
  
  // Apply damage
  if (card.damage && targetEnemy) {
    const damage = calculateCardDamage(card, combatState)
    applyDamageToEnemy(targetEnemy, damage, newState)
  }
  
  // Apply block
  if (card.block) {
    const block = calculateCardBlock(card, combatState)
    newState.player = { ...newState.player, block: (newState.player.block || 0) + block }
    
    // Juggernaut: deal 5 damage to a random enemy when gaining block
    if (newState.activePowers?.some(p => p.special === 'juggernaut')) {
      const aliveEnemies = newState.enemies.filter(e => e.hp > 0)
      if (aliveEnemies.length > 0) {
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
        applyDamageToEnemy(target, 5, newState)
      }
    }
  }
  
  // Apply status effects
  if (card.statusEffect) {
    if (card.statusEffect.target === 'self') {
      newState.player.statusEffects[card.statusEffect.type] = 
        (newState.player.statusEffects[card.statusEffect.type] || 0) + card.statusEffect.amount
    } else if (card.statusEffect.target === 'enemy' && targetEnemy) {
      targetEnemy.statusEffects[card.statusEffect.type] = 
        (targetEnemy.statusEffects[card.statusEffect.type] || 0) + card.statusEffect.amount
    } else if (card.statusEffect.target === 'all_enemies') {
      newState.enemies.forEach(enemy => {
        enemy.statusEffects[card.statusEffect!.type] = 
          (enemy.statusEffects[card.statusEffect!.type] || 0) + card.statusEffect!.amount
      })
    }
  }
  
  // Handle special effects
  if (card.special) {
    handleSpecialEffects(card.special, newState, targetEnemy, card)
  }
  
  return newState
}

function applyDamageToEnemy(enemy: Enemy, damage: number, combatState: CombatState): void {
  // Apply vulnerable
  if ((enemy.statusEffects.vulnerable || 0) > 0) {
    damage = Math.floor(damage * 1.5)
  }
  
  enemy.hp = Math.max(0, enemy.hp - damage)
  
  // Enemy killed - this will be handled in the reducer
}

function handleSpecialEffects(special: string, combatState: CombatState, targetEnemy?: Enemy, card?: Card): void {
  switch (special) {
    case 'cleave':
      // Damage all enemies - handled in card play logic
      break
    case 'draw_card':
      combatState.hand.push(...drawCards(combatState, 1).hand.slice(-1))
      break
    case 'multi_hit':
      // Second hit (first hit already applied above)
      if (targetEnemy && card) {
        const damage = calculateCardDamage(card, combatState)
        applyDamageToEnemy(targetEnemy, damage, combatState)
      }
      break
    case 'execute':
      if (targetEnemy && targetEnemy.hp === 0) {
        combatState.energy += 1
      }
      break
    // Add more special effects as needed
  }
}

export function processStatusEffects(combatState: CombatState): CombatState {
  const newState = { ...combatState }
  
  // Process player status effects
  const playerEffects = { ...newState.player.statusEffects }
  
  // Poison damage
  if ((playerEffects.poison || 0) > 0) {
    newState.player.hp = Math.max(0, newState.player.hp - (playerEffects.poison || 0))
    playerEffects.poison = (playerEffects.poison || 1) - 1
  }
  
  // Regeneration
  if ((playerEffects.regen || 0) > 0) {
    newState.player.hp = Math.min(newState.player.maxHp, newState.player.hp + (playerEffects.regen || 0))
  }
  
  // Weak/Vulnerable countdown
  if ((playerEffects.weak || 0) > 0) playerEffects.weak = (playerEffects.weak || 1) - 1
  if ((playerEffects.vulnerable || 0) > 0) playerEffects.vulnerable = (playerEffects.vulnerable || 1) - 1
  
  newState.player.statusEffects = playerEffects
  
  // Process enemy status effects
  newState.enemies.forEach(enemy => {
    const enemyEffects = { ...enemy.statusEffects }
    
    // Poison damage
    if ((enemyEffects.poison || 0) > 0) {
      enemy.hp = Math.max(0, enemy.hp - (enemyEffects.poison || 0))
      enemyEffects.poison = (enemyEffects.poison || 1) - 1
    }
    
    // Regeneration
    if ((enemyEffects.regen || 0) > 0) {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + (enemyEffects.regen || 0))
    }
    
    // Status countdown
    if ((enemyEffects.weak || 0) > 0) enemyEffects.weak = (enemyEffects.weak || 1) - 1
    if ((enemyEffects.vulnerable || 0) > 0) enemyEffects.vulnerable = (enemyEffects.vulnerable || 1) - 1
    
    enemy.statusEffects = enemyEffects
  })
  
  return newState
}

export function enemyAI(enemy: Enemy, combatState: CombatState): void {
  const action = enemy.nextAction
  
  switch (action.type) {
    case 'attack':
      if (action.damage) {
        let damage = action.damage
        // Apply vulnerable to player
        const playerBlock = combatState.player.block || 0
        if (playerBlock > 0) {
          if (playerBlock >= damage) {
            combatState.player.block = playerBlock - damage
            damage = 0
          } else {
            damage -= playerBlock
            combatState.player.block = 0
          }
        }
        if (damage > 0) {
          combatState.player.hp = Math.max(0, combatState.player.hp - damage)
        }
      }
      break
    case 'defend':
      if (action.block) {
        // Enemy gains block (not implemented in this simple version)
      }
      break
    case 'buff':
      if (action.statusEffect) {
        enemy.statusEffects[action.statusEffect.type] = 
          (enemy.statusEffects[action.statusEffect.type] || 0) + action.statusEffect.amount
      }
      break
    case 'debuff':
      if (action.statusEffect) {
        combatState.player.statusEffects[action.statusEffect.type] = 
          (combatState.player.statusEffects[action.statusEffect.type] || 0) + action.statusEffect.amount
      }
      break
  }
  
  // Generate next action (simplified)
  generateEnemyIntent(enemy)
}

function generateEnemyIntent(enemy: Enemy): void {
  // Simplified AI - just cycle through different actions
  const actions = ['attack', 'defend', 'buff'] as const
  const randomAction = actions[Math.floor(Math.random() * actions.length)]
  
  enemy.intent = randomAction
  
  switch (randomAction) {
    case 'attack':
      enemy.nextAction = {
        type: 'attack',
        damage: Math.floor(Math.random() * 10) + 5
      }
      break
    case 'defend':
      enemy.nextAction = {
        type: 'defend',
        block: Math.floor(Math.random() * 8) + 3
      }
      break
    case 'buff':
      enemy.nextAction = {
        type: 'buff',
        statusEffect: { type: 'strength', amount: 1 }
      }
      break
  }
}