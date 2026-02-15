import { GameEvent } from '../types'
import { RELICS } from './relics'

export const EVENTS: Record<string, GameEvent> = {
  mysterious_chest: {
    id: 'mysterious_chest',
    name: 'Mysterious Chest',
    description: 'You discover an ornate chest covered in strange runes. Dark energy emanates from within.',
    choices: [
      {
        id: 'open_chest',
        text: 'Open the chest',
        consequence: {
          type: 'relic',
          relic: RELICS.chaos_orb
        }
      },
      {
        id: 'take_damage_chest',
        text: 'Force it open (Take 8 damage)',
        consequence: {
          type: 'damage',
          amount: 8
        }
      },
      {
        id: 'leave_chest',
        text: 'Leave it alone',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },
  
  fountain: {
    id: 'fountain',
    name: 'Fountain of Cleansing',
    description: 'A crystal clear fountain bubbles before you. Its waters look refreshing but seem to demand a sacrifice.',
    choices: [
      {
        id: 'drink_fountain',
        text: 'Drink and feel cleansed (Heal to full, lose a card)',
        consequence: {
          type: 'heal',
          amount: 999
        }
      },
      {
        id: 'ignore_fountain',
        text: 'Walk past',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  gambler: {
    id: 'gambler',
    name: 'The Gambler',
    description: 'A shadowy figure offers you a game of chance. "Double or nothing," they whisper.',
    choices: [
      {
        id: 'bet_low',
        text: 'Bet 25 gold',
        consequence: {
          type: 'gold',
          amount: 25
        }
      },
      {
        id: 'bet_high',
        text: 'Bet 50 gold',
        consequence: {
          type: 'gold',
          amount: 50
        }
      },
      {
        id: 'decline_bet',
        text: 'Decline',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  dead_adventurer: {
    id: 'dead_adventurer',
    name: 'Dead Adventurer',
    description: 'You come across the remains of a fallen adventurer. Their equipment might be useful.',
    choices: [
      {
        id: 'search_body',
        text: 'Search the body',
        consequence: {
          type: 'gold',
          amount: 75
        }
      },
      {
        id: 'take_weapon',
        text: 'Take their weapon (Gain a random Attack card)',
        consequence: {
          type: 'card'
        }
      },
      {
        id: 'pay_respects',
        text: 'Pay respects and leave',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  strange_machine: {
    id: 'strange_machine',
    name: 'Strange Machine',
    description: 'An ancient machine hums with power. It has slots for gold and seems to upgrade equipment.',
    choices: [
      {
        id: 'use_machine',
        text: 'Pay 75 gold to upgrade a card',
        consequence: {
          type: 'gold',
          amount: -75
        }
      },
      {
        id: 'break_machine',
        text: 'Try to break it open (Take 10 damage, gain 50 gold)',
        consequence: {
          type: 'damage',
          amount: 10
        }
      },
      {
        id: 'ignore_machine',
        text: 'Leave it alone',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  cursed_tome: {
    id: 'cursed_tome',
    name: 'Cursed Tome',
    description: 'A book of forbidden knowledge lies open. Reading it might grant power... or curse you.',
    choices: [
      {
        id: 'read_tome',
        text: 'Read the tome (Gain a rare card, take 3 damage)',
        consequence: {
          type: 'card'
        }
      },
      {
        id: 'burn_tome',
        text: 'Burn it (Gain 25 gold)',
        consequence: {
          type: 'gold',
          amount: 25
        }
      },
      {
        id: 'leave_tome',
        text: 'Walk away',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  golden_idol: {
    id: 'golden_idol',
    name: 'Golden Idol',
    description: 'A gleaming golden idol sits on a pedestal. It looks valuable but might be trapped.',
    choices: [
      {
        id: 'take_idol',
        text: 'Take the idol (Gain 100 gold)',
        consequence: {
          type: 'gold',
          amount: 100
        }
      },
      {
        id: 'careful_take',
        text: 'Take it carefully (Take 5 damage, gain 100 gold)',
        consequence: {
          type: 'damage',
          amount: 5
        }
      },
      {
        id: 'leave_idol',
        text: 'Too risky, leave it',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  healing_well: {
    id: 'healing_well',
    name: 'Healing Well',
    description: 'A well filled with healing waters. The water glows with restorative magic.',
    choices: [
      {
        id: 'drink_well',
        text: 'Drink from the well (Heal 15 HP)',
        consequence: {
          type: 'heal',
          amount: 15
        }
      },
      {
        id: 'bottle_water',
        text: 'Fill your bottle (Gain a Health Potion)',
        consequence: {
          type: 'gold',
          amount: 0
        }
      },
      {
        id: 'ignore_well',
        text: 'Continue on',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  merchant_tent: {
    id: 'merchant_tent',
    name: 'Merchant Tent',
    description: 'A traveling merchant has set up camp. They offer various deals.',
    choices: [
      {
        id: 'buy_relic',
        text: 'Buy a relic for 150 gold',
        consequence: {
          type: 'gold',
          amount: -150
        }
      },
      {
        id: 'buy_cards',
        text: 'Buy 2 random cards for 100 gold',
        consequence: {
          type: 'gold',
          amount: -100
        }
      },
      {
        id: 'sell_cards',
        text: 'Sell cards for gold',
        consequence: {
          type: 'gold',
          amount: 50
        }
      },
      {
        id: 'leave_merchant',
        text: 'Browse and leave',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  },

  ritual_site: {
    id: 'ritual_site',
    name: 'Ritual Site',
    description: 'An ancient ritual circle pulses with dark energy. Completing the ritual might grant power.',
    choices: [
      {
        id: 'perform_ritual',
        text: 'Perform the ritual (Lose 6 HP, gain 1 max energy)',
        consequence: {
          type: 'damage',
          amount: 6
        }
      },
      {
        id: 'disrupt_ritual',
        text: 'Disrupt the ritual (Gain a random relic)',
        consequence: {
          type: 'relic'
        }
      },
      {
        id: 'avoid_ritual',
        text: 'Avoid the site',
        consequence: {
          type: 'nothing'
        }
      }
    ]
  }
}

export const EVENT_POOLS = {
  1: ['mysterious_chest', 'fountain', 'gambler', 'dead_adventurer', 'healing_well'],
  2: ['strange_machine', 'cursed_tome', 'golden_idol', 'merchant_tent', 'gambler'],
  3: ['ritual_site', 'cursed_tome', 'golden_idol', 'strange_machine', 'mysterious_chest']
}