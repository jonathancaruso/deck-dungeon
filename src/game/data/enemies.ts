import { Enemy } from '../types'

export const ENEMIES: Record<string, Omit<Enemy, 'hp' | 'statusEffects'>> = {
  // ACT 1 ENEMIES
  cultist: {
    id: 'cultist',
    name: 'Cultist',
    maxHp: 48,
    intent: 'buff',
    nextAction: {
      type: 'buff',
      statusEffect: { type: 'ritual', amount: 3 }
    },
    act: 1
  },
  jaw_worm: {
    id: 'jaw_worm',
    name: 'Jaw Worm',
    maxHp: 40,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 11
    },
    act: 1
  },
  red_louse: {
    id: 'red_louse',
    name: 'Red Louse',
    maxHp: 10,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 5
    },
    act: 1
  },
  green_louse: {
    id: 'green_louse',
    name: 'Green Louse',
    maxHp: 11,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 5
    },
    act: 1
  },
  acid_slime_l: {
    id: 'acid_slime_l',
    name: 'Acid Slime (L)',
    maxHp: 65,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 11
    },
    act: 1
  },
  spike_slime_l: {
    id: 'spike_slime_l',
    name: 'Spike Slime (L)',
    maxHp: 64,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 10
    },
    act: 1
  },

  // ACT 1 ELITES
  gremlin_nob: {
    id: 'gremlin_nob',
    name: 'Gremlin Nob',
    maxHp: 82,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 14
    },
    act: 1
  },
  lagavulin: {
    id: 'lagavulin',
    name: 'Lagavulin',
    maxHp: 109,
    intent: 'buff',
    nextAction: {
      type: 'buff',
      statusEffect: { type: 'strength', amount: 1 }
    },
    act: 1
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry',
    maxHp: 38,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 9
    },
    act: 1
  },

  // ACT 1 BOSS
  the_guardian: {
    id: 'the_guardian',
    name: 'The Guardian',
    maxHp: 250,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 32
    },
    act: 1
  },

  // ACT 2 ENEMIES
  spheric_guardian: {
    id: 'spheric_guardian',
    name: 'Spheric Guardian',
    maxHp: 20,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 10
    },
    act: 2
  },
  chosen: {
    id: 'chosen',
    name: 'Chosen',
    maxHp: 95,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 18
    },
    act: 2
  },
  byrd: {
    id: 'byrd',
    name: 'Byrd',
    maxHp: 25,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 3
    },
    act: 2
  },
  centurion: {
    id: 'centurion',
    name: 'Centurion',
    maxHp: 76,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 12
    },
    act: 2
  },
  mystic: {
    id: 'mystic',
    name: 'Mystic',
    maxHp: 68,
    intent: 'buff',
    nextAction: {
      type: 'buff',
      statusEffect: { type: 'strength', amount: 2 }
    },
    act: 2
  },

  // ACT 2 ELITES
  gremlin_leader: {
    id: 'gremlin_leader',
    name: 'Gremlin Leader',
    maxHp: 140,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 18
    },
    act: 2
  },
  book_of_stabbing: {
    id: 'book_of_stabbing',
    name: 'Book of Stabbing',
    maxHp: 160,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 21
    },
    act: 2
  },
  slavers: {
    id: 'slavers',
    name: 'Slavers',
    maxHp: 46,
    intent: 'debuff',
    nextAction: {
      type: 'debuff',
      statusEffect: { type: 'weak', amount: 2 }
    },
    act: 2
  },

  // ACT 2 BOSS
  automaton: {
    id: 'automaton',
    name: 'Automaton',
    maxHp: 300,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 45
    },
    act: 2
  },
  collector: {
    id: 'collector',
    name: 'Collector',
    maxHp: 282,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 18
    },
    act: 2
  },

  // ACT 3 ENEMIES
  orb_walker: {
    id: 'orb_walker',
    name: 'Orb Walker',
    maxHp: 86,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 15
    },
    act: 3
  },
  spiker: {
    id: 'spiker',
    name: 'Spiker',
    maxHp: 56,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 7
    },
    act: 3
  },
  exploder: {
    id: 'exploder',
    name: 'Exploder',
    maxHp: 30,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 30
    },
    act: 3
  },
  repulsor: {
    id: 'repulsor',
    name: 'Repulsor',
    maxHp: 29,
    intent: 'debuff',
    nextAction: {
      type: 'debuff',
      statusEffect: { type: 'weak', amount: 1 }
    },
    act: 3
  },
  writhing_mass: {
    id: 'writhing_mass',
    name: 'Writhing Mass',
    maxHp: 68,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 15
    },
    act: 3
  },

  // ACT 3 ELITES
  giant_head: {
    id: 'giant_head',
    name: 'Giant Head',
    maxHp: 500,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 30
    },
    act: 3
  },
  nemesis: {
    id: 'nemesis',
    name: 'Nemesis',
    maxHp: 200,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 45
    },
    act: 3
  },
  reptomancer: {
    id: 'reptomancer',
    name: 'Reptomancer',
    maxHp: 180,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 13
    },
    act: 3
  },

  // ACT 3 BOSSES
  awakened_one: {
    id: 'awakened_one',
    name: 'Awakened One',
    maxHp: 300,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 20
    },
    act: 3
  },
  time_eater: {
    id: 'time_eater',
    name: 'Time Eater',
    maxHp: 456,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 26
    },
    act: 3
  },
  donu_and_deca: {
    id: 'donu_and_deca',
    name: 'Donu and Deca',
    maxHp: 250,
    intent: 'attack',
    nextAction: {
      type: 'attack',
      damage: 10
    },
    act: 3
  }
}

export const ENEMY_ENCOUNTERS = {
  1: {
    normal: [
      ['cultist'],
      ['jaw_worm'],
      ['red_louse', 'green_louse'],
      ['red_louse', 'red_louse'],
      ['acid_slime_l'],
      ['spike_slime_l']
    ],
    elite: [
      ['gremlin_nob'],
      ['lagavulin'],
      ['sentry', 'sentry']
    ],
    boss: [
      ['the_guardian']
    ]
  },
  2: {
    normal: [
      ['spheric_guardian', 'spheric_guardian'],
      ['chosen'],
      ['byrd', 'byrd', 'byrd'],
      ['centurion', 'mystic'],
      ['chosen', 'byrd']
    ],
    elite: [
      ['gremlin_leader'],
      ['book_of_stabbing'],
      ['slavers', 'slavers']
    ],
    boss: [
      ['automaton'],
      ['collector']
    ]
  },
  3: {
    normal: [
      ['orb_walker'],
      ['spiker', 'spiker'],
      ['exploder'],
      ['repulsor', 'spiker'],
      ['writhing_mass']
    ],
    elite: [
      ['giant_head'],
      ['nemesis'],
      ['reptomancer']
    ],
    boss: [
      ['awakened_one'],
      ['time_eater'],
      ['donu_and_deca']
    ]
  }
}