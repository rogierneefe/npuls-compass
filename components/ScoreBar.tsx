export default function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 10) * 100)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: '#E87722' }}
        />
      </div>
      <span className="text-gray-700 font-medium w-8">{score}/10</span>
    </div>
  )
}
