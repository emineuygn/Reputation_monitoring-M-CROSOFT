'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RiskScoreCard from '@/components/RiskScoreCard'
import RedFlagList from '@/components/RedFlagList'
import SourceList from '@/components/SourceList'
import NewsReview from '@/components/NewsReview'
import SummaryPanel from '@/components/SummaryPanel'
import ExportPdfButton from '@/components/ExportPdfButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import RequireAuth from '@/components/RequireAuth'
import { AnalyzeResponse } from '@/lib/types'

const TUR_LABEL: Record<string, string> = {
  sirket: 'şirketi',
  kisi: 'kişisi',
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  )
}

function DashboardContent() {
  const router = useRouter()
  const [data, setData] = useState<AnalyzeResponse | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('last_analysis')
    if (stored) {
      setData(JSON.parse(stored))
    } else {
      router.push('/')
    }
  }, [router])

  if (!data) return <LoadingSpinner />

  const turLabel = TUR_LABEL[data.analiz_turu] ?? 'için'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {data.analiz_turu === 'kisi' ? '👤 Kişi Analizi' : '🏢 Şirket Analizi'}
          </p>
          <h1 className="text-2xl font-bold text-[#16213e]">
            {data.hedef_adi} <span className="font-normal text-gray-400">{turLabel} için sonuçlar</span>
          </h1>
          {(data.vergi_no || data.nace_kodu) && (
            <p className="text-xs text-gray-400 mt-1">
              {data.vergi_no && <span>VKN: {data.vergi_no}</span>}
              {data.vergi_no && data.nace_kodu && <span className="mx-1.5">·</span>}
              {data.nace_kodu && <span>NACE: {data.nace_kodu}</span>}
            </p>
          )}
        </div>
        {data.id && <ExportPdfButton reportId={data.id} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RiskScoreCard score={data.risk_skoru} severity={data.risk_seviyesi} />
        <div className="md:col-span-2">
          <SummaryPanel ozet={data.genel_ozet} kisaYorum={data.kisa_yorum} severity={data.risk_seviyesi} />
        </div>
      </div>

      <RedFlagList flags={data.kirmizi_bayraklar} />
      <NewsReview sources={data.kaynaklar} />
      <SourceList sources={data.kaynaklar} />
    </div>
  )
}
