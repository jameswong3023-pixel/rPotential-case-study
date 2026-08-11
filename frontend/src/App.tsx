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
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">UoP Library</h1>
          <p className="text-sm text-muted-foreground">
            Meridian Industrial Group · {uops.length} units of potential
          </p>
        </div>
        <FilterBar
          departments={departments}
          filters={filters}
          onChange={setFilters}
        />
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {RELEVANCE_EXPLANATION}
      </p>

      {actionError && (
        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {actionError}
        </p>
      )}
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <>
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
        </>
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
