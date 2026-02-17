# Deck Dungeon

Browser-based roguelike deck-builder inspired by Slay the Spire. Built with Next.js + TypeScript + Tailwind CSS.

**Live:** [deck-dungeon.vercel.app](https://deck-dungeon.vercel.app)

## Features

- 3 acts with escalating difficulty
- 40+ unique cards (Attack, Skill, Power)
- Status effects (Strength, Block, Vulnerable, Weak, Poison, etc.)
- Branching map with combat, elite, event, shop, rest, and boss nodes
- Relic system with passive bonuses
- Potion system
- Shop for buying/removing cards
- Prestige system for replayability
- Dark fantasy visual theme

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Deployed on Vercel via `git push`

## Project Structure

```
src/
  app/           - Next.js pages and global styles
  components/    - React components (Combat, Map, Shop, Events, etc.)
  game/
    data/        - Card, enemy, event, potion, relic definitions
    types/       - TypeScript interfaces
    utils/       - Game logic (combat, reducer, map generation)
  hooks/         - Custom React hooks
```

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Deploy

```bash
git add -A && git commit -m "description" && git push origin main
```

Vercel auto-deploys from GitHub.
