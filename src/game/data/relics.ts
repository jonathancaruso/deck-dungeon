import { Relic } from '../types'

export const RELICS: Record<string, Relic> = {
  // COMMON RELICS
  iron_ring: {
    id: 'iron_ring',
    name: 'Iron Ring',
    description: 'Gain 3 max HP after each non-boss combat.',
    rarity: 'common',
    effect: 'hp_after_combat'
  },
  red_candle: {
    id: 'red_candle',
    name: 'Red Candle',
    description: 'Start each combat with 1 additional energy on the first turn.',
    rarity: 'common',
    effect: 'first_turn_energy'
  },
  rusty_shield: {
    id: 'rusty_shield',
    name: 'Rusty Shield',
    description: 'Start each combat with 5 Block.',
    rarity: 'common',
    effect: 'combat_block'
  },
  gold_tooth: {
    id: 'gold_tooth',
    name: 'Gold Tooth',
    description: 'Gain 10 gold after each combat.',
    rarity: 'common',
    effect: 'gold_per_combat'
  },
  venom_vial: {
    id: 'venom_vial',
    name: 'Venom Vial',
    description: 'Start each combat by applying 1 Poison to ALL enemies.',
    rarity: 'common',
    effect: 'combat_poison'
  },
  blood_vial: {
    id: 'blood_vial',
    name: 'Blood Vial',
    description: 'Heal 2 HP after each combat.',
    rarity: 'common',
    effect: 'heal_after_combat'
  },
  lucky_coin: {
    id: 'lucky_coin',
    name: 'Lucky Coin',
    description: 'Card rewards have 1 additional option.',
    rarity: 'common',
    effect: 'extra_card_reward'
  },
  energy_crystal: {
    id: 'energy_crystal',
    name: 'Energy Crystal',
    description: 'Start each combat with 1 additional energy.',
    rarity: 'common',
    effect: 'combat_energy'
  },

  // UNCOMMON RELICS  
  strength_amulet: {
    id: 'strength_amulet',
    name: 'Strength Amulet',
    description: 'Start each combat with 1 Strength.',
    rarity: 'uncommon',
    effect: 'combat_strength'
  },
  healing_potion: {
    id: 'healing_potion',
    name: 'Healing Potion',
    description: 'Whenever you use a Potion, heal 5 HP.',
    rarity: 'uncommon',
    effect: 'potion_heal'
  },
  thorns_ring: {
    id: 'thorns_ring',
    name: 'Thorns Ring',
    description: 'Whenever you take damage, deal 1 damage back.',
    rarity: 'uncommon',
    effect: 'thorns_passive'
  },
  draw_ring: {
    id: 'draw_ring',
    name: 'Draw Ring',
    description: 'Draw 1 additional card each turn.',
    rarity: 'uncommon',
    effect: 'extra_draw'
  },
  meditation_stone: {
    id: 'meditation_stone',
    name: 'Meditation Stone',
    description: 'Whenever you end your turn without playing an Attack, draw 1 card.',
    rarity: 'uncommon',
    effect: 'meditation'
  },
  rage_crystal: {
    id: 'rage_crystal',
    name: 'Rage Crystal',
    description: 'Whenever you play an Attack card, gain 1 Block.',
    rarity: 'uncommon',
    effect: 'attack_block'
  },
  poison_ring: {
    id: 'poison_ring',
    name: 'Poison Ring',
    description: 'Whenever an enemy takes Poison damage, you gain 1 energy.',
    rarity: 'uncommon',
    effect: 'poison_energy'
  },
  card_mastery: {
    id: 'card_mastery',
    name: 'Card Mastery',
    description: 'All Strike and Defend cards are upgraded.',
    rarity: 'uncommon',
    effect: 'upgrade_basics'
  },

  // RARE RELICS
  demon_heart: {
    id: 'demon_heart',
    name: 'Demon Heart',
    description: 'Gain 1 Strength at the start of each turn.',
    rarity: 'rare',
    effect: 'turn_strength'
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    description: 'When you would die, heal to 25% max HP instead. One use only.',
    rarity: 'rare',
    effect: 'phoenix_revival'
  },
  time_crystal: {
    id: 'time_crystal',
    name: 'Time Crystal',
    description: 'At the start of each turn, you may draw 2 cards and discard 1.',
    rarity: 'rare',
    effect: 'scry_passive'
  },
  vampiric_fangs: {
    id: 'vampiric_fangs',
    name: 'Vampiric Fangs',
    description: 'Whenever you kill an enemy, heal 3 HP.',
    rarity: 'rare',
    effect: 'kill_heal'
  },
  ancient_tome: {
    id: 'ancient_tome',
    name: 'Ancient Tome',
    description: 'Whenever you play a Power card, draw 1 card.',
    rarity: 'rare',
    effect: 'power_draw'
  },
  chaos_orb: {
    id: 'chaos_orb',
    name: 'Chaos Orb',
    description: 'At the start of each turn, play the top card of your draw pile for free.',
    rarity: 'rare',
    effect: 'chaos_play'
  },
  eternal_flame: {
    id: 'eternal_flame',
    name: 'Eternal Flame',
    description: 'Whenever you play 3 cards in a turn, gain 1 energy.',
    rarity: 'rare',
    effect: 'three_card_energy'
  },
  mirror_shield: {
    id: 'mirror_shield',
    name: 'Mirror Shield',
    description: 'Whenever you gain Block, deal that much damage to a random enemy.',
    rarity: 'rare',
    effect: 'block_damage'
  },
  soul_gem: {
    id: 'soul_gem',
    name: 'Soul Gem',
    description: 'Gain 1 max energy. At the start of each turn, lose 1 HP.',
    rarity: 'rare',
    effect: 'energy_hp_cost'
  },
  deck_master: {
    id: 'deck_master',
    name: 'Deck Master',
    description: 'At rest sites, you may remove 2 cards instead of 1.',
    rarity: 'rare',
    effect: 'double_remove'
  },

  // NEW COMMON RELICS
  bone_dice: {
    id: 'bone_dice',
    name: 'Bone Dice',
    description: 'At the start of combat, gain 0-2 bonus energy randomly.',
    rarity: 'common',
    effect: 'random_start_energy'
  },
  worn_boots: {
    id: 'worn_boots',
    name: 'Worn Boots',
    description: 'Gain 5 extra gold after each combat.',
    rarity: 'common',
    effect: 'extra_gold_5'
  },

  // NEW UNCOMMON RELICS
  shadow_cloak: {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: 'If you have 0 Block at end of turn, gain 8 Block.',
    rarity: 'uncommon',
    effect: 'no_block_shield'
  },
  leech_fang: {
    id: 'leech_fang',
    name: 'Leech Fang',
    description: 'Whenever you play an Attack card, heal 1 HP.',
    rarity: 'uncommon',
    effect: 'attack_heal'
  },
  ember_crown: {
    id: 'ember_crown',
    name: 'Ember Crown',
    description: 'Whenever you play a Power card, gain 1 energy.',
    rarity: 'uncommon',
    effect: 'power_energy'
  },
  cursed_mirror: {
    id: 'cursed_mirror',
    name: 'Cursed Mirror',
    description: 'Start combat with 2 Vulnerable on yourself but 2 Weak on all enemies.',
    rarity: 'uncommon',
    effect: 'curse_trade'
  },

  // NEW RARE RELICS
  void_shard: {
    id: 'void_shard',
    name: 'Void Shard',
    description: 'Gain 1 extra energy each turn but draw 1 fewer card.',
    rarity: 'rare',
    effect: 'energy_less_draw'
  },
  reapers_mark: {
    id: 'reapers_mark',
    name: "Reaper's Mark",
    description: 'When you kill an enemy, gain 2 Strength for the rest of combat.',
    rarity: 'rare',
    effect: 'kill_strength'
  }
}

export const RELIC_POOLS = {
  1: {
    common: ['iron_ring', 'red_candle', 'rusty_shield', 'gold_tooth', 'venom_vial', 'blood_vial', 'lucky_coin', 'energy_crystal', 'bone_dice', 'worn_boots'],
    uncommon: ['strength_amulet', 'healing_potion', 'thorns_ring', 'draw_ring', 'meditation_stone', 'rage_crystal', 'poison_ring', 'card_mastery', 'shadow_cloak', 'leech_fang', 'ember_crown', 'cursed_mirror'],
    rare: ['demon_heart', 'phoenix_feather', 'time_crystal', 'vampiric_fangs', 'ancient_tome', 'chaos_orb', 'eternal_flame', 'mirror_shield', 'soul_gem', 'deck_master', 'void_shard', 'reapers_mark']
  },
  2: {
    common: ['iron_ring', 'red_candle', 'rusty_shield', 'gold_tooth', 'venom_vial', 'blood_vial', 'lucky_coin', 'energy_crystal', 'bone_dice', 'worn_boots'],
    uncommon: ['strength_amulet', 'healing_potion', 'thorns_ring', 'draw_ring', 'meditation_stone', 'rage_crystal', 'poison_ring', 'card_mastery', 'shadow_cloak', 'leech_fang', 'ember_crown', 'cursed_mirror'],
    rare: ['demon_heart', 'phoenix_feather', 'time_crystal', 'vampiric_fangs', 'ancient_tome', 'chaos_orb', 'eternal_flame', 'mirror_shield', 'soul_gem', 'deck_master', 'void_shard', 'reapers_mark']
  },
  3: {
    common: ['iron_ring', 'red_candle', 'rusty_shield', 'gold_tooth', 'venom_vial', 'blood_vial', 'lucky_coin', 'energy_crystal', 'bone_dice', 'worn_boots'],
    uncommon: ['strength_amulet', 'healing_potion', 'thorns_ring', 'draw_ring', 'meditation_stone', 'rage_crystal', 'poison_ring', 'card_mastery', 'shadow_cloak', 'leech_fang', 'ember_crown', 'cursed_mirror'],
    rare: ['demon_heart', 'phoenix_feather', 'time_crystal', 'vampiric_fangs', 'ancient_tome', 'chaos_orb', 'eternal_flame', 'mirror_shield', 'soul_gem', 'deck_master', 'void_shard', 'reapers_mark']
  }
}