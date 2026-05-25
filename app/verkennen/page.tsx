'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import insightsData from '@/data/insights.json'
import rolesData from '@/data/roles.json'
import type { Insight, Role } from '@/lib/types'
import TypeBadge from '@/components/TypeBadge'
import HorizonBadge from '@/components/HorizonBadge'
import ThemeChip from '@/components/ThemeChip'

const insights = (insightsData as { insights: Insight[] }).insights
const roles = rolesData as Role[]

const THEMES = [
  'AI Adoptie & Tools',
  'Toekomst van Werk & Vaardigheden',
  'Onderwijsinnovatie & Didactiek',
  'Organisatieverandering & Leiderschap',
  'Betrokkenheid & Mensgerichtheid',
  'Platform & Infrastructuur',
  'Privacy, Ethiek & Verantwoorde AI',
  'Samenwerking & Kennisdeling',
]

const TYPES = ['tool', 'risk', 'trend', 'practice', 'provocation'] as const
const HORIZONS = ['now', 'near', 'long'] as const

export default function VerkennenPage() {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedHorizon, setSelectedHorizon] = useState<string>('all')
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  function toggleTheme(theme: string) {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    )
  }

  const filtered = useMemo(() => {
    return insights.filter((i) => {
      if (query && !i.title.toLowerCase().includes(query.toLowerCase())) return false
      if (selectedType !== 'all' && i.type !== selectedType) return false
      if (selectedHorizon !== 'all' && i.horizon !== selectedHorizon) return false
      if (selectedThemes.length > 0 && !selectedThemes.some((t) => i.themes.includes(t)))
        return false
      return true
    })
  }, [query, selectedType, selectedHorizon, selectedThemes])

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FFFAF5' }}>
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg" style={{ color: '#E87722' }}>
            ← Npuls Compass
          </Link>
          <span className="text-sm text-gray-500">Alle inzichten</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Alle 25 Npuls-kennisproducten</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Zoek op titel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedType === 'all'
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              Alle types
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(selectedType === t ? 'all' : t)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  selectedType === t
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {t === 'tool' ? 'Tool' : t === 'risk' ? 'Risico' : t === 'trend' ? 'Trend' : t === 'practice' ? 'Aanpak' : 'Provocatie'}
              </button>
            ))}
          </div>

          {/* Horizon filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedHorizon('all')}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedHorizon === 'all'
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              Alle horizonten
            </button>
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(selectedHorizon === h ? 'all' : h)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  selectedHorizon === h
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {h === 'now' ? 'Nu' : h === 'near' ? 'Nabij' : 'Lang'}
              </button>
            ))}
          </div>

          {/* Theme filter */}
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
              <button key={theme} onClick={() => toggleTheme(theme)}>
                <ThemeChip theme={theme} selected={selectedThemes.includes(theme)} />
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} van de {insights.length} inzichten
        </p>

        {/* Results */}
        <div className="space-y-2">
          {filtered.map((insight) => (
            <div
              key={insight.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    <TypeBadge type={insight.type} />
                    <HorizonBadge horizon={insight.horizon} />
                    {insight.themes.slice(0, 2).map((t) => (
                      <ThemeChip key={t} theme={t} selected={selectedThemes.includes(t)} />
                    ))}
                  </div>
                  <p className="font-semibold text-gray-900 mb-0.5">{insight.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{insight.summary}</p>
                  <p className="text-xs text-gray-400 mt-1">{insight.source.session_title}</p>
                </div>

                {/* Role dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === insight.id ? null : insight.id)
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50 transition-colors whitespace-nowrap"
                  >
                    Bekijk in briefing ▾
                  </button>
                  {openDropdown === insight.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-48 py-1">
                      {roles.map((role) => (
                        <Link
                          key={role.id}
                          href={`/briefing/${role.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span>{role.emoji}</span>
                          <span>{role.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
