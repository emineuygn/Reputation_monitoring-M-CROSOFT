'use client'

import { useState } from 'react'
import { SourceResult } from '@/lib/types'

interface Props {
  sources: SourceResult[]
}

export default function SourceList({ sources }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Taranan Kaynaklar ({sources.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-50">
        {sources.map((s, i) => {
          const hasLinks = s.haberler && s.haberler.length > 0
          const isOpen = expanded === i

          return (
            <div key={i}>

              <div
                className={`flex items-center gap-3 px-6 py-3 ${hasLinks ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                onClick={() => hasLinks && setExpanded(isOpen ? null : i)}
              >

                <div className="w-44 shrink-0">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#e94560] hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      {s.kaynak_adi}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-gray-700">{s.kaynak_adi}</span>
                  )}
                </div>


                <span className={`shrink-0 w-10 text-center text-xs font-semibold px-2 py-0.5 rounded-full
                  ${s.sonuc_sayisi > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                  {s.sonuc_sayisi}
                </span>


                <span className="flex-1 text-xs text-gray-500 truncate">
                  {s.bulunan_icerik_ozeti.length > 100
                    ? s.bulunan_icerik_ozeti.slice(0, 100) + '…'
                    : s.bulunan_icerik_ozeti}
                </span>


                {hasLinks && (
                  <span className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                )}
              </div>


              {isOpen && hasLinks && (
                <ul className="px-6 pb-4 space-y-1.5 bg-gray-50 border-t border-gray-100">
                  {s.haberler!.map((h, j) => (
                    <li key={j} className="flex items-start gap-2 pt-1.5">
                      <span className="text-[#e94560] mt-0.5 shrink-0">›</span>
                      {h.url ? (
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-700 hover:text-[#e94560] hover:underline leading-snug"
                        >
                          {h.baslik}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 leading-snug">{h.baslik}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
