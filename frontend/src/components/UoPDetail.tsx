import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { UoP } from '@/lib/types'
import { fetchUop, toggleReviewed, toggleShortlisted } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function UoPDetail() {
  const { id } = useParams<{ id: string }>()
  const [uop, setUop] = useState<UoP | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchUop(id)
      .then((data) => {
        setUop(data)
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
        <Link to="/" className="text-sm text-indigo-600 underline">
          Back to library
        </Link>
      </div>
    )

  const hasImpact =
    uop.impact_nc != null &&
    uop.impact_aug != null &&
    uop.impact_tf != null &&
    uop.impact_rd != null

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to library
      </Link>

      <p className="mt-6 text-xs uppercase tracking-wide text-indigo-500">
        {[uop.department_norm ?? 'Unclassified', uop.role]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{uop.name}</h1>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{uop.section}</Badge>
        {uop.archetype && <Badge>{uop.archetype}</Badge>}
        {uop.reviewed && (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Reviewed
          </Badge>
        )}
        {uop.shortlisted && (
          <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
            Shortlisted
          </Badge>
        )}
      </div>

      {uop.data_flags.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {uop.data_flags.map((flag) => (
            <p key={flag}>{flag}</p>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm">{uop.desc}</p>
      {uop.back_desc && (
        <p className="mt-2 text-sm text-muted-foreground">{uop.back_desc}</p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Value potential
          </dt>
          <dd className="mt-1">
            {uop.value_band ?? 'Strategic — no dollar band'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Readiness
          </dt>
          <dd className="mt-1">
            {uop.readiness != null ? `${uop.readiness} / 100` : 'Not yet assessed'}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Workforce impact
          </dt>
          <dd className="mt-1">
            {hasImpact
              ? `No change ${uop.impact_nc}% · Augmented ${uop.impact_aug}% · Transformed ${uop.impact_tf}% · Redeployed ${uop.impact_rd}%`
              : 'Not yet assessed'}
          </dd>
        </div>
      </dl>

      {uop.metrics.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Key metrics
          </p>
          <ul className="mt-1 list-inside list-disc text-sm">
            {uop.metrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {uop.sources.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Sources
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {uop.sources.map((s) => s.label).join(' · ')}
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-2">
        <Button onClick={() => runAction(toggleReviewed)}>
          {uop.reviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
        </Button>
        <Button onClick={() => runAction(toggleShortlisted)}>
          {uop.shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        </Button>
      </div>
      {actionError && (
        <p className="mt-2 text-sm text-red-600">{actionError}</p>
      )}
    </div>
  )
}
