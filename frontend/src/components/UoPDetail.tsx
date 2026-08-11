import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { UoP } from '@/lib/types'
import {
  fetchUops,
  toggleReviewed,
  toggleShortlisted,
} from '@/lib/api'
import { relevanceScores, RELEVANCE_EXPLANATION } from '@/lib/score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SECTION_LABELS: Record<string, string> = {
  board: 'Board',
  enterprise: 'Enterprise',
  department: 'Departmental',
  function: 'Functional',
  role: 'Role',
}

const IMPACT_ROWS: [keyof UoP, string, string, string][] = [
  [
    'impact_nc',
    'No change',
    'bg-stone-300',
    'Work continues as it is today',
  ],
  ['impact_aug', 'Augmented', 'bg-sky-400', 'Same work, AI-assisted'],
  [
    'impact_tf',
    'Transformed',
    'bg-violet-400',
    'The job itself is redesigned',
  ],
  [
    'impact_rd',
    'Redeployed',
    'bg-amber-400',
    'Capacity moves to other work',
  ],
]

function Stat({
  label,
  children,
  title,
}: {
  label: string
  children: React.ReactNode
  title?: string
}) {
  return (
    <div title={title}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{children}</div>
    </div>
  )
}

export function UoPDetail() {
  const { id } = useParams<{ id: string }>()
  const [uop, setUop] = useState<UoP | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    // Fetch the portfolio (a couple dozen rows) rather than one record: the
    // relevance score is only meaningful relative to the whole portfolio.
    fetchUops()
      .then((all) => {
        const current = all.find((u) => u.id === id)
        if (!current) throw new Error('UoP not found')
        setUop(current)
        setScore(relevanceScores(all).get(id) ?? null)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const runAction = (action: (id: string) => Promise<UoP>) => {
    if (!uop) return
    setActionError(null)
    action(uop.id)
      .then(setUop)
      .catch((e: Error) => setActionError(e.message))
  }

  if (loading) return <p className="p-8 text-muted-foreground">Loading...</p>
  if (error || !uop)
    return (
      <div className="p-8">
        <p className="text-red-600">Error: {error ?? 'UoP not found'}</p>
        <Link to="/" className="text-sm text-accent underline">
          Back to library
        </Link>
      </div>
    )

  const hasImpact = uop.impact_nc != null

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to library
      </Link>

      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-accent">
            {[uop.department_norm ?? 'Unclassified', uop.role]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <h1 className="mt-1 font-serif text-4xl font-medium leading-tight tracking-tight">
            {uop.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{SECTION_LABELS[uop.section] ?? uop.section}</Badge>
            {uop.archetype && <Badge>{uop.archetype}</Badge>}
            {uop.reviewed && (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Reviewed
              </Badge>
            )}
            {uop.shortlisted && (
              <Badge className="border-accent/30 bg-accent/10 text-accent">
                Shortlisted
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button onClick={() => runAction(toggleShortlisted)}>
            {uop.shortlisted ? '★ Remove from shortlist' : '☆ Add to shortlist'}
          </Button>
          <Button
            onClick={() => runAction(toggleReviewed)}
            className="bg-transparent text-foreground border border-border hover:bg-muted"
          >
            {uop.reviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
          </Button>
        </div>
      </div>
      {actionError && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {actionError}
        </p>
      )}

      {uop.data_flags.length > 0 && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="text-xs font-semibold uppercase tracking-wider">
            Data caveats
          </p>
          {uop.data_flags.map((flag) => (
            <p key={flag} className="mt-1">
              {flag}
            </p>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-3">
        <Stat label="Value potential">
          {uop.value_band ?? (
            <span className="text-base font-normal text-muted-foreground">
              Strategic — no dollar band
            </span>
          )}
        </Stat>
        <Stat label="Readiness">
          {uop.readiness != null ? (
            <span>
              {uop.readiness}
              <span className="text-base font-normal text-muted-foreground">
                {' '}
                / 100
              </span>
            </span>
          ) : (
            <span className="text-base font-normal text-muted-foreground">
              Not yet assessed
            </span>
          )}
        </Stat>
        <Stat label="Board relevance" title={RELEVANCE_EXPLANATION}>
          {score ?? (
            <span className="text-base font-normal text-muted-foreground">
              Not scored
            </span>
          )}
        </Stat>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-3">
          <p className="text-sm leading-relaxed">{uop.desc}</p>
          {uop.back_desc && (
            <p className="mt-4 border-l-2 border-accent/40 pl-4 font-serif text-base italic leading-relaxed text-muted-foreground">
              {uop.back_desc}
            </p>
          )}

          {uop.metrics.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Key metrics
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {uop.metrics.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="text-accent">·</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Workforce impact
          </p>
          {hasImpact ? (
            <div className="mt-2 space-y-2">
              {IMPACT_ROWS.map(([key, label, color, hint]) => (
                <div key={key as string} className="flex items-center gap-2" title={hint}>
                  <span className="w-24 shrink-0 text-xs text-muted-foreground">
                    {label}
                  </span>
                  <div className="h-2 flex-1 rounded-sm bg-muted">
                    <div
                      className={`h-full rounded-sm ${color}`}
                      style={{ width: `${Math.min(uop[key] as number, 100)}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right text-xs tabular-nums">
                    {uop[key] as number}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              The workforce pass hasn't run for this UoP yet.
            </p>
          )}

          {uop.sources.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Sources
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {uop.sources.map((s) => (
                  <li key={s.label}>
                    {s.url ? (
                      <a
                        href={s.url}
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.label}
                      </a>
                    ) : (
                      s.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <p className="mt-12 border-t border-border pt-4 text-xs text-muted-foreground">
        {uop.id} · UoP #{uop.uop_num} · generated{' '}
        {new Date(uop.generated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  )
}
