import { RiskSeverity } from '@/lib/types'

interface Props {
  score: number
  severity: RiskSeverity
}

const CONFIG: Record<RiskSeverity, { label: string; bg: string; ring: string; text: string; stroke: string }> = {
  'düşük':  { label: 'DÜŞÜK',  bg: 'bg-green-50',  ring: 'ring-green-400',  text: 'text-green-700', stroke: '#22c55e' },
  'orta':   { label: 'ORTA',   bg: 'bg-yellow-50', ring: 'ring-yellow-400', text: 'text-yellow-700', stroke: '#eab308' },
  'yüksek': { label: 'YÜKSEK', bg: 'bg-red-50',    ring: 'ring-red-400',    text: 'text-red-700', stroke: '#ef4444' },
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function RiskScoreCard({ score, severity }: Props) {
  const c = CONFIG[severity] ?? CONFIG['orta']
  const clamped = Math.max(0, Math.min(100, score))
  const offset = CIRCUMFERENCE * (1 - clamped / 100)

  return (
    <div className={`rounded-2xl p-6 flex flex-col items-center gap-3 ${c.bg} ring-2 ${c.ring}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Risk Skoru</p>

      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="white" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={RADIUS} fill="none"
            stroke={c.stroke} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${c.text}`}>{score}</span>
          <span className="text-[11px] text-gray-400">/ 100</span>
        </div>
      </div>

      <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.text} bg-white ring-1 ${c.ring}`}>
        {c.label} RİSK
      </span>
    </div>
  )
}
