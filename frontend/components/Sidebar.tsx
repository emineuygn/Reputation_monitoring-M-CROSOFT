'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getStoredUser, clearAuth, AuthUser } from '@/lib/auth'

const NAV_ITEMS = [
  { href: '/', label: 'Ana Sayfa', icon: '🔍' },
  { href: '/toplu-sorgu', label: 'Toplu Sorgu', icon: '📋' },
  { href: '/history', label: 'Geçmiş', icon: '🕘' },
]

const AUTH_PAGES = ['/login', '/register']

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [pathname])

  if (AUTH_PAGES.includes(pathname)) return null

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${active
                ? 'bg-[#e94560] text-white'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const UserFooter = () => (
    <div className="px-5 py-4 border-t border-white/10">
      {user && (
        <p className="text-xs text-gray-300 truncate mb-2">
          {user.ad_soyad || user.email}
        </p>
      )}
      <button
        onClick={handleLogout}
        className="text-xs text-gray-400 hover:text-[#e94560] transition-colors"
      >
        Çıkış Yap
      </button>
    </div>
  )

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-[#16213e] text-white px-4 py-3 shadow-md">
        <span className="text-lg font-bold text-[#e94560] tracking-tight">İtibar Tespit</span>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Menüyü aç/kapat"
        >
          <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </header>

      {mobileOpen && (
        <div className="md:hidden bg-[#16213e] pb-4 border-t border-white/10">
          <NavLinks />
          <UserFooter />
        </div>
      )}

      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:h-screen md:sticky md:top-0 bg-[#16213e] text-white">
        <div className="px-5 py-6">
          <span className="text-xl font-bold text-[#e94560] tracking-tight">İtibar Tespit</span>
          <p className="text-[11px] text-gray-400 mt-1">Risk &amp; İtibar Analizi</p>
        </div>
        <NavLinks />
        <div className="mt-auto">
          <UserFooter />
          <div className="px-5 py-3 text-[11px] text-gray-500 border-t border-white/10">
            © {new Date().getFullYear()} İtibar Tespit
          </div>
        </div>
      </aside>
    </>
  )
}
