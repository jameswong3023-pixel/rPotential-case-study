const SECTIONS: [string, string][] = [
  ['board', 'Board'],
  ['enterprise', 'Enterprise'],
  ['department', 'Departmental'],
  ['function', 'Functional'],
  ['role', 'Role'],
]

const ARCHETYPES = ['capacity', 'growth', 'risk']

export type Filters = {
  department: string
  section: string
  archetype: string
  hideReviewed: boolean
}

export const EMPTY_FILTERS: Filters = {
  department: '',
  section: '',
  archetype: '',
  hideReviewed: false,
}

const selectClass =
  'rounded-md border border-border bg-background px-2 py-1.5 text-sm'

export function FilterBar({
  departments,
  filters,
  onChange,
}: {
  departments: string[]
  filters: Filters
  onChange: (filters: Filters) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.department}
        onChange={(e) => onChange({ ...filters, department: e.target.value })}
        className={selectClass}
      >
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={filters.section}
        onChange={(e) => onChange({ ...filters, section: e.target.value })}
        className={selectClass}
      >
        <option value="">All levels</option>
        {SECTIONS.map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={filters.archetype}
        onChange={(e) => onChange({ ...filters, archetype: e.target.value })}
        className={selectClass}
      >
        <option value="">All archetypes</option>
        {ARCHETYPES.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={filters.hideReviewed}
          onChange={(e) =>
            onChange({ ...filters, hideReviewed: e.target.checked })
          }
        />
        Hide reviewed
      </label>
    </div>
  )
}
