import { getReports } from '@/lib/api'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const SEVERITY_STYLE: Record<string, string> = {
  'düşük': 'bg-green-100 text-green-800',
  'orta':  'bg-yellow-100 text-yellow-800',
  'yüksek':'bg-red-100 text-red-800',
}

const TUR_BADGE: Record<string, { label: string; style: string }> = {
  sirket: { label: '🏢 Şirket', style: 'bg-blue-50 text-blue-700' },
  kisi:   { label: '👤 Kişi',   style: 'bg-purple-50 text-purple-700' },
}

export default async function HistoryPage() {
  let reports
  try {
    reports = await getReports()
  } catch {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>Geçmiş raporlar yüklenemedi. Backend çalışıyor mu?</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#16213e] mb-6">Geçmiş Sorgular</h1>
      {reports.length === 0 ? (
        <p className="text-gray-500">Henüz sorgu yapılmadı.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-[#16213e] text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Tür</th>
                <th className="px-4 py-3 text-left">Ad</th>
                <th className="px-4 py-3 text-left">Risk Skoru</th>
                <th className="px-4 py-3 text-left">Seviye</th>
                <th className="px-4 py-3 text-left">Tarih</th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => {
                const tur = TUR_BADGE[r.analiz_turu] ?? TUR_BADGE.sirket
                return (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-400">{r.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tur.style}`}>
                        {tur.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.hedef_adi}</td>
                    <td className="px-4 py-3">{r.risk_skoru} / 100</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_STYLE[r.risk_seviyesi] || ''}`}>
                        {r.risk_seviyesi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.tarih).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/company/${r.id}`} className="text-[#e94560] hover:underline text-xs font-medium">
                        Detay →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
