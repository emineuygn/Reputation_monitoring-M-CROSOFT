'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RiskScoreCard from '@/components/RiskScoreCard'
import RedFlagList from '@/components/RedFlagList'
import SourceList from '@/components/SourceList'
import SummaryPanel from '@/components/SummaryPanel'
import ExportPdfButton from '@/components/ExportPdfButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import { AnalyzeResponse } from '@/lib/types'

const TUR_LABEL: Record<string, string> = {
  sirket: 'şirketi',
  kisi: 'kişisi',
}

export default function DashboardPage() {
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
        </div>
        {data.id && <ExportPdfButton reportId={data.id} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RiskScoreCard score={data.risk_skoru} severity={data.risk_seviyesi} />
        <div className="md:col-span-2">
          <SummaryPanel ozet={data.genel_ozet} severity={data.risk_seviyesi} analizTuru={data.analiz_turu} />
        </div>
      </div>

      <RedFlagList flags={data.kirmizi_bayraklar} />
      <SourceList sources={data.kaynaklar} />
    </div>
  )
}
