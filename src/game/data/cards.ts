import { Card } from '../types'

export const CARDS: Record<string, Card> = {
  // ATTACK CARDS (RED)
  strike: {
    id: 'strike',
    name: 'Strike',
    type: 'attack',
    cost: 1,
    damage: 6,
    description: 'Deal 6 damage.',
    rarity: 'common'
  },
  heavy_slash: {
    id: 'heavy_slash',
    name: 'Heavy Slash',
    type: 'attack',
    cost: 2,
    damage: 14,
    description: 'Deal 14 damage.',
    rarity: 'common'
  },
  cleave: {
    id: 'cleave',
    name: 'Cleave',
    type: 'attack',
    cost: 1,
    damage: 8,
    description: 'Deal 8 damage to ALL enemies.',
    rarity: 'common',
    special: 'cleave'
  },
  execute: {
    id: 'execute',
    name: 'Execute',
    type: 'attack',
    cost: 1,
    damage: 9,
    description: 'Deal 9 damage. If this kills an enemy, gain 1 energy.',
    rarity: 'uncommon',
    special: 'execute'
  },
  fury: {
    id: 'fury',
    name: 'Fury',
    type: 'attack',
    cost: 0,
    damage: 5,
    description: 'Deal 5 damage. Draw 1 card.',
    rarity: 'common',
    special: 'draw_card'
  },
  whirlwind: {
    id: 'whirlwind',
    name: 'Whirlwind',
    type: 'attack',
    cost: 0,
    damage: 5,
    description: 'Deal 5 damage to ALL enemies for each energy remaining.',
    rarity: 'uncommon',
    special: 'whirlwind'
  },
  rampage: {
    id: 'rampage',
    name: 'Rampage',
    type: 'attack',
    cost: 1,
    damage: 8,
    description: 'Deal 8 damage. This card gains 4 damage permanently.',
    rarity: 'rare',
    special: 'rampage'
  },
  backstab: {
    id: 'backstab',
    name: 'Backstab',
    type: 'attack',
    cost: 0,
    damage: 11,
    description: 'Deal 11 damage. Exhaust.',
    rarity: 'uncommon',
    exhaust: true
  },
  poison_strike: {
    id: 'poison_strike',
    name: 'Poison Strike',
    type: 'attack',
    cost: 1,
    damage: 6,
    description: 'Deal 6 damage. Apply 3 Poison.',
    rarity: 'common',
    statusEffect: { type: 'poison', amount: 3, target: 'enemy' }
  },
  wild_strike: {
    id: 'wild_strike',
    name: 'Wild Strike',
    type: 'attack',
    cost: 1,
    damage: 12,
    description: 'Deal 12 damage. Shuffle a Wound into your draw pile.',
    rarity: 'common',
    special: 'wound'
  },
  twin_strike: {
    id: 'twin_strike',
    name: 'Twin Strike',
    type: 'attack',
    cost: 1,
    damage: 5,
    description: 'Deal 5 damage twice.',
    rarity: 'common',
    special: 'multi_hit'
  },
  blood_for_blood: {
    id: 'blood_for_blood',
    name: 'Blood for Blood',
    type: 'attack',
    cost: 4,
    damage: 18,
    description: 'Deal 18 damage. Costs 1 less for each time you lose HP this combat.',
    rarity: 'rare',
    special: 'blood_cost'
  },
  berserk: {
    id: 'berserk',
    name: 'Berserk',
    type: 'attack',
    cost: 0,
    damage: 6,
    description: 'Deal 6 damage. Take 2 damage.',
    rarity: 'common',
    special: 'self_damage'
  },
  carnage: {
    id: 'carnage',
    name: 'Carnage',
    type: 'attack',
    cost: 2,
    damage: 20,
    description: 'Deal 20 damage. Must be played with no other cards this turn.',
    rarity: 'rare',
    special: 'ethereal'
  },
  headbutt: {
    id: 'headbutt',
    name: 'Headbutt',
    type: 'attack',
    cost: 1,
    damage: 9,
    description: 'Deal 9 damage. Put a card from discard pile on top of draw pile.',
    rarity: 'uncommon',
    special: 'headbutt'
  },

  // SKILL CARDS (GREEN)
  defend: {
    id: 'defend',
    name: 'Defend',
    type: 'skill',
    cost: 1,
    block: 5,
    description: 'Gain 5 Block.',
    rarity: 'common'
  },
  dodge: {
    id: 'dodge',
    name: 'Dodge',
    type: 'skill',
    cost: 1,
    block: 4,
    description: 'Gain 4 Block. Draw 1 card.',
    rarity: 'common',
    special: 'draw_card'
  },
  fortify: {
    id: 'fortify',
    name: 'Fortify',
    type: 'skill',
    cost: 1,
    block: 12,
    description: 'Gain 12 Block. Exhaust.',
    rarity: 'uncommon',
    exhaust: true
  },
  second_wind: {
    id: 'second_wind',
    name: 'Second Wind',
    type: 'skill',
    cost: 1,
    description: 'Exhaust all non-Attack cards in hand. Gain 5 Block for each.',
    rarity: 'uncommon',
    special: 'second_wind'
  },
  dark_ritual: {
    id: 'dark_ritual',
    name: 'Dark Ritual',
    type: 'skill',
    cost: 2,
    description: 'Gain 1 energy. Take 3 damage.',
    rarity: 'uncommon',
    special: 'energy_damage'
  },
  adrenaline: {
    id: 'adrenaline',
    name: 'Adrenaline',
    type: 'skill',
    cost: 0,
    description: 'Gain 1 energy. Draw 2 cards. Exhaust.',
    rarity: 'rare',
    exhaust: true,
    special: 'energy_draw'
  },
  smoke_bomb: {
    id: 'smoke_bomb',
    name: 'Smoke Bomb',
    type: 'skill',
    cost: 1,
    description: 'Apply 2 Weak to ALL enemies.',
    rarity: 'common',
    statusEffect: { type: 'weak', amount: 2, target: 'all_enemies' }
  },
  shrug_it_off: {
    id: 'shrug_it_off',
    name: 'Shrug It Off',
    type: 'skill',
    cost: 1,
    block: 8,
    description: 'Gain 8 Block. Draw 1 card.',
    rarity: 'common',
    special: 'draw_card'
  },
  disarm: {
    id: 'disarm',
    name: 'Disarm',
    type: 'skill',
    cost: 1,
    description: 'Enemy loses 2 Strength. Exhaust.',
    rarity: 'uncommon',
    exhaust: true,
    special: 'disarm'
  },
  intimidate: {
    id: 'intimidate',
    name: 'Intimidate',
    type: 'skill',
    cost: 0,
    description: 'Apply 1 Weak to ALL enemies. Exhaust.',
    rarity: 'uncommon',
    exhaust: true,
    statusEffect: { type: 'weak', amount: 1, target: 'all_enemies' }
  },
  flex: {
    id: 'flex',
    name: 'Flex',
    type: 'skill',
    cost: 0,
    description: 'Gain 2 Strength. At end of turn, lose 2 Strength.',
    rarity: 'common',
    statusEffect: { type: 'strength', amount: 2, target: 'self' },
    special: 'temporary'
  },
  rage: {
    id: 'rage',
    name: 'Rage',
    type: 'power',
    cost: 0,
    description: 'Whenever you play an Attack, gain 3 Block.',
    rarity: 'uncommon',
    special: 'rage_passive'
  },
  cleanse: {
    id: 'cleanse',
    name: 'Cleanse',
    type: 'skill',
    cost: 1,
    description: 'Remove all debuffs. Heal 3 HP.',
    rarity: 'uncommon',
    special: 'cleanse'
  },
  prepare: {
    id: 'prepare',
    name: 'Prepare',
    type: 'skill',
    cost: 0,
    description: 'Draw 1 card. Discard 1 card.',
    rarity: 'common',
    special: 'prepare'
  },

  // POWER CARDS (PURPLE)
  strength_up: {
    id: 'strength_up',
    name: 'Strength Up',
    type: 'power',
    cost: 1,
    description: 'Gain 2 Strength.',
    rarity: 'common',
    statusEffect: { type: 'strength', amount: 2, target: 'self' }
  },
  thorns: {
    id: 'thorns',
    name: 'Thorns',
    type: 'power',
    cost: 2,
    description: 'Whenever you take damage, deal 3 damage to the attacker.',
    rarity: 'uncommon',
    statusEffect: { type: 'thorns', amount: 3, target: 'self' }
  },
  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    type: 'power',
    cost: 1,
    description: 'At the end of your turn, heal 5 HP.',
    rarity: 'uncommon',
    statusEffect: { type: 'regen', amount: 5, target: 'self' }
  },
  battle_trance: {
    id: 'battle_trance',
    name: 'Battle Trance',
    type: 'power',
    cost: 0,
    description: 'Draw 1 additional card each turn. You cannot draw status cards.',
    rarity: 'uncommon',
    special: 'battle_trance'
  },
  demon_form: {
    id: 'demon_form',
    name: 'Demon Form',
    type: 'power',
    cost: 3,
    description: 'At the start of each turn, gain 2 Strength.',
    rarity: 'rare',
    special: 'demon_form'
  },
  juggernaut: {
    id: 'juggernaut',
    name: 'Juggernaut',
    type: 'power',
    cost: 2,
    description: 'Whenever you gain Block, deal 5 damage to a random enemy.',
    rarity: 'rare',
    special: 'juggernaut'
  },
  barricade: {
    id: 'barricade',
    name: 'Barricade',
    type: 'power',
    cost: 3,
    description: 'Block is not removed at the start of your turn.',
    rarity: 'rare',
    special: 'barricade'
  },
  corruption: {
    id: 'corruption',
    name: 'Corruption',
    type: 'power',
    cost: 3,
    description: 'Skills cost 0. Whenever you play a Skill, Exhaust it.',
    rarity: 'rare',
    special: 'corruption'
  },
  metallicize: {
    id: 'metallicize',
    name: 'Metallicize',
    type: 'power',
    cost: 1,
    description: 'At the end of your turn, gain 3 Block.',
    rarity: 'uncommon',
    special: 'metallicize'
  },
  evolve: {
    id: 'evolve',
    name: 'Evolve',
    type: 'power',
    cost: 1,
    description: 'Whenever you draw a Status card, draw 1 card.',
    rarity: 'uncommon',
    special: 'evolve'
  },

  // ACT 2+ EXCLUSIVE CARDS
  searing_blow: {
    id: 'searing_blow',
    name: 'Searing Blow',
    type: 'attack',
    cost: 2,
    damage: 12,
    description: 'Deal 12 damage. This card gains 6 damage permanently.',
    rarity: 'uncommon',
    special: 'searing_blow'
  },
  uppercut: {
    id: 'uppercut',
    name: 'Uppercut',
    type: 'attack',
    cost: 2,
    damage: 13,
    description: 'Deal 13 damage. Apply 1 Weak and 1 Vulnerable.',
    rarity: 'uncommon',
    special: 'uppercut'
  },
  body_slam: {
    id: 'body_slam',
    name: 'Body Slam',
    type: 'attack',
    cost: 1,
    damage: 0,
    description: 'Deal damage equal to your Block.',
    rarity: 'uncommon',
    special: 'body_slam'
  },
  impervious: {
    id: 'impervious',
    name: 'Impervious',
    type: 'skill',
    cost: 2,
    block: 30,
    description: 'Gain 30 Block. Exhaust.',
    rarity: 'rare',
    exhaust: true
  },
  offering: {
    id: 'offering',
    name: 'Offering',
    type: 'skill',
    cost: 0,
    description: 'Lose 6 HP. Gain 2 energy. Draw 3 cards. Exhaust.',
    rarity: 'rare',
    exhaust: true,
    special: 'offering'
  },
  infernal_blade: {
    id: 'infernal_blade',
    name: 'Infernal Blade',
    type: 'attack',
    cost: 1,
    damage: 6,
    description: 'Deal 6 damage. Apply 4 Vulnerable.',
    rarity: 'common',
    statusEffect: { type: 'vulnerable', amount: 4, target: 'enemy' }
  },

  // ACT 3 EXCLUSIVE CARDS
  reaper: {
    id: 'reaper',
    name: 'Reaper',
    type: 'attack',
    cost: 2,
    damage: 4,
    description: 'Deal 4 damage to ALL enemies. Heal HP equal to unblocked damage dealt.',
    rarity: 'rare',
    special: 'reaper'
  },
  feed: {
    id: 'feed',
    name: 'Feed',
    type: 'attack',
    cost: 1,
    damage: 10,
    description: 'Deal 10 damage. If this kills, gain 3 max HP. Exhaust.',
    rarity: 'rare',
    exhaust: true,
    special: 'feed'
  },
  limit_break: {
    id: 'limit_break',
    name: 'Limit Break',
    type: 'skill',
    cost: 1,
    description: 'Double your Strength. Exhaust.',
    rarity: 'rare',
    exhaust: true,
    special: 'limit_break'
  },
  immolate: {
    id: 'immolate',
    name: 'Immolate',
    type: 'attack',
    cost: 2,
    damage: 21,
    description: 'Deal 21 damage to ALL enemies. Shuffle a Wound into your discard pile.',
    rarity: 'rare',
    special: 'immolate'
  },
  dark_embrace: {
    id: 'dark_embrace',
    name: 'Dark Embrace',
    type: 'power',
    cost: 2,
    description: 'Whenever a card is Exhausted, draw 1 card.',
    rarity: 'rare',
    special: 'dark_embrace'
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    type: 'skill',
    cost: 1,
    block: 5,
    description: 'Gain 5 Block. If Exhausted, gain 2 energy.',
    rarity: 'uncommon',
    special: 'sentinel'
  },

  // STATUS/CURSE CARDS
  wound: {
    id: 'wound',
    name: 'Wound',
    type: 'skill',
    cost: 0,
    description: 'Unplayable.',
    rarity: 'common',
    special: 'unplayable'
  }
}

export const STARTER_DECK: string[] = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend', 'defend'
]

// Card pools by act and rarity
export const CARD_POOLS = {
  1: {
    common: ['heavy_slash', 'cleave', 'fury', 'poison_strike', 'wild_strike', 'twin_strike', 'dodge', 'smoke_bomb', 'shrug_it_off', 'flex', 'prepare', 'strength_up'],
    uncommon: ['execute', 'backstab', 'fortify', 'second_wind', 'dark_ritual', 'disarm', 'intimidate', 'rage', 'cleanse', 'thorns', 'regeneration', 'battle_trance', 'metallicize', 'evolve'],
    rare: ['rampage', 'blood_for_blood', 'carnage', 'adrenaline', 'demon_form', 'juggernaut', 'barricade', 'corruption']
  },
  2: {
    common: ['heavy_slash', 'cleave', 'fury', 'poison_strike', 'wild_strike', 'twin_strike', 'berserk', 'infernal_blade', 'dodge', 'smoke_bomb', 'shrug_it_off', 'flex', 'prepare', 'strength_up'],
    uncommon: ['execute', 'backstab', 'headbutt', 'searing_blow', 'uppercut', 'body_slam', 'sentinel', 'fortify', 'second_wind', 'dark_ritual', 'disarm', 'intimidate', 'rage', 'cleanse', 'thorns', 'regeneration', 'battle_trance', 'metallicize', 'evolve'],
    rare: ['rampage', 'blood_for_blood', 'carnage', 'adrenaline', 'impervious', 'offering', 'demon_form', 'juggernaut', 'barricade', 'corruption']
  },
  3: {
    common: ['heavy_slash', 'cleave', 'fury', 'poison_strike', 'wild_strike', 'twin_strike', 'berserk', 'infernal_blade', 'dodge', 'smoke_bomb', 'shrug_it_off', 'flex', 'prepare', 'strength_up'],
    uncommon: ['execute', 'backstab', 'headbutt', 'searing_blow', 'uppercut', 'body_slam', 'sentinel', 'fortify', 'second_wind', 'dark_ritual', 'disarm', 'intimidate', 'rage', 'cleanse', 'thorns', 'regeneration', 'battle_trance', 'metallicize', 'evolve'],
    rare: ['rampage', 'blood_for_blood', 'carnage', 'adrenaline', 'impervious', 'offering', 'reaper', 'feed', 'limit_break', 'immolate', 'dark_embrace', 'demon_form', 'juggernaut', 'barricade', 'corruption']
  }
}