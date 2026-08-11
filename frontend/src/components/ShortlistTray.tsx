import { Link } from 'react-router-dom'
import type { UoP } from '@/lib/types'

const SHORTLIST_LIMIT = 3

export function ShortlistTray({
  shortlisted,
  onRemove,
}: {
  shortlisted: UoP[]
  onRemove: (id: string) => void
}) {
  if (shortlisted.length === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-8 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Board shortlist {shortlisted.length}/{SHORTLIST_LIMIT}
        </span>
        {shortlisted.map((uop) => (
          <span
            key={uop.id}
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-sm"
          >
            <Link to={`/uops/${uop.id}`} className="hover:underline">
              {uop.name.length > 44 ? `${uop.name.slice(0, 44)}…` : uop.name}
            </Link>
            <button
              onClick={() => onRemove(uop.id)}
              title="Remove from shortlist"
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
        {shortlisted.length >= 2 && (
          <Link
            to="/compare"
            className="ml-auto rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Compare →
          </Link>
        )}
      </div>
    </div>
  )
}
