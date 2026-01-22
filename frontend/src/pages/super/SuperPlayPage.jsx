import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/services/api'
import { formatSlotLabel, SLOT_OPTIONS } from '@/lib/slots'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function SuperPlayPage() {
  const [vendors, setVendors] = useState([])
  const [vendorUserId, setVendorUserId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [hour, setHour] = useState(String(new Date().getHours()))
  const [quizType, setQuizType] = useState('SILVER')
  const [selectedNumber, setSelectedNumber] = useState('0')
  const [tickets, setTickets] = useState('1')
  const [quizzes, setQuizzes] = useState([])
  const [locked, setLocked] = useState({ SILVER: false, GOLD: false, DIAMOND: false })
  const [loadingStories, setLoadingStories] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const slotKey = useMemo(() => `${vendorUserId || 'x'}-${date}-${hour}`, [vendorUserId, date, hour])

  useEffect(() => {
    apiFetch('/api/assignments/my-vendors')
      .then((d) => setVendors(d.vendors || []))
      .catch((e) => setErr(e.message))
  }, [])

  useEffect(() => {
    let cancel = false

    async function loadStoriesAndLocks() {
      if (!vendorUserId) {
        setQuizzes([])
        setLocked({ SILVER: false, GOLD: false, DIAMOND: false })
        return
      }

      setLoadingStories(true)
      setErr('')
      try {
        const qs = new URLSearchParams({ date, hour: String(Number(hour)), auto: '1' }).toString()
        const [stories, locks] = await Promise.all([
          apiFetch(`/api/stories/slot?${qs}`),
          apiFetch(
            `/api/plays/lock-status?vendorUserId=${encodeURIComponent(vendorUserId)}&date=${encodeURIComponent(date)}&hour=${encodeURIComponent(hour)}`
          ),
        ])
        if (cancel) return
        setQuizzes(stories.quizzes || [])
        setLocked(locks.locked || { SILVER: false, GOLD: false, DIAMOND: false })
      } catch (e) {
        if (!cancel) setErr(e.message)
      } finally {
        if (!cancel) setLoadingStories(false)
      }
    }

    if (date && hour !== '') loadStoriesAndLocks()
    return () => {
      cancel = true
    }
  }, [slotKey])

  const activeQuiz = useMemo(() => quizzes.find((q) => q.quizType === quizType) || null, [quizzes, quizType])
  const isLocked = !!locked[quizType]

  async function onPlay() {
    setErr('')
    setMsg('')
    try {
      const data = await apiFetch('/api/plays', {
        method: 'POST',
        body: {
          vendorUserId: Number(vendorUserId),
          date,
          hour: Number(hour),
          quizType,
          selectedNumber: Number(selectedNumber),
          tickets: Number(tickets),
        },
      })
      setMsg('Submitted')
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Super</div>
        <div className="text-2xl font-semibold">Play on behalf</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Vendor</div>
              <Select value={vendorUserId} onValueChange={setVendorUserId}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>{v.username} (#{v.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Date</div>
              <Input className="bg-zinc-950/40" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Hour</div>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>
                  {SLOT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs tracking-[0.25em] text-zinc-400">SLOT</div>
                <div className="mt-1 text-sm text-zinc-200">{formatSlotLabel(hour) || '—'}</div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={
                    isLocked
                      ? 'text-xs text-amber-200 rounded-full bg-amber-500/10 ring-1 ring-amber-400/20 px-2 py-1'
                      : 'text-xs text-emerald-200 rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/20 px-2 py-1'
                  }
                >
                  {vendorUserId ? (isLocked ? 'LOCKED' : 'OPEN') : 'SELECT VENDOR'}
                </div>
                {loadingStories ? <div className="text-xs text-zinc-500">Loading story…</div> : null}
              </div>
            </div>

            {!vendorUserId ? (
              <div className="mt-3 text-sm text-zinc-400">Select a vendor to view story & titles.</div>
            ) : !activeQuiz ? (
              <div className="mt-3 text-sm text-zinc-400">Story not set yet for this slot.</div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs text-zinc-400">Story Summary</div>
                  <details className="mt-2 rounded-xl bg-zinc-950/35 ring-1 ring-white/10 px-3 py-2">
                    <summary className="cursor-pointer select-none text-sm text-zinc-200">Preview</summary>
                    <div className="mt-2 text-sm text-zinc-200 whitespace-pre-line leading-relaxed">{activeQuiz.summary}</div>
                  </details>
                </div>

                <div>
                  <div className="text-xs text-zinc-400">Titles (tap to pick)</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {activeQuiz.titles.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedNumber(String(i))}
                        className={
                          String(i) === String(selectedNumber)
                            ? 'rounded-lg bg-amber-500/15 ring-1 ring-amber-400/40 px-3 py-2 text-left text-sm transition'
                            : 'rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/20 px-3 py-2 text-left text-sm transition'
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-zinc-400">{i}</div>
                          {String(i) === String(selectedNumber) ? (
                            <div className="text-[10px] font-semibold text-amber-200">SELECTED</div>
                          ) : null}
                        </div>
                        <div className="text-zinc-200">{t}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Quiz Type</div>
              <Select value={quizType} onValueChange={setQuizType}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="DIAMOND">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Number</div>
              <Select value={selectedNumber} onValueChange={setSelectedNumber}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>{String(i)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-[11px] text-zinc-500">Tip: you can also tap a title above.</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Tickets</div>
              <Input className="bg-zinc-950/40" value={tickets} onChange={(e) => setTickets(e.target.value)} />
            </div>
          </div>

          {err ? <div className="text-sm text-red-200">{err}</div> : null}
          {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}

          <Button onClick={onPlay} disabled={!vendorUserId || isLocked}>
            {isLocked ? 'LOCKED' : 'Place Bet'}
          </Button>

          <div className="text-xs text-zinc-400">
            If the vendor already played this quiz in this slot, you’ll see: LOCKED.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
