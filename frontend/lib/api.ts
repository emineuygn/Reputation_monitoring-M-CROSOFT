import { AnalyzeResponse, AnalizTuru, Stats, Gundem } from './types'
import { getToken, setAuth, clearAuth, AuthUser } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      clearAuth()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'API hatası')
  }
  return res.json()
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

interface AuthResult {
  access_token: string
  user: AuthUser
}

export async function register(email: string, password: string, adSoyad?: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ad_soyad: adSoyad || undefined }),
  })
  const data = await handleResponse<AuthResult>(res)
  setAuth(data.access_token, data.user)
  return data.user
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await handleResponse<AuthResult>(res)
  setAuth(data.access_token, data.user)
  return data.user
}

export async function analyzeTarget(
  hedefAdi: string,
  analizTuru: AnalizTuru,
  vergiNo?: string,
  naceKodu?: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      hedef_adi: hedefAdi,
      analiz_turu: analizTuru,
      vergi_no: vergiNo || undefined,
      nace_kodu: naceKodu || undefined,
    }),
  })
  return handleResponse<AnalyzeResponse>(res)
}

export async function getReports(): Promise<AnalyzeResponse[]> {
  const res = await fetch(`${BASE_URL}/api/reports`, { cache: 'no-store', headers: authHeaders() })
  return handleResponse<AnalyzeResponse[]>(res)
}

export async function getReportById(id: string | number): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/api/reports/${id}`, { cache: 'no-store', headers: authHeaders() })
  return handleResponse<AnalyzeResponse>(res)
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${BASE_URL}/api/reports/stats`, { cache: 'no-store', headers: authHeaders() })
  return handleResponse<Stats>(res)
}

export async function getGundem(): Promise<Gundem> {
  const res = await fetch(`${BASE_URL}/api/gundem`, { cache: 'no-store', headers: authHeaders() })
  return handleResponse<Gundem>(res)
}

export async function exportPdf(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/export/pdf?report_id=${id}`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('PDF oluşturulamadı.')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `itibar_raporu_${id}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
