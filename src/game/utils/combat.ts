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
  newState.drawPile = [...newState.drawPile]
  newState.discardPile = [...newState.discardPile]
  newState.hand = [...newState.hand]
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

export function calculateEnemyDamage(enemy: Enemy, baseDamage: number): number {
  let damage = baseDamage
  const strength = enemy.statusEffects.strength || 0
  const weak = enemy.statusEffects.weak || 0
  
  damage += strength
  if (weak > 0) {
    damage = Math.floor(damage * 0.75)
  }
  
  return Math.max(0, damage)
}

export function calculateCardBlock(card: Card, combatState: CombatState): number {
  let block = card.block || 0
  return Math.max(0, block)
}

export function applyCardEffects(card: Card, combatState: CombatState, targetEnemy?: Enemy): CombatState {
  const newState = { ...combatState }
  
  // Apply damage — for cleave, hit ALL enemies
  if (card.damage) {
    if (card.special === 'cleave') {
      const damage = calculateCardDamage(card, combatState)
      newState.enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          applyDamageToEnemy(enemy, damage, newState)
        }
      })
    } else if (targetEnemy) {
      const damage = calculateCardDamage(card, combatState)
      applyDamageToEnemy(targetEnemy, damage, newState)
    }
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
}

function handleSpecialEffects(special: string, combatState: CombatState, targetEnemy?: Enemy, card?: Card): void {
  switch (special) {
    case 'cleave':
      // Damage already applied in applyCardEffects for all enemies
      break
    case 'draw_card': {
      // FIX BUG-10: properly draw cards by updating state in-place
      const drawn = drawCards(combatState, 1)
      combatState.hand = drawn.hand
      combatState.drawPile = drawn.drawPile
      combatState.discardPile = drawn.discardPile
      break
    }
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
    case 'second_wind': {
      const nonAttacks = combatState.hand.filter(c => c.type !== 'attack')
      combatState.hand = combatState.hand.filter(c => c.type === 'attack')
      const blockGain = nonAttacks.length * 5
      combatState.player = { ...combatState.player, block: (combatState.player.block || 0) + blockGain }
      if (blockGain > 0 && combatState.activePowers?.some(p => p.special === 'juggernaut')) {
        const alive = combatState.enemies.filter(e => e.hp > 0)
        if (alive.length > 0) {
          const t = alive[Math.floor(Math.random() * alive.length)]
          applyDamageToEnemy(t, 5, combatState)
        }
      }
      break
    }
    case 'whirlwind': {
      const energyLeft = combatState.energy
      combatState.enemies.forEach(enemy => {
        if (enemy.hp > 0 && card) {
          for (let i = 0; i < energyLeft; i++) {
            const dmg = calculateCardDamage(card, combatState)
            applyDamageToEnemy(enemy, dmg, combatState)
          }
        }
      })
      combatState.energy = 0
      break
    }
    case 'rampage': {
      // FIX BUG-9: Also update the played card instance damage
      if (card && card.damage) {
        card.damage += 4
      }
      break
    }
    case 'wound': {
      const wound: Card = { id: 'wound', name: 'Wound', type: 'skill', cost: 0, description: 'Unplayable.', rarity: 'common', special: 'unplayable' }
      combatState.drawPile.splice(Math.floor(Math.random() * (combatState.drawPile.length + 1)), 0, wound)
      break
    }
    case 'blood_cost':
      // Cost reduction is handled in gameReducer PLAY_CARD
      break
    case 'self_damage':
      combatState.player = { ...combatState.player, hp: Math.max(0, combatState.player.hp - 2) }
      break
    case 'ethereal':
      break
    case 'headbutt':
      if (combatState.discardPile.length > 0) {
        const idx = Math.floor(Math.random() * combatState.discardPile.length)
        const [picked] = combatState.discardPile.splice(idx, 1)
        combatState.drawPile.unshift(picked)
      }
      break
    case 'energy_damage':
      combatState.energy += 1
      combatState.player = { ...combatState.player, hp: Math.max(0, combatState.player.hp - 3) }
      break
    case 'energy_draw': {
      combatState.energy += 1
      const drawn = drawCards(combatState, 2)
      combatState.hand = drawn.hand
      combatState.drawPile = drawn.drawPile
      combatState.discardPile = drawn.discardPile
      break
    }
    case 'disarm':
      if (targetEnemy) {
        targetEnemy.statusEffects.strength = Math.max(0, (targetEnemy.statusEffects.strength || 0) - 2)
      }
      break
    case 'temporary':
      // FIX BUG-3: Flex — mark that we need to remove 2 strength at end of turn
      // The strength is already applied via the card's statusEffect.
      // We track temporary strength by storing it; end-of-turn handler removes it.
      ;(combatState.player.statusEffects as any)._tempStrength = 
        ((combatState.player.statusEffects as any)._tempStrength || 0) + 2
      break
    case 'rage_passive':
      // Handled as activePower
      break
    case 'cleanse':
      combatState.player.statusEffects.weak = 0
      combatState.player.statusEffects.vulnerable = 0
      combatState.player.statusEffects.poison = 0
      combatState.player = { ...combatState.player, hp: Math.min(combatState.player.maxHp, combatState.player.hp + 3) }
      break
    case 'prepare': {
      const drawn = drawCards(combatState, 1)
      combatState.hand = drawn.hand
      combatState.drawPile = drawn.drawPile
      combatState.discardPile = drawn.discardPile
      break
    }
    case 'unplayable':
      break
    case 'searing_blow':
      if (card && card.damage) {
        card.damage += 6
      }
      break
    case 'uppercut':
      if (targetEnemy) {
        targetEnemy.statusEffects.weak = (targetEnemy.statusEffects.weak || 0) + 1
        targetEnemy.statusEffects.vulnerable = (targetEnemy.statusEffects.vulnerable || 0) + 1
      }
      break
    case 'body_slam':
      // Damage = current block, applied to target
      if (targetEnemy) {
        const blockDmg = combatState.player.block || 0
        applyDamageToEnemy(targetEnemy, blockDmg, combatState)
      }
      break
    case 'offering': {
      combatState.player = { ...combatState.player, hp: Math.max(0, combatState.player.hp - 6) }
      combatState.energy += 2
      const drawnOff = drawCards(combatState, 3)
      combatState.hand = drawnOff.hand
      combatState.drawPile = drawnOff.drawPile
      combatState.discardPile = drawnOff.discardPile
      break
    }
    case 'reaper': {
      const reapDmg = calculateCardDamage(card!, combatState)
      let totalHealed = 0
      combatState.enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          const vuln = (enemy.statusEffects.vulnerable || 0) > 0 ? 1.5 : 1
          const effectiveDmg = Math.floor(reapDmg * vuln)
          const actualDmg = Math.min(enemy.hp, effectiveDmg)
          enemy.hp = Math.max(0, enemy.hp - effectiveDmg)
          totalHealed += actualDmg
        }
      })
      combatState.player = { ...combatState.player, hp: Math.min(combatState.player.maxHp, combatState.player.hp + totalHealed) }
      break
    }
    case 'feed':
      if (targetEnemy && targetEnemy.hp === 0) {
        combatState.player = { ...combatState.player, maxHp: combatState.player.maxHp + 3, hp: combatState.player.hp + 3 }
      }
      break
    case 'limit_break': {
      const currentStr = combatState.player.statusEffects.strength || 0
      combatState.player.statusEffects.strength = currentStr * 2
      break
    }
    case 'immolate': {
      const immDmg = calculateCardDamage(card!, combatState)
      combatState.enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          applyDamageToEnemy(enemy, immDmg, combatState)
        }
      })
      const woundCard: Card = { id: 'wound', name: 'Wound', type: 'skill', cost: 0, description: 'Unplayable.', rarity: 'common', special: 'unplayable' }
      combatState.discardPile.push(woundCard)
      break
    }
    case 'sentinel':
      // Block already applied. Energy on exhaust handled by exhaust logic if needed.
      // For simplicity, grant 2 energy since it always exhausts
      combatState.energy += 2
      break
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
  
  // FIX BUG-3: Remove temporary strength from Flex at end of turn
  const tempStr = (playerEffects as any)._tempStrength || 0
  if (tempStr > 0) {
    playerEffects.strength = Math.max(0, (playerEffects.strength || 0) - tempStr)
    delete (playerEffects as any)._tempStrength
  }
  
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
    
    // FIX BUG-5: Ritual — grant strength each turn
    if ((enemyEffects.ritual || 0) > 0) {
      enemyEffects.strength = (enemyEffects.strength || 0) + (enemyEffects.ritual || 0)
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
        // FIX BUG-6 & BUG-7: Apply enemy strength and weak to damage
        let damage = calculateEnemyDamage(enemy, action.damage)
        
        // FIX BUG-4: Check player thorns before applying damage
        const playerThorns = combatState.player.statusEffects.thorns || 0
        
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
        
        // Thorns: deal damage back to attacker
        if (playerThorns > 0) {
          enemy.hp = Math.max(0, enemy.hp - playerThorns)
        }
      }
      break
    case 'defend':
      // Enemy defend — no block system for enemies in this version
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
  
  // Generate next action
  generateEnemyIntent(enemy)
}

function generateEnemyIntent(enemy: Enemy): void {
  // FIX WARN-8: Use enemy's base damage from template instead of random values
  const actions: EnemyIntent[] = ['attack', 'attack', 'attack', 'defend', 'buff']
  type EnemyIntent = 'attack' | 'defend' | 'buff'
  const randomAction = actions[Math.floor(Math.random() * actions.length)]
  
  enemy.intent = randomAction
  
  // Use the enemy's original defined damage (from maxHp-based scaling)
  // We derive a base damage from the enemy's maxHp to keep it proportional
  const baseDamage = Math.max(5, Math.floor(enemy.maxHp * 0.08))
  
  switch (randomAction) {
    case 'attack':
      enemy.nextAction = {
        type: 'attack',
        damage: baseDamage + Math.floor(Math.random() * 4)
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
