export type RiskSeverity = 'düşük' | 'orta' | 'yüksek'
export type AnalizTuru = 'sirket' | 'kisi'

export interface RedFlag {
  kaynak: string
  baslik: string
  ozet: string
  ciddiyet: RiskSeverity
  url?: string | null
}

export interface Stats {
  toplam_sorgu: number
  ortalama_risk: number
  yuksek_riskli_sayisi: number
  bu_ay_sorgu: number
}

export interface Haber {
  baslik: string
  url?: string | null
}

export interface GundemHaber {
  baslik: string
  url?: string | null
  kaynak: string
}

export interface Gundem {
  haberler: GundemHaber[]
  guncellenme: string
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
  vergi_no?: string | null
  nace_kodu?: string | null
  risk_skoru: number
  risk_seviyesi: RiskSeverity
  kirmizi_bayraklar: RedFlag[]
  kaynaklar: SourceResult[]
  genel_ozet: string
  kisa_yorum: string
  tarih: string
}
