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
import { formatSlotLabel, SLOT_OPTIONS } from '@/lib/slots'
import { apiFetch } from '@/services/api'

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

  return {
    date: `${yyyy}-${mm}-${dd}`,
    hour: String(Number(hh)),
  }
}

function ResultCell({ v }) {
  if (!v) return <span className="text-zinc-500">—</span>
  return (
    <div className="space-y-1">
      <div className="text-lg font-semibold">{v.winningNumber}</div>
      <div className="text-xs text-zinc-300 line-clamp-2">{v.title || 'Title unavailable'}</div>
    </div>
  )
}

export default function VendorHistoryPage() {
  const indiaNow = useMemo(() => nowInIndia(), [])
  const [date, setDate] = useState(indiaNow.date)
  const [hour, setHour] = useState(indiaNow.hour)

  const [quizzes, setQuizzes] = useState([])
  const [plays, setPlays] = useState([])
  const [resultRow, setResultRow] = useState(null)

  const [playsApiMissing, setPlaysApiMissing] = useState(false)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const isCurrentSlot = useMemo(() => {
    const cur = nowInIndia()
    return cur.date === date && String(Number(cur.hour)) === String(Number(hour))
  }, [date, hour])

  useEffect(() => {
    let cancel = false

    async function load() {
      setLoading(true)
      setErr('')
      setPlaysApiMissing(false)

      try {
        const qsStories = new URLSearchParams({
          date,
          hour: String(Number(hour)),
          auto: isCurrentSlot ? '1' : '0',
        }).toString()

        const qsPlays = new URLSearchParams({
          date,
          hour: String(Number(hour)),
        }).toString()

        const results = await Promise.allSettled([
          apiFetch(`/api/stories/slot?${qsStories}`),
          apiFetch(`/api/plays/mine?${qsPlays}`),
          apiFetch(`/api/public/results?date=${encodeURIComponent(date)}`, { auth: false }),
        ])

        const stories = results[0].status === 'fulfilled' ? results[0].value : null
        const mine = results[1].status === 'fulfilled' ? results[1].value : null
        const pub = results[2].status === 'fulfilled' ? results[2].value : null

        if (results[0].status === 'rejected') throw results[0].reason
        if (results[2].status === 'rejected') throw results[2].reason

        if (results[1].status === 'rejected') {
          const status = results[1].reason?.status
          if (status === 404) setPlaysApiMissing(true)
        }

        if (cancel) return

        setQuizzes(stories?.quizzes || [])
        setPlays(mine?.rows || [])

        const targetHour = Number(hour)
        const row = (pub?.rows || []).find((r) => Number(r.hour) === targetHour) || null
        setResultRow(row)
      } catch (e) {
        if (!cancel) setErr(e.message)
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    if (date && hour !== '') load()

    return () => {
      cancel = true
    }
  }, [date, hour, isCurrentSlot])

  const playsByQuiz = useMemo(() => {
    const map = { SILVER: [], GOLD: [], DIAMOND: [] }
    for (const p of plays || []) {
      if (map[p.quizType]) map[p.quizType].push(p)
    }
    for (const qt of ['SILVER', 'GOLD', 'DIAMOND']) {
      map[qt].sort((a, b) => Number(a.selectedNumber) - Number(b.selectedNumber))
    }
    return map
  }, [plays])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">Vendor</div>
          <div className="text-2xl font-semibold">History & Results</div>
          <div className="text-sm text-zinc-400">Select date + slot to view story, your play, and published result.</div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full max-w-xs">
            <div className="text-xs text-zinc-400">Date</div>
            <Input className="mt-2 bg-zinc-950/40" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="w-full max-w-xs">
            <div className="text-xs text-zinc-400">Slot</div>
            <Select value={String(hour)} onValueChange={setHour}>
              <SelectTrigger className="mt-2 bg-zinc-950/40">
                <SelectValue placeholder="Select slot" />
              </SelectTrigger>
              <SelectContent>
                {SLOT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              const cur = nowInIndia()
              setDate(cur.date)
              setHour(cur.hour)
            }}
          >
            Jump to Current
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-950/55 ring-1 ring-white/12 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-zinc-300 font-medium">Slot</div>
            <div className="text-sm text-zinc-400">
              {date} • {formatSlotLabel(hour)}
              {isCurrentSlot ? <span className="ml-2 text-xs text-emerald-300">(current)</span> : null}
            </div>
          </div>

          {loading ? <div className="mt-3 text-sm text-zinc-400">Loading…</div> : null}
          {err ? <div className="mt-3 text-sm text-red-200">{err}</div> : null}
          {playsApiMissing ? (
            <div className="mt-3 rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20 px-3 py-2 text-sm text-amber-100">
              Your Play history service is not running yet (API missing). Restart backend once to enable it.
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {['SILVER', 'GOLD', 'DIAMOND'].map((qt) => {
              const q = (quizzes || []).find((x) => x.quizType === qt) || null
              const mine = playsByQuiz[qt]
              const result = resultRow ? resultRow[qt] : null
              const winNum = result ? Number(result.winningNumber) : null
              const didWin =
                result &&
                Number.isInteger(winNum) &&
                (mine || []).some((row) => Number(row.selectedNumber) === winNum)

              return (
                <div key={qt} className="rounded-2xl bg-zinc-950/55 ring-1 ring-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{qt}</div>
                    <div className="text-xs text-zinc-500">{q?.source ? q.source : '—'}</div>
                  </div>

                  <div className="mt-3 rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-xs text-zinc-400">Story</div>
                    <div className="mt-2 max-h-44 overflow-y-auto pr-2 text-sm text-zinc-200 whitespace-pre-line leading-relaxed scroll-smooth overscroll-contain">
                      {q?.summary || 'No story available for this slot.'}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3">
                    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                      <div className="text-xs text-zinc-400">Your Play</div>
                      {mine && mine.length > 0 ? (
                        <div className="mt-2 max-h-56 overflow-y-auto pr-1 scroll-smooth overscroll-contain space-y-2 text-sm text-zinc-200">
                          {mine.map((row) => (
                            <div
                              key={`${qt}-${row.selectedNumber}`}
                              className="rounded-lg bg-zinc-950/35 ring-1 ring-white/5 px-2 py-1.5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
                            >
                              <div className="min-w-0 break-words whitespace-normal text-zinc-200">
                                <span className="text-zinc-400">#{row.selectedNumber}</span>{' '}
                                <span className="text-zinc-600">—</span>{' '}
                                <span className="text-zinc-200">{row.selectedTitle || 'Title unavailable'}</span>
                              </div>
                              <div className="shrink-0 text-xs text-zinc-400 sm:text-right">Tickets: {row.tickets}</div>
                            </div>
                          ))}
                          <div className="pt-1 text-xs text-zinc-500">
                            Last updated: {mine[mine.length - 1]?.lastCreatedAt || mine[mine.length - 1]?.createdAt || '—'}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-zinc-500">No play found.</div>
                      )}
                    </div>

                    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                      <div className="text-xs text-zinc-400">Result</div>
                      {result ? (
                        <>
                          {didWin ? (
                            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/20 px-2 py-1 text-xs text-emerald-200">
                              You won in {qt}
                            </div>
                          ) : null}
                          <ResultCell v={result} />
                          <div className="mt-1 text-xs text-zinc-500">Published: {result.publishedAt || '—'}</div>
                        </>
                      ) : (
                        <div className="mt-1 text-sm text-zinc-500">Not published yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
