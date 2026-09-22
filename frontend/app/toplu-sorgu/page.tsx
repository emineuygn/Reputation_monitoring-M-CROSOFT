'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { analyzeTarget } from '@/lib/api'
import { AnalizTuru, AnalyzeResponse } from '@/lib/types'
import RequireAuth from '@/components/RequireAuth'

type Durum = 'bekliyor' | 'taranıyor' | 'tamamlandı' | 'hata'

interface Row {
  ad: string
  durum: Durum
  sonuc?: AnalyzeResponse
  hata?: string
}

const CONCURRENCY = 2

const SEVERITY_BADGE: Record<string, string> = {
  'düşük': 'bg-green-100 text-green-800',
  'orta': 'bg-yellow-100 text-yellow-800',
  'yüksek': 'bg-red-100 text-red-800',
}

function parseNames(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(',')[0].trim().replace(/^"|"$/g, ''))
    .filter((name) => name.length > 0)
}

export default function TopluSorguPage() {
  return (
    <RequireAuth>
      <TopluSorguContent />
    </RequireAuth>
  )
}

function TopluSorguContent() {
  const [analizTuru, setAnalizTuru] = useState<AnalizTuru>('sirket')
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [textInput, setTextInput] = useState('')

  const loadFromText = (text: string) => {
    const names = parseNames(text)
    setRows(names.map((ad) => ({ ad, durum: 'bekliyor' as Durum })))
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => loadFromText(String(reader.result ?? ''))
    reader.readAsText(file, 'utf-8')
  }

  const startBatch = async () => {
    if (rows.length === 0 || running) return
    setRunning(true)

    const queue = rows.map((_, i) => i)
    const worker = async () => {
      while (queue.length > 0) {
        const idx = queue.shift()
        if (idx === undefined) return
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, durum: 'taranıyor' } : r)))
        try {
          const sonuc = await analyzeTarget(rows[idx].ad, analizTuru)
          setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, durum: 'tamamlandı', sonuc } : r)))
        } catch (err) {
          const hata = err instanceof Error ? err.message : 'Bilinmeyen hata'
          setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, durum: 'hata', hata } : r)))
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    setRunning(false)
  }

  const reset = () => {
    setRows([])
    setTextInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const tamamlanan = rows.filter((r) => r.durum === 'tamamlandı' || r.durum === 'hata').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16213e]">Toplu Sorgu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Birden fazla firma veya kişiyi tek seferde taratın. CSV dosyası yükleyin ya da isimleri
          alt alta yapıştırın (her satıra bir isim).
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
        <div className="flex rounded-xl overflow-hidden border border-gray-200 w-fit">
          {(['sirket', 'kisi'] as AnalizTuru[]).map((t) => (
            <button
              key={t}
              onClick={() => setAnalizTuru(t)}
              disabled={running}
              className={`px-5 py-2 text-sm font-semibold transition-colors
                ${analizTuru === t ? 'bg-[#16213e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t === 'sirket' ? '🏢 Firma' : '👤 Kişi'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CSV Dosyası</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              disabled={running}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="mt-2 block w-full text-xs text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-gray-100 file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-gray-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              veya isimleri yapıştırın
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onBlur={() => textInput.trim() && loadFromText(textInput)}
              disabled={running}
              rows={2}
              placeholder={'XYZ Teknoloji A.Ş.\nABC Ticaret Ltd.'}
              className="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-gray-200 outline-none text-gray-700 focus:border-[#e94560]/50"
            />
          </div>
        </div>

        {rows.length > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={startBatch}
              disabled={running}
              className="bg-[#e94560] hover:bg-[#c73652] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {running ? `Taranıyor... (${tamamlanan}/${rows.length})` : `Taramayı Başlat (${rows.length})`}
            </button>
            <button
              onClick={reset}
              disabled={running}
              className="text-xs text-gray-500 hover:text-[#e94560] disabled:opacity-40"
            >
              Listeyi Temizle
            </button>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <span className="flex-1 text-sm text-gray-700 truncate">{row.ad}</span>

              {row.durum === 'bekliyor' && <span className="text-xs text-gray-400">Bekliyor</span>}
              {row.durum === 'taranıyor' && (
                <span className="text-xs text-blue-600 flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  Taranıyor
                </span>
              )}
              {row.durum === 'hata' && (
                <span className="text-xs text-red-600" title={row.hata}>Hata</span>
              )}
              {row.durum === 'tamamlandı' && row.sonuc && (
                <>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${SEVERITY_BADGE[row.sonuc.risk_seviyesi]}`}>
                    {row.sonuc.risk_skoru}/100
                  </span>
                  {row.sonuc.id && (
                    <Link
                      href={`/company/${row.sonuc.id}`}
                      className="text-xs font-semibold text-[#e94560] hover:underline whitespace-nowrap"
                    >
                      Rapora Git →
                    </Link>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
