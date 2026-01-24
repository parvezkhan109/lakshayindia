import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/services/api'
import { getSession } from '@/services/session'
import { SLOT_OPTIONS, formatSlotLabel } from '@/lib/slots'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AdminResultPublishPage() {
  const session = useMemo(() => getSession(), [])
  const [date, setDate] = useState(todayISO())
  const [hour, setHour] = useState(String(new Date().getHours()))
  const [winningNumbers, setWinningNumbers] = useState({
    SILVER: '0',
    GOLD: '0',
    DIAMOND: '0',
  })
  const [busy, setBusy] = useState(false)
  const [editBusy, setEditBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [slotInfo, setSlotInfo] = useState(null)
  const [quizzesByType, setQuizzesByType] = useState({})
  const [storiesBusy, setStoriesBusy] = useState(false)
  const [matrixBusy, setMatrixBusy] = useState(false)
  const [matrix, setMatrix] = useState(null)

  const quizTypes = useMemo(() => ['SILVER', 'GOLD', 'DIAMOND'], [])

  function titleFor(qt, n) {
    const q = quizzesByType?.[qt]
    const idx = Number(n)
    if (!q?.titles || !Number.isInteger(idx)) return ''
    return q.titles[idx] || ''
  }

  function formatMoney(n) {
    const v = Number(n || 0)
    try {
      return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v)
    } catch {
      return String(v)
    }
  }

  function anyPublished(m) {
    if (!m?.published) return false
    return Boolean(m.published.SILVER || m.published.GOLD || m.published.DIAMOND)
  }

  async function loadStories() {
    setStoriesBusy(true)
    setErr('')
    try {
      const qs = new URLSearchParams({ date, hour: String(Number(hour)), auto: '1' }).toString()
      const data = await apiFetch(`/api/stories/slot?${qs}`)
      setSlotInfo(data.slot)

      const map = {}
      for (const q of data.quizzes || []) {
        map[q.quizType] = q
      }
      setQuizzesByType(map)
    } catch (e) {
      setErr(e.message)
      setSlotInfo(null)
      setQuizzesByType({})
    } finally {
      setStoriesBusy(false)
    }
  }

  async function loadMatrix() {
    setMatrixBusy(true)
    setErr('')
    try {
      const qs = new URLSearchParams({ date, hour: String(Number(hour)) }).toString()
      const data = await apiFetch(`/api/results/slot-matrix?${qs}`)
      setMatrix(data)

      // If already published for this slot, prefill the selects for edit mode.
      if (data?.published) {
        setWinningNumbers((prev) => {
          const next = { ...prev }
          for (const qt of quizTypes) {
            if (data.published[qt] && data.published[qt].winningNumber !== undefined && data.published[qt].winningNumber !== null) {
              next[qt] = String(data.published[qt].winningNumber)
            }
          }
          return next
        })
      }
    } catch (e) {
      setErr(e.message)
      setMatrix(null)
    } finally {
      setMatrixBusy(false)
    }
  }

  useEffect(() => {
    loadStories()
    loadMatrix()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, hour])

  async function onPublishAll() {
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      const body = {
        date,
        hour: Number(hour),
        winningNumbers: {
          SILVER: Number(winningNumbers.SILVER),
          GOLD: Number(winningNumbers.GOLD),
          DIAMOND: Number(winningNumbers.DIAMOND),
        },
      }

      // If already published, treat this as an update (edit-batch).
      const publishedAlready = anyPublished(matrix)
      const data = await apiFetch(publishedAlready ? '/api/results/edit-batch' : '/api/results/publish-batch', {
        method: publishedAlready ? 'PUT' : 'POST',
        body,
      })

      const payload = publishedAlready ? (data.updated || {}) : (data.published || {})
      setMsg(
        `${publishedAlready ? 'Updated' : 'Published'}: ` +
          quizTypes
            .map((qt) => `${qt}=${payload[qt]?.winningNumber ?? '?'} (${payload[qt]?.title || '—'})`)
            .join(' | ')
      )

      await loadMatrix()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function onEditAll() {
    setEditBusy(true)
    setErr('')
    setMsg('')
    try {
      const body = {
        date,
        hour: Number(hour),
        winningNumbers: {
          SILVER: Number(winningNumbers.SILVER),
          GOLD: Number(winningNumbers.GOLD),
          DIAMOND: Number(winningNumbers.DIAMOND),
        },
      }

      const data = await apiFetch('/api/results/edit-batch', {
        method: 'PUT',
        body,
      })

      const u = data.updated || {}
      setMsg(
        `Updated: ` +
          quizTypes
            .map((qt) => `${qt}=${u[qt]?.winningNumber ?? '?'} (${u[qt]?.title || '—'})`)
            .join(' | ')
      )
      await loadMatrix()
    } catch (e) {
      setErr(e.message)
    } finally {
      setEditBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">{session?.role || 'User'}</div>
        <div className="text-2xl font-semibold">Publish Slot Results</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input className="bg-zinc-950/40" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hour</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>
                  {SLOT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Story Titles (auto-loaded)</Label>
              <div className="text-xs text-zinc-400">
                {storiesBusy
                  ? 'Loading…'
                  : slotInfo
                    ? 'Slot stories loaded.'
                    : 'No stories found for this slot yet.'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={loadStories} disabled={storiesBusy || busy || editBusy}>
              {storiesBusy ? 'Refreshing…' : 'Refresh Stories'}
            </Button>
            <Button variant="outline" onClick={loadMatrix} disabled={matrixBusy || busy || editBusy}>
              {matrixBusy ? 'Refreshing…' : 'Refresh Matrix'}
            </Button>
            <div className="text-xs text-zinc-400">
              Selected slot: {formatSlotLabel(hour) || '—'}
            </div>
            {err ? <div className="text-sm text-red-200">{err}</div> : null}
            {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Slot Matrix (0–9)</div>
              <div className="text-xs text-zinc-400">Per title number: how many tickets placed</div>
            </div>
            <div className="text-right text-xs text-zinc-400">
              <div>
                Total tickets: <span className="text-zinc-200">{matrix?.totals?.ALL?.tickets ?? 0}</span>
              </div>
              <div>
                Total revenue: <span className="text-zinc-200">₹{formatMoney(matrix?.totals?.ALL?.revenue ?? 0)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-auto rounded-md ring-1 ring-white/10">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/60 text-zinc-300">
                <tr>
                  <th className="px-3 py-2 text-left">Title No</th>
                  <th className="px-3 py-2 text-left">Silver</th>
                  <th className="px-3 py-2 text-left">Gold</th>
                  <th className="px-3 py-2 text-left">Diamond</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {Array.from({ length: 10 }, (_, i) => {
                  const r = matrix?.statsByNumber?.[i]
                  const s = r?.SILVER || { tickets: 0, revenue: 0 }
                  const g = r?.GOLD || { tickets: 0, revenue: 0 }
                  const d = r?.DIAMOND || { tickets: 0, revenue: 0 }
                  return (
                    <tr key={i} className="text-zinc-200">
                      <td className="px-3 py-2 font-medium">{i}</td>
                      <td className="px-3 py-2 text-zinc-100">{s.tickets}</td>
                      <td className="px-3 py-2 text-zinc-100">{g.tickets}</td>
                      <td className="px-3 py-2 text-zinc-100">{d.tickets}</td>
                    </tr>
                  )
                })}

                <tr className="bg-zinc-950/30 text-zinc-200">
                  <td className="px-3 py-2 font-semibold">TOTAL TICKETS</td>
                  <td className="px-3 py-2 font-semibold">{matrix?.totals?.SILVER?.tickets ?? 0}</td>
                  <td className="px-3 py-2 font-semibold">{matrix?.totals?.GOLD?.tickets ?? 0}</td>
                  <td className="px-3 py-2 font-semibold">{matrix?.totals?.DIAMOND?.tickets ?? 0}</td>
                </tr>

                <tr className="bg-zinc-950/30 text-zinc-200">
                  <td className="px-3 py-2 font-semibold">TOTAL REVENUE</td>
                  <td className="px-3 py-2 font-semibold">₹{formatMoney(matrix?.totals?.SILVER?.revenue ?? 0)}</td>
                  <td className="px-3 py-2 font-semibold">₹{formatMoney(matrix?.totals?.GOLD?.revenue ?? 0)}</td>
                  <td className="px-3 py-2 font-semibold">₹{formatMoney(matrix?.totals?.DIAMOND?.revenue ?? 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-xs text-zinc-400">
            Note: result publish requires stories exist for this slot (Silver/Gold/Diamond).
          </div>

          <div className="overflow-auto rounded-md ring-1 ring-white/10">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/60 text-zinc-300">
                <tr>
                  <th className="px-3 py-2 text-left">&nbsp;</th>
                  <th className="px-3 py-2 text-left">Silver</th>
                  <th className="px-3 py-2 text-left">Gold</th>
                  <th className="px-3 py-2 text-left">Diamond</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="text-zinc-200">
                  <td className="px-3 py-2 font-medium">Winning No</td>
                  {quizTypes.map((qt) => (
                    <td key={qt} className="px-3 py-2">
                      <Select
                        value={winningNumbers[qt]}
                        onValueChange={(v) => setWinningNumbers((prev) => ({ ...prev, [qt]: v }))}
                      >
                        <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{String(i)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  ))}
                </tr>
                <tr className="text-zinc-200">
                  <td className="px-3 py-2 font-medium">Title</td>
                  {quizTypes.map((qt) => (
                    <td key={qt} className="px-3 py-2 text-zinc-300">
                      {titleFor(qt, winningNumbers[qt]) || '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onPublishAll} disabled={busy || storiesBusy || editBusy}>
              {busy ? 'Saving…' : anyPublished(matrix) ? 'Publish / Update All' : 'Publish All'}
            </Button>
            <Button
              variant="secondary"
              onClick={onEditAll}
              disabled={editBusy || storiesBusy || !anyPublished(matrix)}
            >
              {editBusy ? 'Updating…' : 'Edit'}
            </Button>
          </div>

          {anyPublished(matrix) ? (
            <div className="text-xs text-zinc-400">
              Published now: {' '}
              <span className="text-zinc-200">SILVER={matrix?.published?.SILVER?.winningNumber ?? '—'}</span>, {' '}
              <span className="text-zinc-200">GOLD={matrix?.published?.GOLD?.winningNumber ?? '—'}</span>, {' '}
              <span className="text-zinc-200">DIAMOND={matrix?.published?.DIAMOND?.winningNumber ?? '—'}</span>
              <div className="mt-1">Use “Edit / Update Results” if you published wrong result.</div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400">Not published for this slot yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
