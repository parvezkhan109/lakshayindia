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
  const [tickets, setTickets] = useState({ SILVER: '1', GOLD: '1', DIAMOND: '1' })
  const [pick, setPick] = useState({ SILVER: '0', GOLD: '0', DIAMOND: '0' })
  const [myPlays, setMyPlays] = useState({ SILVER: null, GOLD: null, DIAMOND: null })
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

        const byQuiz = { SILVER: null, GOLD: null, DIAMOND: null }
        for (const row of mine?.rows || []) byQuiz[row.quizType] = row
        setMyPlays(byQuiz)

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

  async function play(quizType) {
    setErr('')
    setMsg('')
    try {
      await apiFetch('/api/plays', {
        method: 'POST',
        body: {
          date,
          hour: Number(hour),
          quizType,
          selectedNumber: Number(pick[quizType]),
          tickets: Number(tickets[quizType]),
        },
      })
      setMsg(`${quizType}: submitted`)

      // Optimistic UI: show what user just played immediately.
      const q = quizzes.find((x) => x.quizType === quizType)
      const selectedNumber = Number(pick[quizType])
      const selectedTitle = q?.titles?.[selectedNumber] || null
      setMyPlays((prev) => ({
        ...prev,
        [quizType]: {
          quizType,
          selectedNumber,
          selectedTitle,
          tickets: Number(tickets[quizType]),
          createdAt: new Date().toISOString(),
        },
      }))

      const locks = await apiFetch(`/api/plays/lock-status?date=${encodeURIComponent(date)}&hour=${encodeURIComponent(hour)}`)
      setLocked(locks.locked)
    } catch (e) {
      setErr(e.message)
    }
  }

  function quizPanel(qt) {
    const q = quizzes.find((x) => x.quizType === qt)
    const isLocked = !!locked[qt]
    const selected = Number(pick[qt])
    const mine = myPlays[qt]

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

              {mine ? (
                <div className="rounded-xl bg-emerald-500/5 ring-1 ring-emerald-400/15 p-3">
                  <div className="text-xs text-emerald-200">Your last play</div>
                  <div className="mt-1 text-sm text-zinc-100">
                    #{mine.selectedNumber} — {mine.selectedTitle || 'Title unavailable'}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">Tickets: {mine.tickets} • {mine.createdAt}</div>
                </div>
              ) : playsApiMissing ? (
                <div className="rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 p-3">
                  <div className="text-xs text-amber-200">Your play history not available</div>
                  <div className="mt-1 text-sm text-amber-100">Restart backend once to enable it.</div>
                </div>
              ) : null}

              <div className="text-xs text-zinc-400">Pick a title</div>
              <div className="max-h-[320px] overflow-y-auto pr-1 scroll-smooth overscroll-contain">
                <div className="grid gap-2 md:grid-cols-2">
                  {q.titles.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPick((p) => ({ ...p, [qt]: String(i) }))}
                      className={
                        i === selected
                          ? 'rounded-lg bg-amber-500/15 ring-1 ring-amber-400/40 px-3 py-2 text-left text-sm transition'
                          : 'rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/20 px-3 py-2 text-left text-sm transition'
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-zinc-400">{i}</div>
                        {i === selected ? <div className="text-[10px] font-semibold text-amber-200">SELECTED</div> : null}
                      </div>
                      <div className="text-zinc-200">{t}</div>
                      <div className="mt-1 text-[11px] text-zinc-400">Tap title to place tickets</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <div className="text-xs text-zinc-400">Selected</div>
                <div className="mt-1 text-sm text-zinc-200">
                  #{selected} — {q.titles[selected] || '—'}
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3 items-end">
                  <div className="space-y-2">
                    <div className="text-xs text-zinc-400">Tickets</div>
                    <Input
                      className="bg-zinc-950/40"
                      value={tickets[qt]}
                      onChange={(e) => setTickets((p) => ({ ...p, [qt]: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <Button disabled={isLocked} onClick={() => play(qt)}>
                      Place Tickets
                    </Button>
                    <div className="text-xs text-zinc-500">Pick by clicking a title above</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
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
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-zinc-500">Vendor can play only the current running slot.</div>
              <div className="text-xs text-zinc-600">Key: {slotKey}</div>
            </div>

            {err ? <div className="mt-3 text-sm text-red-200">{err}</div> : null}
            {msg ? <div className="mt-3 text-sm text-emerald-200">{msg}</div> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-950/55 ring-1 ring-white/12 backdrop-blur">
        <CardContent className="p-4">
          <div className="text-sm text-zinc-300 font-medium">Stories & Picks</div>
          <div className="mt-3 grid gap-4 lg:grid-cols-3 items-stretch">
            {['SILVER', 'GOLD', 'DIAMOND'].map((qt) => quizPanel(qt))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
