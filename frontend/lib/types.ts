export type RiskSeverity = 'düşük' | 'orta' | 'yüksek'
export type AnalizTuru = 'sirket' | 'kisi'

export interface RedFlag {
  kaynak: string
  baslik: string
  ozet: string
  ciddiyet: RiskSeverity
  url?: string | null
}

export interface Haber {
  baslik: string
  url?: string | null
}

export interface SourceResult {
  kaynak_adi: string
  url?: string | null
  bulunan_icerik_ozeti: string
  sonuc_sayisi: number
  haberler?: Haber[]
}

export interface AnalyzeResponse {
  id?: number | null
  hedef_adi: string
  analiz_turu: AnalizTuru
  risk_skoru: number
  risk_seviyesi: RiskSeverity
  kirmizi_bayraklar: RedFlag[]
  kaynaklar: SourceResult[]
  genel_ozet: string
  tarih: string
}
