# Deck Dungeon - Full Game Logic Audit
**Date:** 2026-02-17

---

## 🐛 BUGS (Definitely Broken)

### BUG-1: Cleave does NOT hit all enemies
**File:** `src/game/utils/combat.ts:116-118`
The `cleave` case in `handleSpecialEffects` is empty with a comment "handled in card play logic" — but card play logic in `gameReducer.ts` does NOT handle it. Cleave only hits the single targeted enemy.

### BUG-2: USE_POTION action type defined but never handled
**File:** `src/game/utils/gameReducer.ts` — no `case 'USE_POTION'` in the switch
The action type is defined at line 33 but there's no handler. Also, no UI exists for using potions during combat (`CombatScreen.tsx` has zero potion references). Players can BUY potions but never USE them.

### BUG-3: Flex card's `temporary` special applies Weak to enemies instead of temporary Strength
**File:** `src/game/utils/combat.ts:212-219`
Flex is supposed to: gain 2 Strength (via statusEffect), then lose 2 Strength at end of turn. But the `temporary` handler applies 1 Weak to ALL enemies — completely wrong. The Flex card's statusEffect already applies the 2 Strength, but there's no "lose 2 Strength at end of turn" logic.

### BUG-4: Thorns status effect never triggers
**File:** `src/game/utils/combat.ts` — `enemyAI()` function (line ~230)
When enemies attack the player, there's no check for the player's `thorns` status effect. Thorns damage is never dealt back.

### BUG-5: Ritual status effect (Cultist) does nothing
**File:** `src/game/utils/combat.ts`
The Cultist buffs itself with `ritual`, but `ritual` is never processed anywhere. In Slay the Spire, Ritual grants Strength each turn. There's no code to convert ritual stacks into strength gains.

### BUG-6: Enemy attack damage ignores enemy Strength
**File:** `src/game/utils/combat.ts:230-245` (enemyAI)
When enemies attack, they use `action.damage` directly. Enemy `strength` status effect is never added to their damage. So Lagavulin/Mystic buffing strength does nothing for their attacks.

### BUG-7: Enemy attack doesn't check Weak on enemy
**File:** `src/game/utils/combat.ts:230-245` (enemyAI)
If an enemy has the `weak` debuff, their attack damage should be reduced by 25%. This is never checked.

### BUG-8: Block resets AFTER draw instead of BEFORE enemy turn
**File:** `src/game/utils/gameReducer.ts:173-202` (END_TURN)
Block reset happens at the START of the new player turn (line ~196), but it should reset at the start of the player turn (before drawing). The current order is: discard hand → enemy turn → process status → increment turn → reset block → draw. This means block protects against enemy attacks correctly BUT persists through status effect damage (poison), which is wrong — block should already be gone by the time the new turn starts. Actually, looking again, the flow seems mostly okay, but the block reset is AFTER energy reset and BEFORE draw. The real issue is block should be reset at the very start of the player's new turn, which it is. This is actually fine.

**CORRECTION:** Block reset order is acceptable. Removing this bug.

### BUG-8 (real): EventScreen ignores events.ts data entirely
**File:** `src/components/EventScreen.tsx`
The EventScreen component generates its OWN random events inline with `useMemo`. It does NOT use the `EVENTS` from `src/game/data/events.ts` at all. The `CHOOSE_EVENT_OPTION` action in the reducer has no handler either. All the carefully defined events in events.ts are dead code.

### BUG-9: Rampage permanent damage increase targets wrong card
**File:** `src/game/utils/combat.ts:146-150` (rampage handler)
Searches for a card in the deck with `c.id === card.id`, but during combat, card IDs are copied from templates. If you have multiple Rampages or cards with the same base ID, it modifies the first match in the deck, not necessarily the one played. Also, the played card instance (in hand/discard) doesn't get updated.

### BUG-10: draw_card special effect is buggy
**File:** `src/game/utils/combat.ts:118-120`
```js
combatState.hand.push(...drawCards(combatState, 1).hand.slice(-1))
```
`drawCards` returns a new state object but doesn't modify `combatState` in place. Then it takes the last card from the NEW state's hand and pushes it to the OLD state's hand. This creates a duplicate — the drawn card appears in both the drawCards result and is pushed again. The draw pile is also not updated since the returned state is discarded.

### BUG-11: Card selection uses ID instead of instance identity
**File:** `src/game/utils/gameReducer.ts:128`
`state.combatState.hand.find(c => c.id === action.cardId)` — if you have multiple copies of the same card (e.g., 5 Strikes), this always finds the FIRST one, not the one the player clicked. The UI passes `card.id` which is the same for all copies.

### BUG-12: REST_REMOVE deletes ALL copies of a card
**File:** `src/game/utils/gameReducer.ts:215`
`state.player.deck.filter(c => c.id !== action.cardId)` removes ALL cards with that ID. If you have 5 Strikes and remove one, all 5 are removed.

### BUG-13: Card reward gold/relic rewards not granted after combat
**File:** `src/game/utils/gameReducer.ts`
After winning combat, there's no gold reward. Normal combat should give gold. Only treasures give gold. The `CHOOSE_CARD_REWARD` handler just adds a card and returns to map.

---

## ⚠️ MISSING (Defined but never implemented)

### MISS-1: ALL relic effects are unimplemented
No relic effect is ever checked or applied anywhere in combat.ts or gameReducer.ts. The relics are collectible items with zero gameplay effect. This includes:
- `iron_ring` (hp_after_combat) — never checked
- `red_candle` (first_turn_energy) — never checked
- `rusty_shield` (combat_block) — never checked
- `gold_tooth` (gold_per_combat) — never checked
- `venom_vial` (combat_poison) — never checked
- `blood_vial` (heal_after_combat) — never checked
- `lucky_coin` (extra_card_reward) — never checked
- `energy_crystal` (combat_energy) — never checked
- `strength_amulet` (combat_strength) — never checked
- `healing_potion` (potion_heal) — never checked
- `thorns_ring` (thorns_passive) — never checked
- `draw_ring` (extra_draw) — never checked
- `meditation_stone` (meditation) — never checked
- `rage_crystal` (attack_block) — never checked
- `poison_ring` (poison_energy) — never checked
- `card_mastery` (upgrade_basics) — never checked
- `demon_heart` (turn_strength) — never checked
- `phoenix_feather` (phoenix_revival) — never checked
- `time_crystal` (scry_passive) — never checked
- `vampiric_fangs` (kill_heal) — never checked
- `ancient_tome` (power_draw) — never checked
- `chaos_orb` (chaos_play) — never checked
- `eternal_flame` (three_card_energy) — never checked
- `mirror_shield` (block_damage) — never checked
- `soul_gem` (energy_hp_cost) — never checked
- `deck_master` (double_remove) — never checked

### MISS-2: Potion usage UI missing
No way for the player to actually use potions during combat. No potion display, no click handler.

### MISS-3: CHOOSE_EVENT_OPTION action has no reducer handler
Defined in GameAction type but not in the switch statement.

### MISS-4: BUY_RELIC action has no reducer handler
Defined at line 24 but no case in the switch.

### MISS-5: Prestige system not implemented
No prestige-related code exists anywhere.

### MISS-6: Evolve power (draw on Status card) — never triggers
The `evolve` special is listed but nothing checks for it when drawing Wound/Status cards.

### MISS-7: Corruption power — skills exhaust but no indication to player
Corruption makes skills cost 0 and exhaust, which IS implemented in PLAY_CARD. But the UI doesn't show modified costs.

### MISS-8: Blood for Blood cost reduction never implemented
The `blood_cost` special has an empty handler. The card always costs 4 energy.

---

## ⚡ WARNINGS (Potential Issues)

### WARN-1: Carnage's "ethereal" special has no enforcement
Description says "Must be played with no other cards this turn" but nothing prevents it.

### WARN-2: Prepare's discard-after-draw not implemented
"Draw 1 card. Discard 1 card." — only draws, never prompts for discard.

### WARN-3: Shop card IDs include random suffix
`shopCards` generates IDs like `shop-strike-abc123` which won't match card definitions later. Buying these cards adds cards with non-standard IDs to the deck.

### WARN-4: Enemy defend action does nothing
`enemyAI` case `'defend'` has a comment "not implemented" — enemies that roll defend waste their turn.

### WARN-5: Healing Well "Fill your bottle" gives 0 gold instead of a potion
`events.ts` line: consequence type is `gold` with amount 0.

### WARN-6: Multiple event choices have incomplete consequences
- "Drink and feel cleansed" heals 999 but doesn't remove a card as described
- "Break machine" does damage but doesn't grant the 50 gold mentioned
- "Ritual site - Perform ritual" does damage but doesn't grant max energy

### WARN-7: Trapped Chest event has double-random
The result text and action each call `Math.random()` independently, so the text might say "trap fires" but the action gives gold.

### WARN-8: `generateEnemyIntent` uses random damage values
After the first action, enemies get random 5-15 damage instead of their defined damage values. A boss could hit for 5 after turn 1.
