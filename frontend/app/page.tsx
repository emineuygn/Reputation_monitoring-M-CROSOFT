'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import StatsCards from '@/components/StatsCards'
import GundemPanel from '@/components/GundemPanel'
import RequireAuth from '@/components/RequireAuth'
import { analyzeTarget } from '@/lib/api'
import { AnalizTuru } from '@/lib/types'

export default function HomePage() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  )
}

function HomeContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (hedefAdi: string, analizTuru: AnalizTuru, vergiNo?: string, naceKodu?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeTarget(hedefAdi, analizTuru, vergiNo, naceKodu)
      sessionStorage.setItem('last_analysis', JSON.stringify(result))
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analiz sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-12 py-6">
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-[#16213e] mb-4 tracking-tight">İtibar Analizi</h1>
          <p className="text-gray-500 text-xl max-w-2xl">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl items-start">
        <StatsCards />
        <GundemPanel />
      </div>
    </div>
  )
}
