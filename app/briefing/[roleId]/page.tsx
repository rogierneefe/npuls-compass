import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import type { Briefing, Role } from '@/lib/types'
import InsightList from './InsightList'
import TypeBadge from '@/components/TypeBadge'
import HorizonBadge from '@/components/HorizonBadge'
import CopyButton from '@/components/CopyButton'

function loadBriefing(roleId: string): Briefing | null {
  const filePath = path.join(process.cwd(), 'data', 'briefings', `${roleId}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function loadRoles(): Role[] {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'roles.json'), 'utf-8'),
  )
}

export async function generateStaticParams() {
  const roles = loadRoles()
  return roles.map((r) => ({ roleId: r.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params
  const roles = loadRoles()
  const role = roles.find((r) => r.id === roleId)
  if (!role) return {}
  return {
    title: `${role.emoji} ${role.title} — Npuls Compass`,
    description: `Gepersonaliseerde Npuls-briefing voor ${role.title}: de meest relevante kennisproducten van npuls.nl.`,
  }
}

const MATRIX_CELL_COLOR = (count: number) => {
  if (count === 0) return 'bg-gray-50 text-gray-300'
  if (count <= 2) return 'bg-orange-100 text-orange-700'
  return 'bg-orange-400 text-white font-bold'
}

export default async function BriefingPage({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  const { roleId } = await params
  const briefing = loadBriefing(roleId)
  const roles = loadRoles()
  const currentRole = roles.find((r) => r.id === roleId)

  if (!briefing || !currentRole) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFAF5' }}>
        <div className="text-center">
          <p className="text-2xl mb-2">🔍</p>
          <h1 className="text-xl font-semibold mb-4">Briefing niet gevonden</h1>
          <p className="text-gray-500 mb-6">
            De briefing voor &quot;{roleId}&quot; is nog niet gegenereerd.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#E87722' }}
          >
            ← Kies een andere rol
          </Link>
        </div>
      </main>
    )
  }

  const otherRoles = roles.filter((r) => r.id !== roleId)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FFFAF5' }}>
      {/* Sticky nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 no-print">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Terug
          </Link>
          <span className="text-sm font-semibold text-gray-700">
            {currentRole.emoji} {currentRole.title}
          </span>
          <span className="text-xs text-gray-400">Npuls Compass</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">
        {/* SECTIE 0: HEADER */}
        <section className="text-center">
          <div className="text-6xl mb-3">{currentRole.emoji}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{currentRole.title}</h1>
          <p className="text-lg text-gray-500 mb-2">Jouw gepersonaliseerde Npuls-briefing</p>
          <p className="text-xs text-gray-400">
            Gebaseerd op 25 kennisproducten van npuls.nl · Gegenereerd mei 2026
          </p>
        </section>

        {/* SECTIE 1: TOP INZICHTEN */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            De {briefing.topInsights.length} belangrijkste inzichten voor jou
          </h2>
          <InsightList insights={briefing.topInsights} roleTitle={currentRole.title} />
        </section>

        {/* SECTIE 2: RADAR */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Radar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signalen */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Signalen om te volgen
              </h3>
              <div className="space-y-3">
                {briefing.signals.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Geen trending signalen in jouw top-selectie</p>
                )}
                {briefing.signals.map((s) => (
                  <div key={s.id} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <div className="flex gap-2 mb-1">
                      <TypeBadge type={s.type} />
                      <HorizonBadge horizon={s.horizon} />
                    </div>
                    <p className="font-medium text-sm text-gray-800">{s.title}</p>
                    {s.perspective.why_it_matters && (
                      <p className="text-xs text-gray-500 mt-1">{s.perspective.why_it_matters}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Risico's */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Risico&apos;s om serieus te nemen
              </h3>
              <div className="space-y-3">
                {briefing.risks.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Geen directe risico&apos;s in jouw top-selectie</p>
                )}
                {briefing.risks.map((r) => (
                  <div
                    key={r.id}
                    className="bg-red-50 rounded-lg p-4 border border-red-100 shadow-sm"
                  >
                    <div className="flex gap-2 mb-1">
                      <TypeBadge type={r.type} />
                      <HorizonBadge horizon={r.horizon} />
                    </div>
                    <p className="font-medium text-sm text-gray-800">{r.title}</p>
                    {r.perspective.why_it_matters && (
                      <p className="text-xs text-gray-500 mt-1">{r.perspective.why_it_matters}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTIE 3: PROVOCATIES */}
        {briefing.provocations.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ideeën die het frame uitdagen
            </h2>
            <div className="space-y-4">
              {briefing.provocations.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl p-5 border-l-4 shadow-sm"
                  style={{ borderLeftColor: '#E87722' }}
                >
                  <p className="font-semibold text-gray-900 mb-1">{p.title}</p>
                  {p.perspective.core_idea && (
                    <p className="text-sm text-gray-600 mb-2">{p.perspective.core_idea}</p>
                  )}
                  {p.perspective.team_question && (
                    <p className="text-sm text-gray-500 italic">
                      &ldquo;{p.perspective.team_question}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTIE 4: DIRECT AAN DE SLAG */}
        {briefing.tools.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Direct aan de slag</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {briefing.tools.map((t) => (
                <div key={t.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex gap-2 mb-2">
                    <TypeBadge type={t.type} />
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">{t.title}</p>
                  {t.perspective.next_step && (
                    <p
                      className="text-sm font-medium px-3 py-2 rounded-lg mb-3"
                      style={{ backgroundColor: '#FFF3E8', color: '#C5621A' }}
                    >
                      → {t.perspective.next_step}
                    </p>
                  )}
                  {t.external_source && (
                    <a
                      href={`https://${t.external_source}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Meer info →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTIE 5: THEMALANDSCHAP */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Themalandschap voor jouw rol</h2>
          <p className="text-sm text-gray-500 mb-4">
            Verdeling van jouw inzichten over thema&apos;s en tijdshorizonnen
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-2 pr-4 font-medium">Thema</th>
                  <th className="pb-2 px-3 text-center font-medium">Nu</th>
                  <th className="pb-2 px-3 text-center font-medium">Nabij</th>
                  <th className="pb-2 px-3 text-center font-medium">Lang</th>
                </tr>
              </thead>
              <tbody>
                {briefing.themeMatrix.map((row) => (
                  <tr key={row.theme} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-gray-700">{row.theme}</td>
                    {(['now', 'near', 'long'] as const).map((h) => (
                      <td key={h} className="py-2 px-3 text-center">
                        <span
                          className={`inline-block w-7 h-7 rounded text-sm leading-7 ${MATRIX_CELL_COLOR(row[h])}`}
                        >
                          {row[h] > 0 ? row[h] : ''}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Licht oranje = 1-2 inzichten · Donker oranje = 3+ inzichten
          </p>
        </section>

        {/* SECTIE 6: NEEM DIT MEE NAAR JE TEAM */}
        {briefing.topTeamQuestions.length > 0 && (
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#FFF3E8' }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Neem dit mee naar je volgende overleg
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Drie vragen om het gesprek op gang te brengen
            </p>
            <ol className="space-y-4">
              {briefing.topTeamQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: '#E87722' }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-800">{q}</p>
                    <CopyButton text={q} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* SECTIE 7: ANDERE LENS */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Dezelfde signalen, een ander perspectief
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Dezelfde 25 kennisproducten landen anders afhankelijk van je rol.
          </p>
          <div className="flex flex-wrap gap-2">
            {otherRoles.map((role) => (
              <Link
                key={role.id}
                href={`/briefing/${role.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <span>{role.emoji}</span>
                <span>{role.title}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          <p>Npuls Compass · npuls.nl · 2026</p>
          <p className="mt-1">25 kennisproducten · 8 rollen · Bronnen: npuls.nl</p>
        </footer>
      </div>
    </main>
  )
}
