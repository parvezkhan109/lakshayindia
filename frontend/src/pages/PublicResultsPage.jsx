import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatSlotLabel } from '@/lib/slots'
import { apiFetch } from '@/services/api'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function cell(v) {
  if (!v) return <span className="text-zinc-500">—</span>
  return (
    <div className="space-y-1">
      <div className="text-lg font-semibold">{v.winningNumber}</div>
      <div className="text-xs text-zinc-300 line-clamp-2">{v.title || 'Title unavailable'}</div>
    </div>
  )
}

function normalizeHour(row) {
  const h = row?.hour ?? row?.slotHour ?? row?.slot_hour
  const n = Number(h)
  if (!Number.isFinite(n)) return null
  return n
}

export default function PublicResultsPage() {
  const [date, setDate] = useState(todayISO())
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => `Results • ${date}`, [date])

  useEffect(() => {
    let cancel = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch(`/api/public/results?date=${encodeURIComponent(date)}`, {
          auth: false,
        })
        if (!cancel) setRows(data.rows || [])
      } catch (e) {
        if (!cancel) setError(e.message)
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    if (date) load()
    return () => {
      cancel = true
    }
  }, [date])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">Luck India</div>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <div className="w-full max-w-xs">
            <div className="text-xs text-zinc-400">Select date</div>
            <Input className="mt-2 bg-zinc-950/40" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <Separator className="my-6 bg-white/10" />

        <Card className="bg-zinc-900/30 ring-1 ring-white/10">
          <CardContent className="p-0">
            <div className="grid grid-cols-4 gap-0 border-b border-white/10 px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              <div>Time</div>
              <div>Silver</div>
              <div>Gold</div>
              <div>Diamond</div>
            </div>

            {loading ? (
              <div className="px-4 py-6 text-sm text-zinc-300">Loading…</div>
            ) : error ? (
              <div className="px-4 py-6 text-sm text-red-200">{error}</div>
            ) : rows.length === 0 ? (
              <div className="px-4 py-6 text-sm text-zinc-400">No results published for this date yet.</div>
            ) : (
              rows.map((r, idx) => {
                const h = normalizeHour(r)
                return (
                  <div key={h ?? idx} className="grid grid-cols-4 gap-0 border-t border-white/10 px-4 py-4">
                    <div className="text-sm text-zinc-300">{h === null ? '—' : formatSlotLabel(h)}</div>
                  <div>{cell(r.SILVER)}</div>
                  <div>{cell(r.GOLD)}</div>
                  <div>{cell(r.DIAMOND)}</div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
