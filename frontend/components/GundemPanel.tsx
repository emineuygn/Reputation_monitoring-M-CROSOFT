'use client'

import { useEffect, useState } from 'react'
import { getGundem } from '@/lib/api'
import { GundemHaber } from '@/lib/types'

export default function GundemPanel() {
  const [haberler, setHaberler] = useState<GundemHaber[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getGundem()
      .then((data) => setHaberler(data.haberler))
      .catch(() => setError(true))
  }, [])

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span>📰</span> Gündem
      </h2>

      {error && (
        <p className="text-xs text-gray-400">Gündem haberleri yüklenemedi.</p>
      )}

      {!error && !haberler && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${85 - i * 8}%` }} />
          ))}
        </div>
      )}

      {haberler && haberler.length === 0 && (
        <p className="text-xs text-gray-400">Şu anda gösterilecek gündem haberi yok.</p>
      )}

      {haberler && haberler.length > 0 && (
        <ul className="space-y-3">
          {haberler.map((h, i) => (
            <li key={i} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
              {h.url ? (
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-700 hover:text-[#e94560] leading-snug"
                >
                  {h.baslik}
                </a>
              ) : (
                <span className="text-xs text-gray-700 leading-snug">{h.baslik}</span>
              )}
              <p className="text-[10px] text-gray-400 mt-0.5">{h.kaynak}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
