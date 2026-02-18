import { LifetimeStats, GameState } from '../types'

const STORAGE_KEY = 'deck-dungeon-lifetime-stats'

const defaultStats: LifetimeStats = {
  totalRuns: 0,
  victories: 0,
  deaths: 0,
  totalFloorsCleared: 0,
  totalEnemiesKilled: 0,
  totalDamageDealt: 0,
  totalCardsPlayed: 0,
  totalGoldEarned: 0,
  totalPlayTimeMs: 0,
  bestFloor: 0,
  fastestVictoryMs: null,
  longestRun: 0,
}

export function getLifetimeStats(): LifetimeStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultStats, ...JSON.parse(raw) }
  } catch {}
  return { ...defaultStats }
}

export function recordRunEnd(gameState: GameState, victory: boolean): LifetimeStats {
  const stats = getLifetimeStats()
  const rs = gameState.runStats
  const elapsed = Date.now() - rs.startTime
  const totalFloor = ((gameState.currentAct - 1) * 15) + gameState.currentFloor

  stats.totalRuns++
  if (victory) stats.victories++
  else stats.deaths++
  stats.totalFloorsCleared += rs.floorsCleared
  stats.totalEnemiesKilled += rs.enemiesKilled
  stats.totalDamageDealt += rs.damageDealt
  stats.totalCardsPlayed += rs.cardsPlayed
  stats.totalGoldEarned += rs.goldEarned
  stats.totalPlayTimeMs += elapsed
  if (totalFloor > stats.bestFloor) stats.bestFloor = totalFloor
  if (elapsed > stats.longestRun) stats.longestRun = elapsed
  if (victory && (stats.fastestVictoryMs === null || elapsed < stats.fastestVictoryMs)) {
    stats.fastestVictoryMs = elapsed
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {}
  return stats
}
