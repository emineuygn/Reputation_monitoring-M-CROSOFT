'use client'

import { useMemo, useState } from 'react'
import { SourceResult } from '@/lib/types'

interface FlatNews {
  kaynak_adi: string
  baslik: string
  url?: string | null
}

interface Filter {
  key: string
  label: string
  keywords: string[]
}

const FILTERS: Filter[] = [
  { key: 'dolandiricilik', label: 'Dolandırıcılık', keywords: ['dolandırıcı', 'dolandırıcılık', 'dolandırdı', 'dolandırma'] },
  { key: 'sahtecilik', label: 'Sahtecilik', keywords: ['sahte', 'sahtecilik', 'sahtekâr'] },
  { key: 'hirsizlik', label: 'Hırsızlık', keywords: ['hırsız', 'hırsızlık', 'çaldı'] },
  { key: 'zimmet', label: 'Zimmet', keywords: ['zimmet'] },
  { key: 'tutuklama', label: 'Tutuklama / Gözaltı', keywords: ['tutukla', 'gözaltı', 'mahkûm', 'mahkumiyet', 'hapis', 'firari'] },
  { key: 'iflas', label: 'İflas / Tasfiye', keywords: ['iflas', 'konkordato', 'tasfiye'] },
  { key: 'icra_haciz', label: 'İcra / Haciz', keywords: ['icra', 'haciz', 'borçlu', 'temerrüt'] },
  { key: 'rusvet', label: 'Rüşvet / Yolsuzluk', keywords: ['rüşvet', 'yolsuzluk', 'suistimal'] },
  { key: 'tehdit', label: 'Tehdit / Şantaj / Gasp', keywords: ['tehdit', 'şantaj', 'gasp'] },
  { key: 'magduriyet', label: 'Mağduriyet / Şikayet', keywords: ['mağdur', 'mağduriyet', 'şikayet'] },
]

interface Props {
  sources: SourceResult[]
}

export default function NewsReview({ sources }: Props) {
  const allNews: FlatNews[] = useMemo(() => {
    const list: FlatNews[] = []
    for (const s of sources) {
      for (const h of s.haberler ?? []) {
        list.push({ kaynak_adi: s.kaynak_adi, baslik: h.baslik, url: h.url })
      }
    }
    return list
  }, [sources])

  const [activeFilters, setActiveFilters] = useState<string[]>(() => FILTERS.map((f) => f.key))
  const [customFilters, setCustomFilters] = useState<string[]>([])
  const [customKeyword, setCustomKeyword] = useState('')

  const allFiltersSelected = activeFilters.length === FILTERS.length + customFilters.length

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleSelectAll = () => {
    setActiveFilters(allFiltersSelected ? [] : [...FILTERS.map((f) => f.key), ...customFilters])
  }

  const addCustomFilter = () => {
    const word = customKeyword.trim()
    if (word.length < 2) return
    const exists = [...FILTERS.map((f) => f.label), ...customFilters].some(
      (label) => label.toLowerCase() === word.toLowerCase()
    )
    if (!exists) setCustomFilters((prev) => [...prev, word])
    setActiveFilters((prev) => (prev.includes(word) ? prev : [...prev, word]))
    setCustomKeyword('')
  }

  const removeCustomFilter = (word: string) => {
    setCustomFilters((prev) => prev.filter((w) => w !== word))
    setActiveFilters((prev) => prev.filter((k) => k !== word))
  }

  const keywordsForKey = (key: string): string[] => {
    const predefined = FILTERS.find((f) => f.key === key)
    if (predefined) return predefined.keywords
    if (customFilters.includes(key)) return [key.toLowerCase()]
    return []
  }

  const matchedLabels = (baslik: string): string[] => {
    const lower = baslik.toLowerCase()
    const predefined = FILTERS.filter((f) => f.keywords.some((kw) => lower.includes(kw))).map((f) => f.label)
    const custom = customFilters.filter((w) => lower.includes(w.toLowerCase()))
    return [...predefined, ...custom]
  }

  const filteredNews = useMemo(() => {
    if (activeFilters.length === 0) return allNews
    const activeKeywords = activeFilters.flatMap(keywordsForKey)
    return allNews.filter((n) => activeKeywords.some((kw) => n.baslik.toLowerCase().includes(kw)))
  }, [allNews, activeFilters, customFilters])

  if (allNews.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Bulunan Haberler ({filteredNews.length}/{allNews.length})
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={toggleSelectAll}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
              ${allFiltersSelected
                ? 'bg-[#16213e] border-[#16213e] text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Tümünü Seç
          </button>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                ${activeFilters.includes(f.key)
                  ? 'bg-[#e94560] border-[#e94560] text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
          {customFilters.map((word) => (
            <span
              key={word}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors
                ${activeFilters.includes(word)
                  ? 'bg-[#e94560] border-[#e94560] text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span onClick={() => toggleFilter(word)}>{word}</span>
              <span onClick={() => removeCustomFilter(word)} className="opacity-70 hover:opacity-100">✕</span>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mt-3 max-w-sm">
          <input
            type="text"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFilter())}
            placeholder="Özel kelime ile filtrele..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 outline-none text-gray-700 focus:border-[#e94560]/50"
          />
          <button
            onClick={addCustomFilter}
            disabled={customKeyword.trim().length < 2}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            + Ekle
          </button>
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-gray-500">
            Seçili filtrelerle eşleşen haber yok.
          </p>
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="mt-3 text-xs font-semibold text-[#e94560] hover:underline"
            >
              Tüm haberleri göster ({allNews.length})
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {filteredNews.map((n, i) => {
            const labels = matchedLabels(n.baslik)
            return (
              <li key={i} className="px-6 py-3 flex items-start gap-3">
                <span className="shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 whitespace-nowrap">
                  {n.kaynak_adi}
                </span>
                <div className="flex-1 min-w-0">
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-700 hover:text-[#e94560] hover:underline leading-snug"
                    >
                      {n.baslik}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-700 leading-snug">{n.baslik}</span>
                  )}
                  {labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {labels.map((l) => (
                        <span key={l} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-600">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
