'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getReports } from '@/lib/api'
import { AnalyzeResponse } from '@/lib/types'
import RequireAuth from '@/components/RequireAuth'
import LoadingSpinner from '@/components/LoadingSpinner'

const SEVERITY_STYLE: Record<string, { bar: string; badge: string }> = {
  'düşük':  { bar: 'bg-green-400',  badge: 'bg-green-100 text-green-800'  },
  'orta':   { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800' },
  'yüksek': { bar: 'bg-red-400',    badge: 'bg-red-100 text-red-800'       },
}

const TUR_BADGE: Record<string, { label: string; style: string }> = {
  sirket: { label: '🏢 Şirket', style: 'bg-blue-50 text-blue-700' },
  kisi:   { label: '👤 Kişi',   style: 'bg-purple-50 text-purple-700' },
}

export default function HistoryPage() {
  return (
    <RequireAuth>
      <HistoryContent />
    </RequireAuth>
  )
}

function HistoryContent() {
  const [reports, setReports] = useState<AnalyzeResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>Geçmiş raporlar yüklenemedi. Backend çalışıyor mu?</p>
      </div>
    )
  }

  if (!reports) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#16213e] mb-6">Geçmiş Sorgular</h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">Henüz sorgu yapılmadı.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const sev = SEVERITY_STYLE[r.risk_seviyesi] ?? SEVERITY_STYLE['orta']
            const tur = TUR_BADGE[r.analiz_turu] ?? TUR_BADGE.sirket

            return (
              <Link
                key={r.id}
                href={`/company/${r.id}`}
                className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-[#e94560]/30 transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tur.style}`}>
                        {tur.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(r.tarih).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#16213e]">{r.hedef_adi}</h2>
                    {r.genel_ozet && (
                      <p className="text-xs text-gray-500 max-w-xl leading-relaxed line-clamp-2">
                        {r.genel_ozet}
                      </p>
                    )}
                  </div>


                  <div className="flex flex-col items-end gap-2 shrink-0">

                    <div className="flex items-center gap-2">
                      <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sev.bar}`}
                          style={{ width: `${r.risk_skoru}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">
                        {r.risk_skoru}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sev.badge}`}>
                        {r.risk_seviyesi}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
