import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import type { UoP } from '@/lib/types'
import { fetchUops } from '@/lib/api'
import { UoPCard } from '@/components/UoPCard'
import { FilterBar } from '@/components/FilterBar'

const SECTIONS: [string, string][] = [
  ['enterprise', 'Enterprise'],
  ['department', 'Departmental'],
  ['function', 'Functional'],
  ['role', 'Role'],
  ['board', 'Board'],
]

function rankUops(uops: UoP[], rankBy: string): UoP[] {
  if (rankBy === 'value') {
    const low = (band: string | null) =>
      band ? parseFloat(band.replace(/[^0-9.]/g, ' ').trim().split(' ')[0]) : 0
    return [...uops].sort((a, b) => low(b.value_band) - low(a.value_band))
  }
  return [...uops].sort(
    (a, b) => (b.readiness as number) - (a.readiness as number),
  )
}

function Library() {
  const [uops, setUops] = useState<UoP[]>([])
  const [priorities, setPriorities] = useState<string[]>([])
  const [scope, setScope] = useState('')
  const [rankBy, setRankBy] = useState('readiness')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchUops(undefined, scope || undefined)
      .then((data) => {
        setUops(data)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [scope])

  const ranked = rankUops(uops, rankBy)

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">UoP Library</h1>
          <p className="text-sm text-muted-foreground">
            Meridian Industrial Group
          </p>
        </div>
        <FilterBar
          priorities={priorities}
          scope={scope}
          rankBy={rankBy}
          onPrioritiesChange={setPriorities}
          onScopeChange={setScope}
          onRankByChange={setRankBy}
        />
      </div>
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {SECTIONS.map(([id, label]) => {
        const sectionUops = ranked.filter((u) => u.section === id)
        if (sectionUops.length === 0) return null
        return (
          <section key={id} className="mb-8">
            <h2 className="mb-3 border-b-2 border-indigo-100 pb-2 text-sm font-semibold uppercase tracking-wider text-indigo-900">
              {label} <span className="text-indigo-400">· {sectionUops.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectionUops.map((uop) => (
                <Link key={uop.id} to={`/uops/${uop.id}`} className="block">
                  <UoPCard uop={uop} />
                </Link>
              ))}
            </div>
          </section>
        )
      })}
      {!loading && ranked.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No UoPs found.
        </p>
      )}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
    </Routes>
  )
}
