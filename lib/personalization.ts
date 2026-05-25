import type { Insight, Role, ScoredInsight, ThemeMatrixRow } from './types'

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

function calcRelevanceScore(insight: Insight, role: Role): number {
  const overlap = insight.themes.filter((t) => role.tags.includes(t)).length
  if (overlap >= 2) return 9
  if (overlap === 1) return 6
  return 4
}

function calcActionScore(insight: Insight): number {
  const base = insight.horizon === 'now' ? 9 : insight.horizon === 'near' ? 6 : 3
  const modifier =
    insight.type === 'tool' || insight.type === 'practice'
      ? 1
      : insight.type === 'provocation'
        ? -1
        : 0
  return Math.min(10, Math.max(1, base + modifier))
}

export function selectInsightsForRole(role: Role, insights: Insight[]): ScoredInsight[] {
  const tagMatched = insights.filter((i) => i.themes.some((t) => role.tags.includes(t)))
  const tagMatchedIds = new Set(tagMatched.map((i) => i.id))

  // Always include one of each special type if not already in the set
  const extras: Insight[] = []
  const types = ['risk', 'provocation', 'trend'] as const
  for (const type of types) {
    const candidate = insights.find((i) => i.type === type && !tagMatchedIds.has(i.id))
    if (candidate) extras.push(candidate)
  }

  const pool = [...tagMatched, ...extras]
  const unique = Array.from(new Map(pool.map((i) => [i.id, i])).values())

  const scored = unique.map((insight): ScoredInsight => ({
    ...insight,
    perspective: {
      why_relevant: '',
      core_idea: '',
      why_it_matters: '',
      team_question: '',
      next_step: '',
      relevance_score: calcRelevanceScore(insight, role),
      action_score: calcActionScore(insight),
    },
  }))

  scored.sort((a, b) => {
    const scoreA = (a.perspective.relevance_score + a.perspective.action_score) / 2
    const scoreB = (b.perspective.relevance_score + b.perspective.action_score) / 2
    return scoreB - scoreA
  })

  return scored.slice(0, 8)
}

export function getSignals(insights: ScoredInsight[]): ScoredInsight[] {
  return insights.filter((i) => i.type === 'trend' && i.horizon === 'near')
}

export function getRisks(insights: ScoredInsight[]): ScoredInsight[] {
  return insights.filter((i) => i.type === 'risk' && i.horizon === 'now')
}

export function getProvocations(insights: ScoredInsight[]): ScoredInsight[] {
  return insights.filter((i) => i.type === 'provocation')
}

export function getTools(insights: ScoredInsight[]): ScoredInsight[] {
  return insights.filter((i) => i.type === 'tool' || i.type === 'practice')
}

export function buildThemeMatrix(insights: ScoredInsight[]): ThemeMatrixRow[] {
  return THEMES.map((theme) => {
    const themed = insights.filter((i) => i.themes.includes(theme))
    return {
      theme,
      now: themed.filter((i) => i.horizon === 'now').length,
      near: themed.filter((i) => i.horizon === 'near').length,
      long: themed.filter((i) => i.horizon === 'long').length,
    }
  })
}
