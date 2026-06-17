import { AnalyzeResponse, AnalizTuru } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'API hatası')
  }
  return res.json()
}

export async function analyzeTarget(hedefAdi: string, analizTuru: AnalizTuru): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hedef_adi: hedefAdi, analiz_turu: analizTuru }),
  })
  return handleResponse<AnalyzeResponse>(res)
}

export async function getReports(): Promise<AnalyzeResponse[]> {
  const res = await fetch(`${BASE_URL}/api/reports`)
  return handleResponse<AnalyzeResponse[]>(res)
}

export async function getReportById(id: string | number): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/api/reports/${id}`)
  return handleResponse<AnalyzeResponse>(res)
}

export async function exportPdf(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/export/pdf?report_id=${id}`, { method: 'POST' })
  if (!res.ok) throw new Error('PDF oluşturulamadı.')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `itibar_raporu_${id}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
