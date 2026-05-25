export interface Insight {
  id: string
  title: string
  summary: string
  type: 'tool' | 'risk' | 'trend' | 'practice' | 'provocation'
  horizon: 'now' | 'near' | 'long'
  source: {
    session_title: string
    speaker: string
    track: string
    date: string
  }
  themes: string[]
  full_text?: string
  external_source?: string
  product_type?: string
}

export interface RolePerspective {
  why_relevant: string
  core_idea: string
  why_it_matters: string
  team_question: string
  next_step: string
  relevance_score: number
  action_score: number
}

export interface ScoredInsight extends Insight {
  perspective: RolePerspective
}

export interface Role {
  id: string
  title: string
  emoji: string
  description: string
  tags: string[]
  perspective_prompt: string
}

export interface Briefing {
  roleId: string
  generatedAt: string
  topInsights: ScoredInsight[]
  signals: ScoredInsight[]
  risks: ScoredInsight[]
  provocations: ScoredInsight[]
  tools: ScoredInsight[]
  themeMatrix: ThemeMatrixRow[]
  topTeamQuestions: string[]
}

export interface ThemeMatrixRow {
  theme: string
  now: number
  near: number
  long: number
}
