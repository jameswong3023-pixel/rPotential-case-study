import type { UoP } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ARCHETYPE_STYLES: Record<string, string> = {
  capacity: 'border-sky-200 bg-sky-50 text-sky-700',
  growth: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  risk: 'border-amber-200 bg-amber-50 text-amber-700',
}

export function UoPCard({ uop }: { uop: UoP }) {
  return (
    <Card className="transition-colors hover:border-indigo-300">
      <CardHeader>
        <p className="text-xs uppercase tracking-wide text-indigo-500">
          {uop.department} · {uop.role}
        </p>
        <CardTitle>{uop.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{uop.desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{uop.section}</Badge>
          {uop.archetype && (
            <Badge className={ARCHETYPE_STYLES[uop.archetype] ?? ''}>
              {uop.archetype}
            </Badge>
          )}
          {uop.reviewed && (
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Reviewed
            </Badge>
          )}
        </div>
        <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
          Value potential
        </p>
        <p className="text-2xl font-bold text-indigo-600">{uop.value_band}</p>
        <p className="mt-3 text-sm">Readiness: {uop.readiness}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Workforce: NC {uop.impact_nc} · AUG {uop.impact_aug} · TF{' '}
          {uop.impact_tf} · RD {uop.impact_rd}
        </p>
        {uop.sources.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            Sources: {uop.sources.map((s) => s.label).join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
