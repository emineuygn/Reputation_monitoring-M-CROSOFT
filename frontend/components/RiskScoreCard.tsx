import { RiskSeverity } from '@/lib/types'

interface Props {
  score: number
  severity: RiskSeverity
}

const CONFIG: Record<RiskSeverity, { label: string; bg: string; ring: string; text: string }> = {
  'düşük':  { label: 'DÜŞÜK',  bg: 'bg-green-50',  ring: 'ring-green-400',  text: 'text-green-700' },
  'orta':   { label: 'ORTA',   bg: 'bg-yellow-50', ring: 'ring-yellow-400', text: 'text-yellow-700' },
  'yüksek': { label: 'YÜKSEK', bg: 'bg-red-50',    ring: 'ring-red-400',    text: 'text-red-700' },
}

export default function RiskScoreCard({ score, severity }: Props) {
  const c = CONFIG[severity] ?? CONFIG['orta']

  return (
    <div className={`rounded-2xl p-6 flex flex-col items-center gap-2 ${c.bg} ring-2 ${c.ring}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Risk Skoru</p>
      <span className={`text-6xl font-extrabold ${c.text}`}>{score}</span>
      <span className="text-xs text-gray-400">/ 100</span>
      <span className={`mt-1 px-3 py-1 rounded-full text-xs font-bold ${c.text} bg-white ring-1 ${c.ring}`}>
        {c.label} RİSK
      </span>
    </div>
  )
}
