# Deck Dungeon Bug Audit #2
**Date:** 2026-02-18  
**Auditor:** Botson (automated code audit + play testing)

---

## Critical Bugs

### BUG-01: Reaper card double-applies damage to targeted enemy
- **Severity:** Critical
- **File:** `src/game/utils/combat.ts` — `applyCardEffects()` + `handleSpecialEffects('reaper')`
- **Description:** Reaper has `damage: 4`, so the general damage path in `applyCardEffects` hits the targetEnemy. Then the 'reaper' special *also* deals damage to ALL enemies (including the target again). The targeted enemy takes double damage.
- **Fix:** Skip the general damage path for reaper (it handles its own damage in the special), or remove damage from the special and only apply heal logic there.

### BUG-02: Immolate card double-applies damage to targeted enemy
- **Severity:** Critical
- **File:** `src/game/utils/combat.ts` — same pattern as BUG-01
- **Description:** Immolate has `damage: 21` and `special: 'immolate'`. General path hits targetEnemy for 21, then the special hits ALL enemies for 21 again. Target takes 42 damage instead of 21.
- **Fix:** Make immolate use `special: 'cleave'` pattern or skip general damage.

### BUG-03: No act transition after beating boss — player gets stuck
- **Severity:** Critical  
- **File:** `src/game/utils/gameReducer.ts` — `CHOOSE_CARD_REWARD`
- **Description:** After beating the boss (floor 14), CHOOSE_CARD_REWARD sets phase to 'map'. But the boss is the last floor, so no nodes are available. The player is stuck on the map with nowhere to go. ADVANCE_ACT is never dispatched automatically.
- **Fix:** Check if completed node was a boss in CHOOSE_CARD_REWARD. If so, dispatch ADVANCE_ACT logic instead of returning to map.

### BUG-04: Phoenix Feather relic does nothing
- **Severity:** Critical
- **File:** `src/game/utils/gameReducer.ts`
- **Description:** The rare relic "Phoenix Feather" (effect: `phoenix_revival`) says "When you would die, heal to 25% max HP instead" but there's no code anywhere checking for this relic when player HP <= 0.
- **Fix:** Add phoenix check in END_TURN and EVENT_DAMAGE when player hp reaches 0.

### BUG-05: Rage card doesn't work at all
- **Severity:** Critical
- **File:** `src/game/data/cards.ts` line ~156, `src/game/utils/combat.ts`
- **Description:** Rage is typed as `'skill'` but needs to persist as an active power. Since `type !== 'power'`, it goes to discard pile, never to `activePowers`. The `rage_passive` check in PLAY_CARD looks in `activePowers` and never finds it.
- **Fix:** Change Rage's type to `'power'`.

### BUG-06: Blood for Blood cost reduction never applies
- **Severity:** Critical
- **File:** `src/game/utils/combat.ts` — `handleSpecialEffects('blood_cost')`
- **Description:** Comment says "handled in gameReducer PLAY_CARD" but there's no cost reduction logic in PLAY_CARD. The card always costs 4 energy, making it unplayable in practice.
- **Fix:** Track HP loss count in combat state and reduce cost accordingly in PLAY_CARD.

### BUG-07: No potion UI in combat screen
- **Severity:** Critical
- **File:** `src/components/CombatScreen.tsx`
- **Description:** The game has a full potion system (USE_POTION action, potion data, shop sells potions) but the CombatScreen has zero UI to actually use potions. Players can buy potions but never use them.
- **Fix:** Add potion buttons to the combat HUD.

---

## High Bugs

### BUG-08: CombatScreen doesn't pass cardIndex to dispatch
- **Severity:** High
- **File:** `src/app/page.tsx` line ~128
- **Description:** `onPlayCard` callback only passes `(cardId, targetEnemyId)` but never `cardIndex`. The reducer's BUG-11 fix (using cardIndex for precise selection) never activates. If you have 2 copies of the same card, playing the second one always plays the first.
- **Fix:** Pass cardIndex from CombatScreen through to the dispatch.

### BUG-09: 13+ relics are not implemented
- **Severity:** High
- **File:** `src/game/utils/gameReducer.ts`
- **Description:** These relics have no effect code:
  - `ancient_tome` (power_draw) — draw on power play
  - `chaos_orb` (chaos_play) — auto-play top card
  - `eternal_flame` (three_card_energy) — energy on 3 cards
  - `mirror_shield` (block_damage) — block → damage
  - `card_mastery` (upgrade_basics) — upgrade Strikes/Defends
  - `meditation_stone` (meditation) — draw if no attacks played
  - `poison_ring` (poison_energy) — energy on poison damage
  - `healing_potion` relic (potion_heal) — heal 5 on potion use
  - `thorns_ring` (thorns_passive) — dealt via statusEffect thorns but relic never sets it
  - `time_crystal` (scry_passive) — not implemented
  - `deck_master` (double_remove) — not in rest screen
- **Fix:** Implement each relic effect in the appropriate game phase handler.

### BUG-10: Dark Embrace, Evolve, Battle Trance filter powers not implemented
- **Severity:** High
- **File:** `src/game/utils/combat.ts`, `src/game/utils/gameReducer.ts`
- **Description:**
  - Dark Embrace: "Whenever a card is Exhausted, draw 1 card" — no exhaust callback
  - Evolve: "Whenever you draw a Status card, draw 1 card" — no status card draw detection
  - Battle Trance: "You cannot draw status cards" — filter not implemented, only the +1 draw works
- **Fix:** Add hooks in PLAY_CARD exhaust logic and drawCards function.

### BUG-11: Carnage's "must be only card played this turn" restriction not enforced
- **Severity:** High
- **File:** `src/game/utils/combat.ts` — `handleSpecialEffects('ethereal')`
- **Description:** The special 'ethereal' does nothing. Card can be played freely.
- **Fix:** Track cards played this turn and prevent Carnage if others were played.

### BUG-12: Prepare card doesn't force discard
- **Severity:** High
- **File:** `src/game/utils/combat.ts` — `handleSpecialEffects('prepare')`
- **Description:** "Draw 1 card. Discard 1 card." — only draws, never forces a discard.
- **Fix:** Needs UI interaction for discard selection, or auto-discard a random card.

### BUG-13: Daily challenge encounters not seeded
- **Severity:** High
- **File:** `src/game/utils/gameReducer.ts` — `ENTER_NODE`
- **Description:** Combat encounters use `Math.random()` for encounter selection even during daily challenges. Only map generation is seeded.
- **Fix:** Pass seeded RNG to encounter selection.

---

## Medium Bugs

### BUG-14: Event system ignores events.ts data entirely ✅ FIXED
- **Severity:** Medium
- **File:** `src/components/EventScreen.tsx`
- **Description:** EventScreen generates its own inline events with `useMemo` and `Math.random()`. The carefully designed events in `src/game/data/events.ts` are completely unused.
- **Fix:** Wire EventScreen to use EVENTS data from events.ts.

### BUG-15: Trapped Chest event has double-random (result text and action differ) ✅ FIXED
- **Severity:** Medium
- **File:** `src/components/EventScreen.tsx`
- **Description:** The "Kick it open" choice calls `Math.random()` separately for the result text and the action callback. The text might say "No trap!" but the action deals damage (or vice versa) because each evaluates independently.
- **Fix:** Pre-determine the random outcome and use it for both text and action.

### BUG-16: Shop card IDs are modified with random suffixes ✅ FIXED
- **Severity:** Medium
- **File:** `src/components/ShopScreen.tsx`
- **Description:** Cards get IDs like `shop-strike-abc123`. This could break any logic relying on matching card IDs to template IDs (e.g., upgrade logic, card mastery relic).
- **Fix:** Use proper unique instance IDs separate from template IDs, or keep original IDs.

### BUG-17: Thorns Ring relic sets no thorns on combat start ✅ FIXED
- **Severity:** Medium
- **File:** `src/game/utils/gameReducer.ts` — `startCombat()`
- **Description:** The `thorns_passive` relic should give the player 1 thorns damage, but there's no code to set `combatPlayer.statusEffects.thorns` for this relic on combat start.
- **Fix:** Add thorns status effect on combat start for this relic.

### BUG-18: Map `getAvailableNodes` mutates node state directly ✅ FIXED
- **Severity:** Medium
- **File:** `src/game/utils/mapGenerator.ts` — `getAvailableNodes()`
- **Description:** This function mutates the `nodes` array objects directly (setting `completed`, `available`). This can cause React state mutation bugs since it's called with `state.map` nodes.
- **Fix:** The reducer already spreads the map array, but the individual node objects inside are still mutated. Should clone nodes being modified.

### BUG-19: Sentinel always gives 2 energy even if not exhausted ✅ FIXED
- **Severity:** Medium
- **File:** `src/game/utils/combat.ts` — `handleSpecialEffects('sentinel')`
- **Description:** Sentinel's special unconditionally gives 2 energy. It happens to always exhaust (has `exhaust: true`), but if Corruption is active, skills exhaust anyway — this is fine. However, the code doesn't actually check the exhaust condition.
- **Fix:** Low priority since it always exhausts, but should be conditional for correctness.

### BUG-20: Rest screen Remove only allows common cards and Strikes/Defends ✅ FIXED
- **Severity:** Medium
- **File:** `src/components/RestScreen.tsx`
- **Description:** `removableCards` filters to `card.rarity === 'common' || card.name.includes('Strike') || card.name.includes('Defend')`. Players can't remove uncommon/rare cards or Wounds.
- **Fix:** Allow removing any card from deck.

---

## Low Bugs

### BUG-21: Enemy kill count in runStats only increments by 1 on total wipe ✅ FIXED
- **Severity:** Low
- **File:** `src/game/utils/gameReducer.ts` — `PLAY_CARD`
- **Description:** `enemiesKilled: state.runStats.enemiesKilled + (aliveEnemies.length === 0 ? 1 : 0)` — only counts 1 when ALL enemies die, not individual kills.
- **Fix:** Use `enemiesKilledNow` variable which already tracks individual kills.

### BUG-22: Disarm can't reduce strength below 0 ✅ FIXED
- **Severity:** Low
- **File:** `src/game/utils/combat.ts` — `handleSpecialEffects('disarm')`
- **Description:** Uses `Math.max(0, ...)` so can't give negative strength. In Slay the Spire, Disarm reduces strength which can go negative.
- **Fix:** Remove the `Math.max(0, ...)` to allow negative strength.

### BUG-23: Run stats damageDealt uses card.damage not actual damage dealt ✅ FIXED
- **Severity:** Low
- **File:** `src/game/utils/gameReducer.ts` — `PLAY_CARD`
- **Description:** `damageDealt: state.runStats.damageDealt + (card.damage || 0)` doesn't account for strength, vulnerable, multi-hit, etc.
- **Fix:** Track actual damage dealt in applyDamageToEnemy.

### BUG-24: goldEarned in runStats is never incremented ✅ FIXED
- **Severity:** Low
- **File:** `src/game/utils/gameReducer.ts`
- **Description:** `runStats.goldEarned` starts at 0 and is never updated when gaining gold.
- **Fix:** Increment goldEarned in EVENT_GAIN_GOLD, CHOOSE_CARD_REWARD, COLLECT_TREASURE.

### BUG-25: Whirlwind costs 0 but description says "for each energy remaining"
- **Severity:** Low
- **Description:** The card works correctly (uses remaining energy for hits, then sets energy to 0). But cost is 0 so all energy remains. This is actually correct behavior matching Slay the Spire's Whirlwind. Not a bug.

---

## Summary
| Severity | Count |
|----------|-------|
| Critical | 7 |
| High | 6 |
| Medium | 7 |
| Low | 5 |
| **Total** | **25** |
