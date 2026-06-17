import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'İtibar Tespit',
  description: 'Firma itibar ve risk analizi platformu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <header className="bg-[#16213e] text-white shadow-md">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-[#e94560] tracking-tight hover:opacity-80">
              İtibar Tespit
            </Link>
            <Link href="/" className="text-sm hover:text-[#e94560] transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/history" className="text-sm hover:text-[#e94560] transition-colors">
              Geçmiş
            </Link>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
