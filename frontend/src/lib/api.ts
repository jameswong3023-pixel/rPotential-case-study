import type { UoP } from './types'

const BASE_URL = 'http://localhost:8000'

async function handle<T>(res: Response, action: string): Promise<T> {
  if (!res.ok) {
    // The API returns meaningful messages (e.g. shortlist limit); surface
    // them instead of a bare status code.
    const detail = await res
      .json()
      .then((body) => body?.detail)
      .catch(() => null)
    throw new Error(detail ?? `${action} failed (${res.status})`)
  }
  return res.json()
}

export async function fetchUops(
  section?: string,
  scope?: string,
): Promise<UoP[]> {
  const params = new URLSearchParams()
  if (section) params.set('section', section)
  if (scope) params.set('scope', scope)
  const query = params.toString()
  const url = query ? `${BASE_URL}/uops?${query}` : `${BASE_URL}/uops`
  return handle(await fetch(url), 'Loading UoPs')
}

export async function fetchUop(id: string): Promise<UoP> {
  return handle(await fetch(`${BASE_URL}/uops/${id}`), 'Loading UoP')
}

export async function fetchDepartments(): Promise<string[]> {
  return handle(await fetch(`${BASE_URL}/departments`), 'Loading departments')
}

export async function toggleReviewed(id: string): Promise<UoP> {
  return handle(
    await fetch(`${BASE_URL}/uops/${id}/review`, { method: 'POST' }),
    'Updating review state',
  )
}

export async function toggleShortlisted(id: string): Promise<UoP> {
  return handle(
    await fetch(`${BASE_URL}/uops/${id}/shortlist`, { method: 'POST' }),
    'Updating shortlist',
  )
}
