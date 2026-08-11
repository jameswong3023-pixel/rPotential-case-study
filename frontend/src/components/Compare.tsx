import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { UoP } from '@/lib/types'
import { fetchUops, toggleShortlisted } from '@/lib/api'

const IMPACT_ROWS: [keyof UoP, string, string][] = [
  ['impact_nc', 'No change', 'bg-stone-300'],
  ['impact_aug', 'Augmented', 'bg-sky-400'],
  ['impact_tf', 'Transformed', 'bg-violet-400'],
  ['impact_rd', 'Redeployed', 'bg-amber-400'],
]

function CompareColumn({
  uop,
  onRemove,
}: {
  uop: UoP
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border">
      <div className="border-b border-border p-4">
        <p className="text-xs uppercase tracking-wide text-indigo-500">
          {[uop.department_norm ?? 'Unclassified', uop.role]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <Link
          to={`/uops/${uop.id}`}
          className="mt-1 block font-semibold hover:underline"
        >
          {uop.name}
        </Link>
      </div>
      <dl className="flex-1 space-y-4 p-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Value potential
          </dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums">
            {uop.value_band ?? (
              <span className="text-sm font-normal text-muted-foreground">
                Strategic — no dollar band
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Readiness
          </dt>
          <dd className="mt-0.5 tabular-nums">
            {uop.readiness != null ? `${uop.readiness} / 100` : 'Not assessed'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Archetype · Level
          </dt>
          <dd className="mt-0.5">
            {uop.archetype ?? '—'} · {uop.section}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Workforce impact
          </dt>
          <dd className="mt-1 space-y-1">
            {uop.impact_nc != null ? (
              IMPACT_ROWS.map(([key, label, color]) => (
                <div key={key as string} className="flex items-center gap-2">
                  <span className="w-24 text-xs text-muted-foreground">
                    {label}
                  </span>
                  <div className="h-1.5 flex-1 rounded-sm bg-muted">
                    <div
                      className={`h-full rounded-sm ${color}`}
                      style={{ width: `${uop[key] as number}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs tabular-nums">
                    {uop[key] as number}%
                  </span>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">Not assessed</span>
            )}
          </dd>
        </div>
        {uop.data_flags.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            {uop.data_flags.map((flag) => (
              <p key={flag}>{flag}</p>
            ))}
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Key metrics
          </dt>
          <dd className="mt-1">
            <ul className="list-inside list-disc space-y-0.5 text-sm">
              {uop.metrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Summary
          </dt>
          <dd className="mt-0.5 text-sm text-muted-foreground">{uop.desc}</dd>
        </div>
      </dl>
      <div className="border-t border-border p-3">
        <button
          onClick={() => onRemove(uop.id)}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Remove from shortlist
        </button>
      </div>
    </div>
  )
}

export function Compare() {
  const [uops, setUops] = useState<UoP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUops()
      .then((data) => {
        setUops(data)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const remove = (id: string) => {
    toggleShortlisted(id)
      .then((updated) =>
        setUops((prev) => prev.map((u) => (u.id === updated.id ? updated : u))),
      )
      .catch((e: Error) => setError(e.message))
  }

  const shortlisted = uops.filter((u) => u.shortlisted)

  return (
    <div className="mx-auto max-w-6xl p-8">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to library
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Board shortlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Side-by-side comparison of the opportunities you plan to bring to the
        board.
      </p>

      {loading && <p className="mt-8 text-muted-foreground">Loading...</p>}
      {error && <p className="mt-8 text-red-600">Error: {error}</p>}
      {!loading && shortlisted.length === 0 && (
        <p className="mt-8 text-muted-foreground">
          Nothing shortlisted yet. Star up to three UoPs in the library to
          build your board shortlist.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shortlisted.map((uop) => (
          <CompareColumn key={uop.id} uop={uop} onRemove={remove} />
        ))}
      </div>
    </div>
  )
}
