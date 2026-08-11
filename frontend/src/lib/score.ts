import type { UoP } from './types'

/**
 * Board relevance: a transparent composite used as the default ranking.
 * 60% value (band midpoint, normalized against the largest midpoint in the
 * portfolio) + 40% readiness. Items missing either input are not scored —
 * they are grouped separately rather than silently ranked at zero.
 */
export const RELEVANCE_EXPLANATION =
  'Board relevance = 60% value (band midpoint, normalized to the portfolio) + 40% readiness. Items missing either input are listed under "Not scored".'

export function valueMidpoint(uop: UoP): number | null {
  if (uop.value_low == null || uop.value_high == null) return null
  return (uop.value_low + uop.value_high) / 2
}

export function relevanceScores(uops: UoP[]): Map<string, number> {
  const midpoints = uops
    .map(valueMidpoint)
    .filter((m): m is number => m != null)
  const maxMidpoint = Math.max(...midpoints, 1)

  const scores = new Map<string, number>()
  for (const uop of uops) {
    const midpoint = valueMidpoint(uop)
    if (midpoint == null || uop.readiness == null) continue
    const score =
      100 * (0.6 * (midpoint / maxMidpoint) + 0.4 * (uop.readiness / 100))
    scores.set(uop.id, Math.round(score))
  }
  return scores
}
