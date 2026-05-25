// Generates briefings WITHOUT the Anthropic API — uses rule-based scoring only.
// Run: node scripts/generate-placeholder-briefings.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA = join(ROOT, 'data')
const BRIEFINGS = join(DATA, 'briefings')

const insightsData = JSON.parse(readFileSync(join(DATA, 'insights.json'), 'utf-8'))
const allInsights = insightsData.insights
const allRoles = JSON.parse(readFileSync(join(DATA, 'roles.json'), 'utf-8'))

const THEMES = [
  'AI Adoptie & Tools', 'Toekomst van Werk & Vaardigheden',
  'Onderwijsinnovatie & Didactiek', 'Organisatieverandering & Leiderschap',
  'Betrokkenheid & Mensgerichtheid', 'Platform & Infrastructuur',
  'Privacy, Ethiek & Verantwoorde AI', 'Samenwerking & Kennisdeling',
]

function calcRelevanceScore(insight, role) {
  const overlap = insight.themes.filter(t => role.tags.includes(t)).length
  if (overlap >= 2) return 9
  if (overlap === 1) return 6
  return 4
}

function calcActionScore(insight) {
  const base = insight.horizon === 'now' ? 9 : insight.horizon === 'near' ? 6 : 3
  const mod = (insight.type === 'tool' || insight.type === 'practice') ? 1
    : insight.type === 'provocation' ? -1 : 0
  return Math.min(10, Math.max(1, base + mod))
}

function selectInsights(role, insights) {
  const tagMatched = insights.filter(i => i.themes.some(t => role.tags.includes(t)))
  const tagIds = new Set(tagMatched.map(i => i.id))
  const extras = []
  for (const type of ['risk', 'provocation', 'trend']) {
    const c = insights.find(i => i.type === type && !tagIds.has(i.id))
    if (c) extras.push(c)
  }
  const pool = [...tagMatched, ...extras]
  const unique = Array.from(new Map(pool.map(i => [i.id, i])).values())
  return unique
    .map(i => ({
      ...i,
      perspective: {
        why_relevant: `Dit inzicht raakt direct aan de kerntaken van een ${role.title}: ${i.themes.filter(t => role.tags.includes(t)).join(' en ') || i.themes[0]}.`,
        core_idea: i.summary.split('.')[0] + '.',
        why_it_matters: `Instellingen die hier niets mee doen lopen achter op sectorontwikkelingen rond ${i.themes[0]}.`,
        team_question: `Hoe zorgen wij als ${role.title} dat we dit inzicht concreet vertalen naar ons werk?`,
        next_step: `Plan binnen 2 weken een verkenningsgesprek over "${i.title}" met je directe team.`,
        relevance_score: calcRelevanceScore(i, role),
        action_score: calcActionScore(i),
      }
    }))
    .sort((a, b) => {
      const sa = (a.perspective.relevance_score + a.perspective.action_score) / 2
      const sb = (b.perspective.relevance_score + b.perspective.action_score) / 2
      return sb - sa
    })
    .slice(0, 8)
}

function buildThemeMatrix(insights) {
  return THEMES.map(theme => {
    const t = insights.filter(i => i.themes.includes(theme))
    return { theme, now: t.filter(i => i.horizon === 'now').length, near: t.filter(i => i.horizon === 'near').length, long: t.filter(i => i.horizon === 'long').length }
  })
}

if (!existsSync(BRIEFINGS)) mkdirSync(BRIEFINGS, { recursive: true })

for (const role of allRoles) {
  const top = selectInsights(role, allInsights)
  const briefing = {
    roleId: role.id,
    generatedAt: new Date().toISOString(),
    topInsights: top,
    signals: top.filter(i => i.type === 'trend' && i.horizon === 'near'),
    risks: top.filter(i => i.type === 'risk'),
    provocations: top.filter(i => i.type === 'provocation'),
    tools: top.filter(i => i.type === 'tool' || i.type === 'practice'),
    themeMatrix: buildThemeMatrix(top),
    topTeamQuestions: top.slice(0, 3).map(i => i.perspective.team_question),
  }
  writeFileSync(join(BRIEFINGS, `${role.id}.json`), JSON.stringify(briefing, null, 2))
  console.log(`✅ ${role.emoji} ${role.title} — ${top.length} inzichten`)
}

console.log('\n🎉 Placeholder briefings klaar! Run npm run generate-briefings voor AI-gegenereerde teksten.')
