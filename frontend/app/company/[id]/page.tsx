import { getReportById } from '@/lib/api'
import RiskScoreCard from '@/components/RiskScoreCard'
import RedFlagList from '@/components/RedFlagList'
import SourceList from '@/components/SourceList'
import SummaryPanel from '@/components/SummaryPanel'
import ExportPdfButton from '@/components/ExportPdfButton'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

const TUR_LABEL: Record<string, { icon: string; suffix: string }> = {
  sirket: { icon: '🏢', suffix: 'şirketi için sonuçlar' },
  kisi:   { icon: '👤', suffix: 'kişisi için sonuçlar' },
}

export default async function CompanyReportPage({ params }: Props) {
  let data
  try {
    data = await getReportById(params.id)
  } catch {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Rapor bulunamadı.</p>
        <Link href="/history" className="text-[#e94560] underline mt-2 inline-block">Geçmişe dön</Link>
      </div>
    )
  }

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
          <p className="text-xs text-gray-400">{new Date(data.tarih).toLocaleString('tr-TR')}</p>
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
