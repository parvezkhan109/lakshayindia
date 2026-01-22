import { getSession } from '@/services/session'

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const baseUrl = (import.meta?.env?.VITE_API_BASE_URL || '').trim()

  const url = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}${String(path).startsWith('/') ? '' : '/'}${path}`
    : path

  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const session = getSession()
    if (session?.token) headers.Authorization = `Bearer ${session.token}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}
