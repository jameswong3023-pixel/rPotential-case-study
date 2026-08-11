import type { UoP } from './types'

const BASE_URL = 'http://localhost:8000'

export async function fetchUops(
  section?: string,
  scope?: string,
): Promise<UoP[]> {
  const params = new URLSearchParams()
  if (section) params.set('section', section)
  if (scope) params.set('scope', scope)
  const query = params.toString()
  const url = query ? `${BASE_URL}/uops?${query}` : `${BASE_URL}/uops`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch UoPs: ${res.status}`)
  return res.json()
}

export async function fetchUop(id: string): Promise<UoP> {
  const res = await fetch(`${BASE_URL}/uops/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch UoP: ${res.status}`)
  return res.json()
}

export async function reviewUop(id: string): Promise<UoP> {
  const res = await fetch(`${BASE_URL}/uops/${id}/review`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Failed to mark reviewed: ${res.status}`)
  return res.json()
}
