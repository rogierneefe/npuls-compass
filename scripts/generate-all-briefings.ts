import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import type { Insight, Role, ScoredInsight, Briefing, RolePerspective } from '../lib/types'
import {
  selectInsightsForRole,
  getSignals,
  getRisks,
  getProvocations,
  getTools,
  buildThemeMatrix,
} from '../lib/personalization'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DATA_DIR = path.join(process.cwd(), 'data')
const BRIEFINGS_DIR = path.join(DATA_DIR, 'briefings')

const insightsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'insights.json'), 'utf-8'))
const allInsights: Insight[] = insightsData.insights
const allRoles: Role[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'roles.json'), 'utf-8'))

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generatePerspective(
  insight: Insight,
  role: Role,
  baseScores: { relevance_score: number; action_score: number },
): Promise<RolePerspective> {
  const userPrompt = `Rol: ${role.title}
Rol-context: ${role.perspective_prompt}

Inzicht: ${insight.title}
Samenvatting: ${insight.summary}
Type: ${insight.type}
Horizon: ${insight.horizon}
Thema's: ${insight.themes.join(', ')}

Genereer een JSON-object met exact deze velden:
{
  "why_relevant": "1-2 zinnen: waarom is dit inzicht specifiek relevant voor deze rol?",
  "core_idea": "1 zin: de essentie van het inzicht in eigen woorden",
  "why_it_matters": "1-2 zinnen: wat is de consequentie als de instelling hier niets mee doet?",
  "team_question": "1 concrete vraag die je morgen in je teamoverleg kunt stellen",
  "next_step": "1 concrete actie die deze rol binnen 2 weken kan nemen",
  "relevance_score": ${baseScores.relevance_score},
  "action_score": ${baseScores.action_score}
}

Geef ALLEEN het JSON-object terug, geen andere tekst.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system:
      'Je bent een redactioneel assistent die Npuls-kennisproducten personaliseert voor specifieke onderwijsprofessionals. Antwoord altijd in het Nederlands. Wees concreet, direct en bruikbaar — geen managementtaal.',
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract JSON from response (strip possible markdown code block)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`No JSON found in response for ${insight.id}/${role.id}`)

  const parsed = JSON.parse(jsonMatch[0]) as RolePerspective
  return parsed
}

async function generateBriefingForRole(role: Role): Promise<void> {
  console.log(`\n📋 Genereer briefing voor: ${role.emoji} ${role.title}`)

  const topInsights = selectInsightsForRole(role, allInsights)

  const enrichedInsights: ScoredInsight[] = []
  for (let i = 0; i < topInsights.length; i++) {
    const insight = topInsights[i]
    console.log(`  [${i + 1}/${topInsights.length}] ${insight.title}`)

    const perspective = await generatePerspective(insight, role, {
      relevance_score: insight.perspective.relevance_score,
      action_score: insight.perspective.action_score,
    })

    enrichedInsights.push({ ...insight, perspective })
    await sleep(1000)
  }

  // Build all sections from enrichedInsights pool
  // For signals/risks/provocations/tools we also check in the full insights set scored for this role
  const allScored = selectInsightsForRole(role, allInsights)

  const briefing: Briefing = {
    roleId: role.id,
    generatedAt: new Date().toISOString(),
    topInsights: enrichedInsights,
    signals: enrichedInsights.filter((i) => i.type === 'trend' && i.horizon === 'near'),
    risks: enrichedInsights.filter((i) => i.type === 'risk'),
    provocations: enrichedInsights.filter((i) => i.type === 'provocation'),
    tools: enrichedInsights.filter((i) => i.type === 'tool' || i.type === 'practice'),
    themeMatrix: buildThemeMatrix(enrichedInsights),
    topTeamQuestions: enrichedInsights
      .slice(0, 3)
      .map((i) => i.perspective.team_question)
      .filter(Boolean),
  }

  const outPath = path.join(BRIEFINGS_DIR, `${role.id}.json`)
  fs.writeFileSync(outPath, JSON.stringify(briefing, null, 2), 'utf-8')
  console.log(`  ✅ Opgeslagen: ${outPath}`)
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Geen ANTHROPIC_API_KEY gevonden in environment variabelen.')
    console.error('Voeg toe: export ANTHROPIC_API_KEY=sk-ant-...')
    process.exit(1)
  }

  if (!fs.existsSync(BRIEFINGS_DIR)) {
    fs.mkdirSync(BRIEFINGS_DIR, { recursive: true })
  }

  console.log(`🚀 Start generatie van ${allRoles.length} briefings...`)
  console.log(`📊 Dataset: ${allInsights.length} inzichten\n`)

  for (const role of allRoles) {
    await generateBriefingForRole(role)
  }

  console.log('\n🎉 Alle briefings gegenereerd!')
  console.log(`📁 Bestanden in: ${BRIEFINGS_DIR}`)

  const files = fs.readdirSync(BRIEFINGS_DIR)
  console.log(`\n📋 Overzicht (${files.length} bestanden):`)
  for (const file of files) {
    const data: Briefing = JSON.parse(
      fs.readFileSync(path.join(BRIEFINGS_DIR, file), 'utf-8'),
    )
    console.log(
      `  ${file}: ${data.topInsights.length} inzichten (${data.signals.length} signals, ${data.risks.length} risks, ${data.provocations.length} provocations)`,
    )
  }
}

main().catch((err) => {
  console.error('❌ Fout:', err)
  process.exit(1)
})
