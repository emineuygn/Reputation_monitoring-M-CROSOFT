'use client'

import { useState, FormEvent } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { AnalizTuru } from '@/lib/types'

interface Props {
  onSearch: (hedefAdi: string, analizTuru: AnalizTuru, vergiNo?: string, naceKodu?: string) => Promise<void>
  loading: boolean
}

const TABS: { value: AnalizTuru; label: string; icon: string; placeholder: string }[] = [
  {
    value: 'sirket',
    label: 'Firma',
    icon: '🏢',
    placeholder: 'Firma adını girin (örn: XYZ Teknoloji A.Ş.)',
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
  const [vergiNo, setVergiNo] = useState('')
  const [naceKodu, setNaceKodu] = useState('')
  const [analizTuru, setAnalizTuru] = useState<AnalizTuru>('sirket')

  const active = TABS.find((t) => t.value === analizTuru)!

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onSearch(
      value.trim(),
      analizTuru,
      analizTuru === 'sirket' ? vergiNo.trim() || undefined : undefined,
      analizTuru === 'sirket' ? naceKodu.trim() || undefined : undefined
    )
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">

      <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm w-fit mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => { setAnalizTuru(tab.value); setValue(''); setVergiNo(''); setNaceKodu('') }}
            disabled={loading}
            className={`px-7 py-2.5 text-base font-semibold transition-colors flex items-center gap-2
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


      <form onSubmit={handleSubmit} className="flex shadow-lg rounded-2xl overflow-hidden border border-gray-200 bg-white">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={active.placeholder}
          className="flex-1 px-5 py-4 text-base outline-none text-gray-700"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="bg-[#e94560] hover:bg-[#c73652] disabled:opacity-50 text-white px-8 py-4 text-base font-semibold transition-colors whitespace-nowrap"
        >
          {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </button>
      </form>

      {analizTuru === 'sirket' && (
        <div className="flex gap-3">
          <input
            type="text"
            value={vergiNo}
            onChange={(e) => setVergiNo(e.target.value)}
            placeholder="Vergi numarası (opsiyonel)"
            className="flex-1 px-4 py-2 text-xs rounded-lg border border-gray-200 outline-none text-gray-700 focus:border-[#e94560]/50"
            disabled={loading}
          />
          <input
            type="text"
            value={naceKodu}
            onChange={(e) => setNaceKodu(e.target.value)}
            placeholder="NACE kodu (opsiyonel)"
            className="flex-1 px-4 py-2 text-xs rounded-lg border border-gray-200 outline-none text-gray-700 focus:border-[#e94560]/50"
            disabled={loading}
          />
        </div>
      )}

      {loading && (
        <div className="mt-4">
          <LoadingSpinner text="Kaynaklar taranıyor, lütfen bekleyin..." />
        </div>
      )}
    </div>
  )
}
