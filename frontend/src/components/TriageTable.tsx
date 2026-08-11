import { Link } from 'react-router-dom'
import type { UoP } from '@/lib/types'
import { valueMidpoint } from '@/lib/score'

export type SortKey = 'relevance' | 'value' | 'readiness'
export type Sort = { key: SortKey; desc: boolean }

const SECTION_LABELS: Record<string, string> = {
  board: 'Board',
  enterprise: 'Enterprise',
  department: 'Dept',
  function: 'Function',
  role: 'Role',
}

const IMPACT_SEGMENTS: [keyof UoP, string, string][] = [
  ['impact_nc', 'No change', 'bg-stone-300'],
  ['impact_aug', 'Augmented', 'bg-sky-400'],
  ['impact_tf', 'Transformed', 'bg-violet-400'],
  ['impact_rd', 'Redeployed', 'bg-amber-400'],
]

function ImpactBar({ uop }: { uop: UoP }) {
  if (
    uop.impact_nc == null ||
    uop.impact_aug == null ||
    uop.impact_tf == null ||
    uop.impact_rd == null
  ) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const title = IMPACT_SEGMENTS.map(
    ([key, label]) => `${label} ${uop[key] as number}%`,
  ).join(' · ')
  return (
    <div className="flex h-2 w-20 overflow-hidden rounded-sm" title={title}>
      {IMPACT_SEGMENTS.map(([key, , color]) => (
        <div
          key={key as string}
          className={color}
          style={{ width: `${uop[key] as number}%` }}
        />
      ))}
    </div>
  )
}

function ReadinessCell({ readiness }: { readiness: number | null }) {
  if (readiness == null) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-right tabular-nums">{readiness}</span>
      <div className="h-1.5 w-12 rounded-sm bg-muted">
        <div
          className="h-full rounded-sm bg-accent"
          style={{ width: `${readiness}%` }}
        />
      </div>
    </div>
  )
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSortChange,
  align = 'left',
}: {
  label: string
  sortKey: SortKey
  sort: Sort
  onSortChange: (sort: Sort) => void
  align?: 'left' | 'right'
}) {
  const active = sort.key === sortKey
  return (
    <th
      className={`cursor-pointer select-none px-2 py-2 font-medium ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${active ? 'text-foreground' : ''}`}
      onClick={() =>
        onSortChange({ key: sortKey, desc: active ? !sort.desc : true })
      }
    >
      {label}
      {active && <span className="ml-1">{sort.desc ? '↓' : '↑'}</span>}
    </th>
  )
}

function Row({
  uop,
  rank,
  score,
  onToggleReviewed,
  onToggleShortlisted,
}: {
  uop: UoP
  rank: number | null
  score: number | null
  onToggleReviewed: (id: string) => void
  onToggleShortlisted: (id: string) => void
}) {
  return (
    <tr
      className={`border-b border-border text-sm hover:bg-muted/50 ${
        uop.reviewed ? 'opacity-60' : ''
      }`}
    >
      <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
        {rank ?? ''}
      </td>
      <td className="max-w-md px-2 py-2.5">
        <Link to={`/uops/${uop.id}`} className="font-medium hover:underline">
          {uop.name}
        </Link>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {uop.role ?? '—'}
          {uop.data_flags.length > 0 && (
            <span
              className="ml-1.5 text-amber-600"
              title={uop.data_flags.join('\n')}
            >
              ⚠ data
            </span>
          )}
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-2.5 text-xs text-muted-foreground">
        {uop.department_norm ?? 'Unclassified'}
      </td>
      <td className="whitespace-nowrap px-2 py-2.5 text-xs text-muted-foreground">
        {SECTION_LABELS[uop.section] ?? uop.section}
      </td>
      <td className="whitespace-nowrap px-2 py-2.5 text-xs text-muted-foreground">
        {uop.archetype ?? '—'}
      </td>
      <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">
        {uop.value_band ?? (
          <span className="text-xs text-muted-foreground">strategic</span>
        )}
      </td>
      <td className="px-2 py-2.5">
        <ReadinessCell readiness={uop.readiness} />
      </td>
      <td className="px-2 py-2.5">
        <ImpactBar uop={uop} />
      </td>
      <td className="px-2 py-2.5 text-right font-semibold tabular-nums">
        {score ?? <span className="font-normal text-muted-foreground">—</span>}
      </td>
      <td className="px-2 py-2.5 text-center">
        <button
          onClick={() => onToggleReviewed(uop.id)}
          title={uop.reviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
          className={
            uop.reviewed
              ? 'text-emerald-600'
              : 'text-muted-foreground/40 hover:text-muted-foreground'
          }
        >
          ✓
        </button>
      </td>
      <td className="px-2 py-2.5 text-center">
        <button
          onClick={() => onToggleShortlisted(uop.id)}
          title={
            uop.shortlisted ? 'Remove from shortlist' : 'Add to shortlist'
          }
          className={
            uop.shortlisted
              ? 'text-accent'
              : 'text-muted-foreground/40 hover:text-muted-foreground'
          }
        >
          {uop.shortlisted ? '★' : '☆'}
        </button>
      </td>
    </tr>
  )
}

export function TriageTable({
  scored,
  unscored,
  scores,
  sort,
  onSortChange,
  onToggleReviewed,
  onToggleShortlisted,
}: {
  scored: UoP[]
  unscored: UoP[]
  scores: Map<string, number>
  sort: Sort
  onSortChange: (sort: Sort) => void
  onToggleReviewed: (id: string) => void
  onToggleShortlisted: (id: string) => void
}) {
  const rowProps = { onToggleReviewed, onToggleShortlisted }
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-foreground/60 text-xs uppercase tracking-wider text-muted-foreground">
          <th className="w-8 px-2 py-2 text-right font-medium">#</th>
          <th className="px-2 py-2 text-left font-medium">Opportunity</th>
          <th className="px-2 py-2 text-left font-medium">Department</th>
          <th className="px-2 py-2 text-left font-medium">Level</th>
          <th className="px-2 py-2 text-left font-medium">Type</th>
          <SortableHeader
            label="Value"
            sortKey="value"
            sort={sort}
            onSortChange={onSortChange}
            align="right"
          />
          <SortableHeader
            label="Readiness"
            sortKey="readiness"
            sort={sort}
            onSortChange={onSortChange}
          />
          <th className="px-2 py-2 text-left font-medium">Workforce</th>
          <SortableHeader
            label="Rel"
            sortKey="relevance"
            sort={sort}
            onSortChange={onSortChange}
            align="right"
          />
          <th className="w-8 px-2 py-2 text-center font-medium">Rev</th>
          <th className="w-8 px-2 py-2 text-center font-medium">★</th>
        </tr>
      </thead>
      <tbody>
        {scored.map((uop, i) => (
          <Row
            key={uop.id}
            uop={uop}
            rank={i + 1}
            score={scores.get(uop.id) ?? null}
            {...rowProps}
          />
        ))}
      </tbody>
      {unscored.length > 0 && (
        <tbody>
          <tr>
            <td
              colSpan={11}
              className="border-b border-border px-2 pb-1 pt-6 text-xs uppercase tracking-wider text-muted-foreground"
            >
              Not scored — strategic or awaiting assessment
            </td>
          </tr>
          {unscored.map((uop) => (
            <Row
              key={uop.id}
              uop={uop}
              rank={null}
              score={null}
              {...rowProps}
            />
          ))}
        </tbody>
      )}
    </table>
  )
}
