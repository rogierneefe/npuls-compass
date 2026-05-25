export default function ThemeChip({
  theme,
  selected = false,
}: {
  theme: string
  selected?: boolean
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
        selected
          ? 'bg-orange-100 text-orange-800 border-orange-300'
          : 'bg-gray-100 text-gray-600 border-gray-200'
      }`}
    >
      {theme}
    </span>
  )
}
