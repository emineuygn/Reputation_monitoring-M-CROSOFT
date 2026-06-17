'use client'

import { useState } from 'react'
import { exportPdf } from '@/lib/api'

interface Props {
  reportId: number
}

export default function ExportPdfButton({ reportId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      await exportPdf(reportId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF indirilemedi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 bg-[#16213e] hover:bg-[#1a2a50] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {loading ? 'Hazırlanıyor...' : 'PDF İndir'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
