const RANK_MODES = ['readiness', 'value']

export function FilterBar({
  departments,
  scope,
  rankBy,
  onScopeChange,
  onRankByChange,
}: {
  departments: string[]
  scope: string
  rankBy: string
  onScopeChange: (value: string) => void
  onRankByChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={scope}
        onChange={(e) => onScopeChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
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
