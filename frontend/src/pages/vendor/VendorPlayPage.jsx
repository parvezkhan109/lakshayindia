import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Arena3DBackground from '@/components/Arena3DBackground'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/services/api'
import { formatSlotLabel } from '@/lib/slots'

function nowInIndia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())

  const get = (type) => parts.find((p) => p.type === type)?.value
  const yyyy = get('year')
  const mm = get('month')
  const dd = get('day')
  const hh = get('hour')

  return { date: `${yyyy}-${mm}-${dd}`, hour: String(Number(hh)) }
}

function todayISO() {
  return nowInIndia().date
}

function currentSlot() {
  return nowInIndia()
}

export default function VendorPlayPage() {
  const [date, setDate] = useState(todayISO())
  const [hour, setHour] = useState(currentSlot().hour)
  const [quizzes, setQuizzes] = useState([])
  const [locked, setLocked] = useState({ SILVER: false, GOLD: false, DIAMOND: false })
  const [showAddTicket, setShowAddTicket] = useState(false)
  const [ticketGrid, setTicketGrid] = useState({
    SILVER: Array.from({ length: 10 }, () => ''),
    GOLD: Array.from({ length: 10 }, () => ''),
    DIAMOND: Array.from({ length: 10 }, () => ''),
  })
  const [myTickets, setMyTickets] = useState({
    SILVER: Array.from({ length: 10 }, () => 0),
    GOLD: Array.from({ length: 10 }, () => 0),
    DIAMOND: Array.from({ length: 10 }, () => 0),
  })
  const [playsApiMissing, setPlaysApiMissing] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const [refreshSeq, setRefreshSeq] = useState(0)

  const slotKey = useMemo(() => `${date}-${hour}`, [date, hour])

  // Vendor can play ONLY current time slot.
  useEffect(() => {
    const sync = () => {
      const s = currentSlot()
      setDate(s.date)
      setHour(s.hour)
    }

    sync()
    const id = setInterval(sync, 30 * 1000)
    return () => clearInterval(id)
  }, [])

  // Poll current slot to pick up newly-created stories/results without forcing a full reload.
  useEffect(() => {
    const id = setInterval(() => setRefreshSeq((s) => s + 1), 12 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancel = false

    async function load() {
      setErr('')
      setPlaysApiMissing(false)
      try {
        const results = await Promise.allSettled([
          apiFetch(`/api/stories/slot?date=${encodeURIComponent(date)}&hour=${encodeURIComponent(hour)}&auto=1`),
          apiFetch(`/api/plays/lock-status?date=${encodeURIComponent(date)}&hour=${encodeURIComponent(hour)}`),
          apiFetch(`/api/plays/mine?date=${encodeURIComponent(date)}&hour=${encodeURIComponent(hour)}`),
        ])

        const stories = results[0].status === 'fulfilled' ? results[0].value : null
        const locks = results[1].status === 'fulfilled' ? results[1].value : null
        const mine = results[2].status === 'fulfilled' ? results[2].value : null

        if (results[0].status === 'rejected') throw results[0].reason
        if (results[1].status === 'rejected') throw results[1].reason
        if (cancel) return
        setQuizzes(stories?.quizzes || [])
        setLocked(locks?.locked || { SILVER: false, GOLD: false, DIAMOND: false })

        const nextMy = {
          SILVER: Array.from({ length: 10 }, () => 0),
          GOLD: Array.from({ length: 10 }, () => 0),
          DIAMOND: Array.from({ length: 10 }, () => 0),
        }
        for (const row of mine?.rows || []) {
          const qt = row.quizType
          const n = Number(row.selectedNumber)
          const tk = Number(row.tickets || 0)
          if (!nextMy[qt]) continue
          if (!Number.isInteger(n) || n < 0 || n > 9) continue
          nextMy[qt][n] = tk
        }
        setMyTickets(nextMy)

        if (results[2].status === 'rejected') {
          const status = results[2].reason?.status
          if (status === 404) setPlaysApiMissing(true)
        }
      } catch (e) {
        if (!cancel) setErr(e.message)
      }
    }

    if (date && hour !== '') load()
    return () => {
      cancel = true
    }
  }, [slotKey, refreshSeq])

  async function submitQuiz(qt) {
    setErr('')
    setMsg('')

    const items = []
    for (let i = 0; i < 10; i++) {
      const raw = String(ticketGrid[qt]?.[i] ?? '').trim()
      if (!raw) continue
      const tk = Number(raw)
      if (!Number.isInteger(tk) || tk <= 0) {
        setErr(`${qt}: tickets must be a positive integer (number ${i})`)
        return
      }
      items.push({ quizType: qt, selectedNumber: i, tickets: tk })
    }

    if (items.length === 0) {
      setErr(`${qt}: add at least 1 ticket in any box.`)
      return
    }

    try {
      await apiFetch('/api/plays/bulk', {
        method: 'POST',
        body: {
          date,
          hour: Number(hour),
          plays: items,
        },
      })

      setMsg(`${qt}: tickets added (${items.length} selection(s))`)

      // Clear inputs for this quiz (inputs represent "add more")
      setTicketGrid((prev) => ({
        ...prev,
        [qt]: Array.from({ length: 10 }, () => ''),
      }))

      // Trigger refresh to show updated totals
      setRefreshSeq((s) => s + 1)
    } catch (e) {
      if (e?.status === 409) {
        const closed = e?.data?.closed
        const isThisClosed = Array.isArray(closed) ? closed.includes(qt) : true
        if (isThisClosed) {
          setLocked((prev) => ({ ...prev, [qt]: true }))
        }
      }
      setErr(e.message)
    }
  }

  function quizPanelDisplayOnly(qt) {
    const q = quizzes.find((x) => x.quizType === qt)
    const isLocked = !!locked[qt]

    return (
      <div key={qt} className="h-full rounded-2xl bg-zinc-950/55 ring-1 ring-white/10 backdrop-blur">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{qt}</div>
            <div
              className={
                isLocked
                  ? 'text-xs text-amber-200 rounded-full bg-amber-500/10 ring-1 ring-amber-400/20 px-2 py-1'
                  : 'text-xs text-emerald-200 rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/20 px-2 py-1 li-float2'
              }
            >
              {isLocked ? 'LOCKED' : 'OPEN'}
            </div>
          </div>

          {!q ? (
            <div className="text-sm text-zinc-400">Story not set yet for this slot.</div>
          ) : (
            <>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <div className="text-xs text-zinc-400">Story</div>
                <div className="mt-2 max-h-44 overflow-y-auto pr-2 text-sm text-zinc-200 whitespace-pre-line leading-relaxed scroll-smooth overscroll-contain">
                  {q.summary}
                </div>
              </div>

              {playsApiMissing ? (
                <div className="rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 p-3">
                  <div className="text-xs text-amber-200">Your play history not available</div>
                  <div className="mt-1 text-sm text-amber-100">Restart backend once to enable it.</div>
                </div>
              ) : null}

              <div className="text-xs text-zinc-400">Titles (0-9)</div>
              <div className="mt-2 max-h-[420px] overflow-y-auto pr-1 scroll-smooth overscroll-contain">
                <div className="space-y-2">
                  {q.titles.map((t, i) => (
                    <div key={i} className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                      <div className="text-xs text-zinc-400">{i}</div>
                      <div className="text-sm text-zinc-200">{t}</div>
                    </div>
                  ))}
                </div>
              </div>

              {isLocked ? (
                <div className="text-xs text-amber-200">Result published: {qt} is locked.</div>
              ) : (
                <div className="text-xs text-zinc-500">Use “Add Ticket” to play.</div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  function addTicketPanel() {
    return (
      <Card className="bg-zinc-950/55 ring-1 ring-white/12 backdrop-blur">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-300 font-medium">Add Ticket</div>
              <div className="text-xs text-zinc-500">Enter tickets for 0-9 numbers, then click Play for each quiz.</div>
            </div>
            <Button variant="secondary" onClick={() => setShowAddTicket(false)}>
              Close
            </Button>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3 items-stretch">
            {['SILVER', 'GOLD', 'DIAMOND'].map((qt) => {
              const isLocked = !!locked[qt]
              const grid = ticketGrid[qt]
              const already = myTickets[qt]

              return (
                <div key={`add-${qt}`} className="h-full rounded-2xl bg-zinc-950/55 ring-1 ring-white/10">
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold">{qt}</div>
                      <div
                        className={
                          isLocked
                            ? 'text-xs text-amber-200 rounded-full bg-amber-500/10 ring-1 ring-amber-400/20 px-2 py-1'
                            : 'text-xs text-emerald-200 rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/20 px-2 py-1'
                        }
                      >
                        {isLocked ? 'LOCKED' : 'OPEN'}
                      </div>
                    </div>

                    <>
                      <div className="text-xs text-zinc-400">0-9 Numbers</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
                          <div
                            key={`${qt}-${i}`}
                            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-2 py-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs text-zinc-200 font-semibold w-4">{i}</div>
                              <Input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                className="h-7 bg-zinc-950/40 px-2 text-sm"
                                value={grid?.[i] ?? ''}
                                onChange={(e) => {
                                  const v = e.target.value
                                  setTicketGrid((prev) => {
                                    const next = { ...prev }
                                    next[qt] = [...next[qt]]
                                    next[qt][i] = v
                                    return next
                                  })
                                }}
                                disabled={isLocked}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <Button disabled={isLocked} onClick={() => submitQuiz(qt)}>
                            {isLocked ? 'LOCKED' : `Play (${qt})`}
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={isLocked}
                            onClick={() =>
                              setTicketGrid((prev) => ({
                                ...prev,
                                [qt]: Array.from({ length: 10 }, () => ''),
                              }))
                            }
                          >
                            Clear
                          </Button>
                        </div>
                    </>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative space-y-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <Arena3DBackground variant="vendor" className="opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.16),transparent_44%),radial-gradient(circle_at_75%_25%,rgba(16,185,129,0.14),transparent_48%),radial-gradient(circle_at_55%_85%,rgba(59,130,246,0.10),transparent_52%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/70" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_4px)]" />
        <div className="li-glowPulse absolute -top-32 right-[-120px] h-[520px] w-[520px] rounded-full bg-amber-500/10" />
        <div className="li-glowPulse absolute -bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full bg-emerald-500/10" />
      </div>

      <div>
        <Card className="bg-zinc-950/75 ring-1 ring-white/12 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm text-zinc-400">Vendor</div>
                <div className="text-2xl font-semibold">Play (Hourly Slot)</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400">Current Slot</div>
                <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                  <div className="rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-200">{date}</div>
                  <div className="rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-200">{formatSlotLabel(hour)}</div>
                  <Button
                    variant="secondary"
                    className="pointer-events-auto"
                    onClick={() => setShowAddTicket((v) => !v)}
                  >
                    {showAddTicket ? 'Hide Add Ticket' : 'Add Ticket'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-zinc-600">Key: {slotKey}</div>
            </div>

            {err ? <div className="mt-3 text-sm text-red-200">{err}</div> : null}
            {msg ? <div className="mt-3 text-sm text-emerald-200">{msg}</div> : null}
          </CardContent>
        </Card>
      </div>

      {showAddTicket ? addTicketPanel() : null}

      {!showAddTicket ? (
        <Card className="bg-zinc-950/55 ring-1 ring-white/12 backdrop-blur">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-300 font-medium">Stories & Picks</div>
            <div className="mt-3 grid gap-4 lg:grid-cols-3 items-stretch">
              {['SILVER', 'GOLD', 'DIAMOND'].map((qt) => quizPanelDisplayOnly(qt))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
