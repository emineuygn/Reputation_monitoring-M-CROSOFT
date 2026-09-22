'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getReportById } from '@/lib/api'
import { AnalyzeResponse } from '@/lib/types'
import RiskScoreCard from '@/components/RiskScoreCard'
import RedFlagList from '@/components/RedFlagList'
import SourceList from '@/components/SourceList'
import NewsReview from '@/components/NewsReview'
import SummaryPanel from '@/components/SummaryPanel'
import ExportPdfButton from '@/components/ExportPdfButton'
import RequireAuth from '@/components/RequireAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'

const TUR_LABEL: Record<string, { icon: string; suffix: string }> = {
  sirket: { icon: '🏢', suffix: 'şirketi için sonuçlar' },
  kisi:   { icon: '👤', suffix: 'kişisi için sonuçlar' },
}

export default function CompanyReportPage() {
  return (
    <RequireAuth>
      <CompanyReportContent />
    </RequireAuth>
  )
}

function CompanyReportContent() {
  const params = useParams<{ id: string }>()
  const [data, setData] = useState<AnalyzeResponse | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!params.id) return
    getReportById(params.id)
      .then(setData)
      .catch(() => setNotFound(true))
  }, [params.id])

  if (notFound) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Rapor bulunamadı.</p>
        <Link href="/history" className="text-[#e94560] underline mt-2 inline-block">Geçmişe dön</Link>
      </div>
    )
  }

  if (!data) return <LoadingSpinner />

  const tur = TUR_LABEL[data.analiz_turu] ?? TUR_LABEL.sirket

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/history" className="text-sm text-gray-500 hover:text-[#e94560]">← Geçmiş</Link>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{tur.icon} {data.analiz_turu === 'kisi' ? 'Kişi Analizi' : 'Şirket Analizi'}</p>
          <h1 className="text-2xl font-bold text-[#16213e]">
            {data.hedef_adi} <span className="font-normal text-gray-400">{tur.suffix}</span>
          </h1>
          {(data.vergi_no || data.nace_kodu) && (
            <p className="text-xs text-gray-400">
              {data.vergi_no && <span>VKN: {data.vergi_no}</span>}
              {data.vergi_no && data.nace_kodu && <span className="mx-1.5">·</span>}
              {data.nace_kodu && <span>NACE: {data.nace_kodu}</span>}
            </p>
          )}
          <p className="text-xs text-gray-400">{new Date(data.tarih).toLocaleString('tr-TR')}</p>
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
