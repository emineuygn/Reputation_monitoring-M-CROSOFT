import { RiskSeverity } from '@/lib/types'

interface Props {
  ozet: string
  kisaYorum: string
  severity: RiskSeverity
}

const STYLE: Record<RiskSeverity, string> = {
  'düşük':  'text-green-700 bg-green-50 border-green-200',
  'orta':   'text-yellow-700 bg-yellow-50 border-yellow-200',
  'yüksek': 'text-red-700 bg-red-50 border-red-200',
}

export default function SummaryPanel({ ozet, kisaYorum, severity }: Props) {
  const style = STYLE[severity] ?? STYLE['orta']

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-4 shadow-sm h-full">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Genel Değerlendirme</h2>
      <p className="text-gray-700 text-sm leading-relaxed flex-1">{ozet}</p>
      <div className={`border rounded-lg px-4 py-3 text-sm font-semibold ${style}`}>
        {kisaYorum}
      </div>
    </div>
  )
}
