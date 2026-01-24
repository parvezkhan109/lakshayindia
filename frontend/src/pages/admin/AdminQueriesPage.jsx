import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/services/api'

function fmtDate(s) {
  if (!s) return '—'
  try {
    const d = new Date(s)
    return d.toLocaleString('en-IN')
  } catch {
    return String(s)
  }
}

export default function AdminQueriesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [createBusy, setCreateBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [role, setRole] = useState('VENDOR')
  const [msg, setMsg] = useState('')

  const title = useMemo(() => 'Queries', [])

  async function loadList() {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/queries')
      setItems(data.queries || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadDetail(id) {
    if (!id) return
    setDetailLoading(true)
    setError('')
    try {
      const data = await apiFetch(`/api/queries/${id}`)
      setDetail(data.query)
    } catch (e) {
      setError(e.message)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedId) loadDetail(selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  async function onCreateUser() {
    if (!selectedId) return
    setCreateBusy(true)
    setError('')
    setMsg('')
    try {
      const data = await apiFetch(`/api/queries/${selectedId}/create-user`, {
        method: 'POST',
        body: { role },
      })
      setMsg(`User created (id=${data.userId}). Query marked as processed.`)
      await loadList()
      await loadDetail(selectedId)
    } catch (e) {
      setError(e.message)
    } finally {
      setCreateBusy(false)
    }
  }

  async function onDeleteQuery() {
    if (!selectedId) return
    const ok = window.confirm('Delete this form permanently?')
    if (!ok) return

    setDeleteBusy(true)
    setError('')
    setMsg('')
    try {
      await apiFetch(`/api/queries/${selectedId}/delete`, { method: 'POST' })
      setMsg('Deleted.')
      setSelectedId(null)
      setDetail(null)
      await loadList()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Admin</div>
        <div className="text-2xl font-semibold">{title}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Submitted Forms</div>
                <div className="text-xs text-zinc-400">Newest first</div>
              </div>
              <Button variant="outline" onClick={loadList} disabled={loading || detailLoading || createBusy}>
                {loading ? 'Refreshing…' : 'Refresh'}
              </Button>
            </div>

            {error ? <div className="mt-3 text-sm text-red-200">{error}</div> : null}

            <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl ring-1 ring-white/10">
              {loading ? (
                <div className="px-4 py-4 text-sm text-zinc-300">Loading…</div>
              ) : items.length === 0 ? (
                <div className="px-4 py-4 text-sm text-zinc-400">No queries yet.</div>
              ) : (
                items.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedId(q.id)}
                    className={`w-full text-left px-4 py-4 hover:bg-white/5 ${selectedId === q.id ? 'bg-white/6' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{q.name}</div>
                        <div className="text-xs text-zinc-400">{q.contactNumber} • {q.email}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs ${q.status === 'PROCESSED' ? 'text-emerald-300' : 'text-amber-200'}`}>{q.status}</div>
                        <div className="text-[11px] text-zinc-500">{fmtDate(q.createdAt)}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">View Form</div>
                <div className="text-xs text-zinc-400">Open a query from the left list</div>
              </div>
              {selectedId ? (
                <div className="text-xs text-zinc-400">ID: <span className="text-zinc-200">{selectedId}</span></div>
              ) : null}
            </div>

            {detailLoading ? (
              <div className="mt-4 text-sm text-zinc-300">Loading…</div>
            ) : !detail ? (
              <div className="mt-4 text-sm text-zinc-400">Select a query to view details.</div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">Name</div>
                    <div className="font-semibold">{detail.name}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">Father Name</div>
                    <div className="font-semibold">{detail.fatherName}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">DOB</div>
                    <div className="font-semibold">{detail.dob}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">Contact</div>
                    <div className="font-semibold">{detail.contactNumber}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3 md:col-span-2">
                    <div className="text-xs text-zinc-400">Permanent Address</div>
                    <div className="font-semibold">{detail.permanentAddress}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">State</div>
                    <div className="font-semibold">{detail.state}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">District</div>
                    <div className="font-semibold">{detail.district}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">Email</div>
                    <div className="font-semibold">{detail.email}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">Username</div>
                    <div className="font-semibold">{detail.username}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">Aadhar Card</div>
                    <div className="font-semibold">{detail.aadharCard}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-zinc-400">PAN Card</div>
                    <div className="font-semibold">{detail.panCard}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-2">
                    <Label>Create user as</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VENDOR">Vendor</SelectItem>
                        <SelectItem value="SUPER">Super</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={onCreateUser}
                    disabled={createBusy || detail.status === 'PROCESSED'}
                    className="bg-amber-500 text-black hover:bg-amber-400"
                  >
                    {createBusy ? 'Creating…' : detail.status === 'PROCESSED' ? 'Already Processed' : 'Create User'}
                  </Button>

                      <Button
                        variant="destructive"
                        onClick={onDeleteQuery}
                        disabled={deleteBusy || createBusy}
                      >
                        {deleteBusy ? 'Deleting…' : 'Delete Form'}
                      </Button>

                  {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}
                </div>

                <div className="text-xs text-zinc-500">
                  Submitted: {fmtDate(detail.createdAt)} • Status: {detail.status}
                  {detail.processedAt ? ` • Processed: ${fmtDate(detail.processedAt)}` : ''}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
