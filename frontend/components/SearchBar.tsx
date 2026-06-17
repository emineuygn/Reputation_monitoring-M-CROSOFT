'use client'

import { useState, FormEvent } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { AnalizTuru } from '@/lib/types'

interface Props {
  onSearch: (hedefAdi: string, analizTuru: AnalizTuru) => Promise<void>
  loading: boolean
}

const TABS: { value: AnalizTuru; label: string; icon: string; placeholder: string }[] = [
  {
    value: 'sirket',
    label: 'Şirket',
    icon: '🏢',
    placeholder: 'Şirket adını girin (örn: XYZ Teknoloji A.Ş.)',
  },
  {
    value: 'kisi',
    label: 'Kişi',
    icon: '👤',
    placeholder: 'Kişi adını girin (örn: Emine Uygun)',
  },
]

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')
  const [analizTuru, setAnalizTuru] = useState<AnalizTuru>('sirket')

  const active = TABS.find((t) => t.value === analizTuru)!

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onSearch(value.trim(), analizTuru)
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">
      {/* Şirket / Kişi toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm w-fit mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => { setAnalizTuru(tab.value); setValue('') }}
            disabled={loading}
            className={`px-6 py-2 text-sm font-semibold transition-colors flex items-center gap-2
              ${analizTuru === tab.value
                ? 'bg-[#16213e] text-white'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Arama kutusu */}
      <form onSubmit={handleSubmit} className="flex shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={active.placeholder}
          className="flex-1 px-4 py-3 text-sm outline-none text-gray-700"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="bg-[#e94560] hover:bg-[#c73652] disabled:opacity-50 text-white px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap"
        >
          {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </button>
      </form>

      {loading && (
        <div className="mt-4">
          <LoadingSpinner text="Kaynaklar taranıyor, lütfen bekleyin..." />
        </div>
      )}
    </div>
  )
}
