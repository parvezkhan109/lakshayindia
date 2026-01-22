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
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [slotInfo, setSlotInfo] = useState(null)
  const [quizzesByType, setQuizzesByType] = useState({})
  const [storiesBusy, setStoriesBusy] = useState(false)

  const quizTypes = useMemo(() => ['SILVER', 'GOLD', 'DIAMOND'], [])

  function titleFor(qt, n) {
    const q = quizzesByType?.[qt]
    const idx = Number(n)
    if (!q?.titles || !Number.isInteger(idx)) return ''
    return q.titles[idx] || ''
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

  useEffect(() => {
    loadStories()
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

      const data = await apiFetch('/api/results/publish-batch', {
        method: 'POST',
        body,
      })
      const p = data.published || {}
      setMsg(
        `Published: ` +
          quizTypes
            .map((qt) => `${qt}=${p[qt]?.winningNumber ?? '?'} (${p[qt]?.title || '—'})`)
            .join(' | ')
      )
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
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

          <div className="grid gap-4 md:grid-cols-3">
            {quizTypes.map((qt) => (
              <Card key={qt} className="bg-zinc-950/30 ring-1 ring-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      {qt === 'SILVER' ? 'Silver' : qt === 'GOLD' ? 'Gold' : 'Diamond'}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {quizzesByType?.[qt] ? 'Story set' : 'Story missing'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Winning Number</Label>
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
                    <div className="text-sm text-zinc-200">
                      <span className="text-zinc-400">Title: </span>
                      {titleFor(qt, winningNumbers[qt]) || '—'}
                    </div>
                  </div>

                  <details className="text-xs text-zinc-400">
                    <summary className="cursor-pointer select-none">Show all titles (0–9)</summary>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-5 text-zinc-500">{i}</div>
                          <div className="text-zinc-300">{titleFor(qt, i) || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onPublishAll} disabled={busy || storiesBusy}>
              {busy ? 'Publishing…' : 'Publish All (3)'}
            </Button>
            <Button variant="outline" onClick={loadStories} disabled={storiesBusy || busy}>
              {storiesBusy ? 'Refreshing…' : 'Refresh Stories'}
            </Button>
            {err ? <div className="text-sm text-red-200">{err}</div> : null}
            {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}
          </div>

          <div className="text-xs text-zinc-400">
            Note: result publish requires stories exist for this slot (Silver/Gold/Diamond).
            <div className="mt-1">Selected slot: {formatSlotLabel(hour) || '—'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
