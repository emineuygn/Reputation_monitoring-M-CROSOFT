import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'İtibar Tespit',
  description: 'Firma itibar ve risk analizi platformu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="md:flex">
        <Sidebar />
        <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 py-8 md:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
