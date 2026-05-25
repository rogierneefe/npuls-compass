'use client'

import { useState } from 'react'
import type { ScoredInsight } from '@/lib/types'
import TypeBadge from '@/components/TypeBadge'
import HorizonBadge from '@/components/HorizonBadge'
import ScoreBar from '@/components/ScoreBar'

export default function InsightList({
  insights,
  roleTitle,
}: {
  insights: ScoredInsight[]
  roleTitle: string
}) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ol className="space-y-3">
      {insights.map((insight, idx) => {
        const isOpen = openId === insight.id
        return (
          <li key={insight.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header row — always visible */}
            <button
              className="w-full text-left p-4 flex items-start gap-4 group"
              onClick={() => setOpenId(isOpen ? null : insight.id)}
            >
              <span className="text-3xl font-bold text-gray-100 leading-none shrink-0 w-8 text-right">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  <TypeBadge type={insight.type} />
                  <HorizonBadge horizon={insight.horizon} />
                </div>
                <p className="font-semibold text-gray-900 leading-snug mb-1">{insight.title}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{insight.summary}</p>
                <div className="mt-2 space-y-1">
                  <ScoreBar label="Relevantie" score={insight.perspective.relevance_score} />
                  <ScoreBar label="Actie" score={insight.perspective.action_score} />
                </div>
              </div>
              <span className="shrink-0 text-gray-300 group-hover:text-gray-500 transition-transform duration-200 mt-1"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                ▼
              </span>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-4 pb-5 space-y-3 border-t border-gray-50">
                {insight.perspective.why_relevant && (
                  <div
                    className="mt-3 rounded-lg p-3"
                    style={{ backgroundColor: '#FFF3E8' }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: '#C5621A' }}>
                      Waarom relevant voor jou als {roleTitle}
                    </p>
                    <p className="text-sm text-gray-700">{insight.perspective.why_relevant}</p>
                  </div>
                )}

                {insight.perspective.core_idea && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-0.5">Kernidee</p>
                    <p className="text-sm text-gray-700">{insight.perspective.core_idea}</p>
                  </div>
                )}

                {insight.perspective.why_it_matters && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-0.5">Waarom het ertoe doet</p>
                    <p className="text-sm text-gray-700">{insight.perspective.why_it_matters}</p>
                  </div>
                )}

                {insight.perspective.team_question && (
                  <div className="bg-yellow-50 rounded-lg p-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-yellow-700 mb-0.5">Gespreksvraag voor je team</p>
                      <p className="text-sm text-gray-800">{insight.perspective.team_question}</p>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await navigator.clipboard.writeText(insight.perspective.team_question)
                      }}
                      className="text-xs px-2 py-1 rounded border border-yellow-200 text-yellow-700 hover:bg-yellow-100 shrink-0"
                    >
                      Kopieer
                    </button>
                  </div>
                )}

                {insight.perspective.next_step && (
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: '#FFF3E8' }}
                  >
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#C5621A' }}>
                      Volgende stap
                    </p>
                    <p className="text-sm text-gray-800">{insight.perspective.next_step}</p>
                  </div>
                )}

                <div className="text-xs text-gray-400 pt-1 space-y-0.5">
                  <p>
                    Bron: {insight.source.session_title} · {insight.source.speaker} ·{' '}
                    {insight.source.date}
                  </p>
                  {insight.external_source && (
                    <p>
                      <a
                        href={`https://${insight.external_source}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Meer info →
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
