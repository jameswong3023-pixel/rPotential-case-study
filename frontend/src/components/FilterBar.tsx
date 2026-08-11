const PRIORITIES = ['cost', 'revenue', 'speed', 'risk', 'capability', 'people']

const SCOPES = [
  'IT',
  'Supply Chain',
  'Finance',
  'Quality',
  'Marketing',
  'Customer Care',
]

const RANK_MODES = ['readiness', 'value']

export function FilterBar({
  priorities,
  scope,
  rankBy,
  onPrioritiesChange,
  onScopeChange,
  onRankByChange,
}: {
  priorities: string[]
  scope: string
  rankBy: string
  onPrioritiesChange: (value: string[]) => void
  onScopeChange: (value: string) => void
  onRankByChange: (value: string) => void
}) {
  const togglePriority = (p: string) => {
    if (priorities.includes(p)) {
      onPrioritiesChange(priorities.filter((x) => x !== p))
    } else if (priorities.length < 3) {
      onPrioritiesChange([...priorities, p])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
        <span className="text-xs text-muted-foreground">Priorities</span>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            onClick={() => togglePriority(p)}
            className={
              priorities.includes(p)
                ? 'rounded bg-indigo-600 px-2 py-1 text-xs text-white'
                : 'rounded px-2 py-1 text-xs text-muted-foreground hover:bg-indigo-50'
            }
          >
            {p}
          </button>
        ))}
      </div>
      <select
        value={scope}
        onChange={(e) => onScopeChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">All scopes</option>
        {SCOPES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={rankBy}
        onChange={(e) => onRankByChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        {RANK_MODES.map((m) => (
          <option key={m} value={m}>
            Ranked by {m}
          </option>
        ))}
      </select>
    </div>
  )
}
