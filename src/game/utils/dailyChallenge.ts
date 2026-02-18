import { DailyChallengeResult, GameState } from '../types'
import { todayLabel, todaySeed } from './seededRng'

const STORAGE_KEY = 'deck-dungeon-daily'

export function getDailyResults(): DailyChallengeResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function getTodayResult(): DailyChallengeResult | null {
  const today = todayLabel()
  return getDailyResults().find(r => r.date === today) || null
}

export function hasCompletedToday(): boolean {
  return getTodayResult() !== null
}

export function recordDailyResult(state: GameState, victory: boolean) {
  if (!state.dailyChallenge) return
  const results = getDailyResults()
  // Don't overwrite if already completed today
  if (results.some(r => r.date === state.dailyChallenge!.date)) return
  
  const elapsed = Date.now() - state.runStats.startTime
  const score = calculateScore(state, victory, elapsed)
  
  results.push({
    date: state.dailyChallenge.date,
    seed: state.dailyChallenge.seed,
    score,
    floorsCleared: state.runStats.floorsCleared,
    victory,
    timeMs: elapsed
  })
  
  // Keep last 30 days
  while (results.length > 30) results.shift()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
}

function calculateScore(state: GameState, victory: boolean, timeMs: number): number {
  let score = 0
  score += state.runStats.floorsCleared * 10
  score += state.runStats.enemiesKilled * 5
  score += Math.floor(state.runStats.damageDealt / 10)
  score += state.player.gold
  if (victory) {
    score += 500
    // Time bonus: up to 300 points for finishing under 20 min
    const minutes = timeMs / 60000
    if (minutes < 20) score += Math.floor(300 * (1 - minutes / 20))
  }
  return score
}
