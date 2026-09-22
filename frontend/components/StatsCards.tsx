'use client'

import { useEffect, useState } from 'react'
import { getStats } from '@/lib/api'
import { Stats } from '@/lib/types'

const CARDS: { key: keyof Stats; label: string; icon: string; suffix?: string }[] = [
  { key: 'toplam_sorgu', label: 'Toplam Sorgu', icon: '📊' },
  { key: 'bu_ay_sorgu', label: 'Bu Ay', icon: '📅' },
  { key: 'ortalama_risk', label: 'Ortalama Risk', icon: '⚖️', suffix: '/100' },
  { key: 'yuksek_riskli_sayisi', label: 'Yüksek Riskli', icon: '🚩' },
]

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getStats().then(setStats).catch(() => setError(true))
  }, [])

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span>📊</span> İstatistikler
      </h2>

      {error && <p className="text-xs text-gray-400">İstatistikler yüklenemedi.</p>}

      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-xl bg-gray-50 px-3 py-3 flex items-center gap-2.5">
            <span className="text-lg shrink-0">{c.icon}</span>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-[#16213e] leading-tight">
                {stats ? `${stats[c.key]}${c.suffix ?? ''}` : '—'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
