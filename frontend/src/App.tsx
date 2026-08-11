import { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { UoP } from '@/lib/types'
import {
  fetchUops,
  fetchDepartments,
  toggleReviewed,
  toggleShortlisted,
} from '@/lib/api'
import { relevanceScores, valueMidpoint, RELEVANCE_EXPLANATION } from '@/lib/score'
import { FilterBar, EMPTY_FILTERS, type Filters } from '@/components/FilterBar'
import { TriageTable, type Sort } from '@/components/TriageTable'
import { ShortlistTray } from '@/components/ShortlistTray'
import { UoPDetail } from '@/components/UoPDetail'
import { Compare } from '@/components/Compare'

function Library() {
  const [uops, setUops] = useState<UoP[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<Sort>({ key: 'relevance', desc: true })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    // The full portfolio is a couple dozen rows; load once and filter
    // client-side so triage stays instant.
    Promise.all([fetchUops(), fetchDepartments()])
      .then(([uopData, deptData]) => {
        setUops(uopData)
        setDepartments(deptData)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Scores are computed on the full portfolio, not the filtered view, so a
  // UoP's relevance doesn't change when filters change.
  const scores = useMemo(() => relevanceScores(uops), [uops])

  const { scored, unscored } = useMemo(() => {
    const visible = uops.filter(
      (u) =>
        (!filters.department || u.department_norm === filters.department) &&
        (!filters.section || u.section === filters.section) &&
        (!filters.archetype || u.archetype === filters.archetype) &&
        (!filters.hideReviewed || !u.reviewed),
    )
    const sortValue = (u: UoP): number | null =>
      sort.key === 'relevance'
        ? scores.get(u.id) ?? null
        : sort.key === 'value'
          ? valueMidpoint(u)
          : u.readiness

    const scoredRows = visible
      .filter((u) => sortValue(u) != null)
      .sort((a, b) => {
        const diff = (sortValue(b) as number) - (sortValue(a) as number)
        return sort.desc ? diff : -diff
      })
    const unscoredRows = visible
      .filter((u) => sortValue(u) == null)
      .sort((a, b) => a.uop_num - b.uop_num)
    return { scored: scoredRows, unscored: unscoredRows }
  }, [uops, filters, sort, scores])

  const applyUpdate = (updated: UoP) => {
    setUops((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setActionError(null)
  }
  const handleToggleReviewed = (id: string) =>
    toggleReviewed(id).then(applyUpdate).catch((e: Error) =>
      setActionError(e.message),
    )
  const handleToggleShortlisted = (id: string) =>
    toggleShortlisted(id).then(applyUpdate).catch((e: Error) =>
      setActionError(e.message),
    )

  const shortlisted = uops.filter((u) => u.shortlisted)

  return (
    <div className="mx-auto max-w-6xl p-8 pb-24">
      <header className="border-b-2 border-foreground pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Meridian Industrial Group · AI opportunity portfolio
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-4xl font-medium tracking-tight">
            Unit of Potential Library
          </h1>
          <p className="text-sm text-muted-foreground">
            {uops.length} opportunities · {shortlisted.length}/3 shortlisted
          </p>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3">
        <FilterBar
          departments={departments}
          filters={filters}
          onChange={setFilters}
        />
        <p
          className="text-xs text-muted-foreground"
          title={RELEVANCE_EXPLANATION}
        >
          Ranked by board relevance — 60% value · 40% readiness
        </p>
      </div>
      {actionError && (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
          {actionError}
        </p>
      )}
      {loading && <p className="mt-4 text-muted-foreground">Loading...</p>}
      {error && <p className="mt-4 text-red-700">Error: {error}</p>}

      {!loading && !error && (
        <div className="mt-4">
          <TriageTable
            scored={scored}
            unscored={unscored}
            scores={scores}
            sort={sort}
            onSortChange={setSort}
            onToggleReviewed={handleToggleReviewed}
            onToggleShortlisted={handleToggleShortlisted}
          />
          {scored.length === 0 && unscored.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">
              No UoPs match the current filters.
            </p>
          )}
        </div>
      )}

      <ShortlistTray
        shortlisted={shortlisted}
        onRemove={handleToggleShortlisted}
      />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/uops/:id" element={<UoPDetail />} />
      <Route path="/compare" element={<Compare />} />
    </Routes>
  )
}
