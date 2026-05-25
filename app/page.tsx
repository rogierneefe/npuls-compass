import Link from 'next/link'
import rolesData from '@/data/roles.json'
import type { Role } from '@/lib/types'

const roles = rolesData as Role[]

const ROLE_GRADIENTS = [
  'from-blue-50 to-indigo-50',
  'from-emerald-50 to-teal-50',
  'from-amber-50 to-yellow-50',
  'from-violet-50 to-purple-50',
  'from-sky-50 to-cyan-50',
  'from-rose-50 to-pink-50',
  'from-lime-50 to-green-50',
  'from-orange-50 to-amber-50',
]

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FFFAF5' }}>
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: '#E87722' }}>
            Npuls Compass
          </span>
          <Link
            href="/verkennen"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Bekijk alle inzichten →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: '#FFF3E8', color: '#E87722' }}
        >
          25 kennisproducten · 8 rollen · Npuls.nl · Mei 2026
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Wat betekent de Npuls-agenda
          <br />
          <span style={{ color: '#E87722' }}>voor jouw werk?</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Geen nieuwsbrief. Een gepersonaliseerde redactionele gids — gecureerde inzichten
          gekoppeld aan jouw rol in het onderwijs.
        </p>
      </section>

      {/* Role picker */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Kies jouw perspectief
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role, idx) => (
            <Link
              key={role.id}
              href={`/briefing/${role.id}`}
              className={`block p-5 rounded-xl border border-transparent bg-gradient-to-br ${ROLE_GRADIENTS[idx % ROLE_GRADIENTS.length]} hover:border-orange-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <div className="text-3xl mb-2">{role.emoji}</div>
              <div className="font-semibold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">
                {role.title}
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{role.description}</p>
              <div className="flex flex-wrap gap-1">
                {role.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/70 text-gray-600 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <p>
          Npuls Compass · Gebaseerd op{' '}
          <a
            href="https://npuls.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            npuls.nl
          </a>{' '}
          · 2026
        </p>
        <p className="mt-1">
          <Link href="/verkennen" className="underline hover:text-gray-600">
            Bekijk alle 25 inzichten →
          </Link>
        </p>
      </footer>
    </main>
  )
}
