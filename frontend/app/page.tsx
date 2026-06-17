'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import { analyzeTarget } from '@/lib/api'
import { AnalizTuru } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (hedefAdi: string, analizTuru: AnalizTuru) => {
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeTarget(hedefAdi, analizTuru)
      sessionStorage.setItem('last_analysis', JSON.stringify(result))
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analiz sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#16213e] mb-3">İtibar Analizi</h1>
        <p className="text-gray-500 text-lg max-w-xl">
          Şirket veya kişi seçin, ardından adı girerek haberleri, şikayetleri,
          KAP kayıtlarını ve forum içeriklerini otomatik tarayın.
        </p>
      </div>
      <SearchBar onSearch={handleSearch} loading={loading} />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-lg text-sm max-w-md text-center">
          {error}
        </div>
      )}
    </div>
  )
}
