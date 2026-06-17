import { RedFlag, RiskSeverity } from '@/lib/types'

interface Props {
  flags: RedFlag[]
}

const BADGE: Record<RiskSeverity, string> = {
  'düşük':  'bg-green-100 text-green-800',
  'orta':   'bg-yellow-100 text-yellow-800',
  'yüksek': 'bg-red-100 text-red-800',
}

export default function RedFlagList({ flags }: Props) {
  if (flags.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Kırmızı Bayraklar</h2>
        <p className="text-gray-400 text-sm">Kritik bir bulgu tespit edilmedi.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Kırmızı Bayraklar ({flags.length})
      </h2>
      <ul className="space-y-3">
        {flags.map((flag, i) => (
          <li key={i} className="flex gap-3 items-start border-l-4 border-[#e94560] pl-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs text-gray-400">{flag.kaynak}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE[flag.ciddiyet] ?? ''}`}>
                  {flag.ciddiyet}
                </span>
              </div>
              {flag.url ? (
                <a
                  href={flag.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-800 hover:text-[#e94560] hover:underline"
                >
                  {flag.baslik}
                </a>
              ) : (
                <p className="text-sm font-medium text-gray-800">{flag.baslik}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{flag.ozet}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
