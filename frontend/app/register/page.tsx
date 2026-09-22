'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/api'
import { getToken } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [adSoyad, setAdSoyad] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (getToken()) router.replace('/')
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(email.trim(), password, adSoyad.trim())
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#16213e]">Kayıt Ol</h1>
        <p className="text-gray-500 text-sm mt-1">Yeni bir İtibar Tespit hesabı oluşturun</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ad Soyad</label>
          <input
            type="text"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none text-gray-700 focus:border-[#e94560]/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none text-gray-700 focus:border-[#e94560]/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Şifre</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none text-gray-700 focus:border-[#e94560]/50"
          />
          <p className="text-[11px] text-gray-400 mt-1">En az 8 karakter</p>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#e94560] hover:bg-[#c73652] disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-[#e94560] font-semibold hover:underline">
            Giriş yapın
          </Link>
        </p>
      </form>
    </div>
  )
}
