const HORIZON_CONFIG = {
  now: { label: 'Nu', className: 'bg-green-100 text-green-800' },
  near: { label: 'Nabij', className: 'bg-amber-100 text-amber-800' },
  long: { label: 'Lang', className: 'bg-gray-100 text-gray-600' },
}

export default function HorizonBadge({ horizon }: { horizon: keyof typeof HORIZON_CONFIG }) {
  const { label, className } = HORIZON_CONFIG[horizon] ?? HORIZON_CONFIG.now
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
