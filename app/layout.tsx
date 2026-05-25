import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Npuls Compass — Gepersonaliseerde inzichten voor onderwijsprofessionals',
  description:
    '25 kennisproducten van npuls.nl, gepersonaliseerd op jouw rol in het onderwijs.',
  openGraph: {
    title: 'Npuls Compass',
    description:
      '25 kennisproducten van npuls.nl, gepersonaliseerd op jouw rol in het onderwijs.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen" style={{ backgroundColor: '#FFFAF5' }}>
        {children}
      </body>
    </html>
  )
}
