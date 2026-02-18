import { LifetimeStats } from '../game/types'

interface StatsScreenProps {
  stats: LifetimeStats
  onBack: () => void
}

function fmt(ms: number): string {
  const totalMin = Math.floor(ms / 60000)
  if (totalMin < 60) return `${totalMin}m`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}h ${m}m`
}

export default function StatsScreen({ stats, onBack }: StatsScreenProps) {
  const winRate = stats.totalRuns > 0 ? Math.round((stats.victories / stats.totalRuns) * 100) : 0

  const rows: [string, string | number, string][] = [
    ['Total Runs', stats.totalRuns, 'text-purple-400'],
    ['Victories', stats.victories, 'text-yellow-400'],
    ['Deaths', stats.deaths, 'text-red-400'],
    ['Win Rate', `${winRate}%`, 'text-green-400'],
    ['Best Floor', stats.bestFloor, 'text-blue-400'],
    ['Enemies Slain', stats.totalEnemiesKilled, 'text-red-400'],
    ['Cards Played', stats.totalCardsPlayed, 'text-purple-400'],
    ['Damage Dealt', stats.totalDamageDealt, 'text-orange-400'],
    ['Gold Earned', stats.totalGoldEarned, 'text-yellow-400'],
    ['Total Play Time', fmt(stats.totalPlayTimeMs), 'text-green-400'],
    ['Longest Run', fmt(stats.longestRun), 'text-cyan-400'],
    ['Fastest Victory', stats.fastestVictoryMs ? fmt(stats.fastestVictoryMs) : '—', 'text-emerald-400'],
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in-up">
      <div className="text-6xl mb-4">📊</div>
      <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Lifetime Stats
      </h1>
      <p className="text-gray-400 mb-8">Your journey across all runs</p>

      <div className="panel p-6 max-w-md w-full">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {rows.map(([label, val, color]) => (
            <div key={label} className="panel p-3 text-center">
              <div className={`text-xl font-black ${color}`}>{val}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onBack} className="game-button text-lg px-8 py-4 mt-8">
        ← Back
      </button>
    </div>
  )
}
