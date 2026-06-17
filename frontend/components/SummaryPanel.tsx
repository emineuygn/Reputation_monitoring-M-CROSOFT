import { RiskSeverity, AnalizTuru } from '@/lib/types'

interface Props {
  ozet: string
  severity: RiskSeverity
  analizTuru?: AnalizTuru
}

const VERDICT: Record<RiskSeverity, { sirket: string; kisi: string; style: string }> = {
  'düşük':  {
    sirket: 'Bu şirketle çalışmak görece güvenli görünmektedir.',
    kisi:   'Bu kişiyle iş yapmak görece güvenli görünmektedir.',
    style:  'text-green-700 bg-green-50 border-green-200',
  },
  'orta':   {
    sirket: 'Bu şirketle çalışmadan önce dikkatli inceleme yapın.',
    kisi:   'Bu kişiyle iş yapmadan önce dikkatli inceleme yapın.',
    style:  'text-yellow-700 bg-yellow-50 border-yellow-200',
  },
  'yüksek': {
    sirket: 'Bu şirketle çalışmak yüksek risk taşımaktadır!',
    kisi:   'Bu kişiyle iş yapmak yüksek risk taşımaktadır!',
    style:  'text-red-700 bg-red-50 border-red-200',
  },
}

export default function SummaryPanel({ ozet, severity, analizTuru = 'sirket' }: Props) {
  const v = VERDICT[severity] ?? VERDICT['orta']
  const verdictText = analizTuru === 'kisi' ? v.kisi : v.sirket

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-4 shadow-sm h-full">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Genel Değerlendirme</h2>
      <p className="text-gray-700 text-sm leading-relaxed flex-1">{ozet}</p>
      <div className={`border rounded-lg px-4 py-3 text-sm font-semibold ${v.style}`}>
        {verdictText}
      </div>
    </div>
  )
}
