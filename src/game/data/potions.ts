import { Potion } from '../types'

export const POTIONS: Record<string, Potion> = {
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Heal 20 HP.',
    effect: 'heal_20'
  },
  
  strength_potion: {
    id: 'strength_potion',
    name: 'Strength Potion',
    description: 'Gain 2 Strength for this combat.',
    effect: 'strength_2'
  },
  
  block_potion: {
    id: 'block_potion',
    name: 'Block Potion',
    description: 'Gain 12 Block.',
    effect: 'block_12'
  },
  
  fire_potion: {
    id: 'fire_potion',
    name: 'Fire Potion',
    description: 'Deal 20 damage to ALL enemies.',
    effect: 'damage_all_20'
  },
  
  speed_potion: {
    id: 'speed_potion',
    name: 'Speed Potion',
    description: 'Draw 3 cards.',
    effect: 'draw_3'
  },
  
  poison_potion: {
    id: 'poison_potion',
    name: 'Poison Potion',
    description: 'Apply 6 Poison to target enemy.',
    effect: 'poison_6'
  },
  
  energy_potion: {
    id: 'energy_potion',
    name: 'Energy Potion',
    description: 'Gain 2 energy this turn.',
    effect: 'energy_2'
  }
}

export const POTION_POOLS = {
  1: ['health_potion', 'strength_potion', 'block_potion'],
  2: ['health_potion', 'strength_potion', 'block_potion', 'fire_potion', 'speed_potion'],
  3: ['health_potion', 'strength_potion', 'block_potion', 'fire_potion', 'speed_potion', 'poison_potion', 'energy_potion']
}