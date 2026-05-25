const TYPE_CONFIG = {
  tool: { label: 'Tool', className: 'bg-blue-100 text-blue-800' },
  risk: { label: 'Risico', className: 'bg-red-100 text-red-800' },
  trend: { label: 'Trend', className: 'bg-green-100 text-green-800' },
  practice: { label: 'Aanpak', className: 'bg-purple-100 text-purple-800' },
  provocation: { label: 'Provocatie', className: 'bg-orange-100 text-orange-800' },
}

export default function TypeBadge({ type }: { type: keyof typeof TYPE_CONFIG }) {
  const { label, className } = TYPE_CONFIG[type] ?? TYPE_CONFIG.tool
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
