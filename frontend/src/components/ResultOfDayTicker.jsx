import { useEffect, useMemo, useState } from 'react'

import { apiFetch } from '@/services/api'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatHourRange(hour) {
  const h = Number(hour)
  if (!Number.isFinite(h)) return ''
  const next = (h + 1) % 24
  return `From ${pad2(h)}:00 hr To ${pad2(next)}:00 hr`
}

function quizLabel(qt) {
  if (qt === 'SILVER') return 'Silver Quiz'
  if (qt === 'GOLD') return 'Gold Quiz'
  return 'Diamond Quiz'
}

function quizPillClass(qt) {
  if (qt === 'SILVER') return 'bg-zinc-200/10 ring-zinc-200/20 text-zinc-200'
  if (qt === 'GOLD') return 'bg-amber-500/10 ring-amber-400/20 text-amber-200'
  return 'bg-sky-500/10 ring-sky-400/20 text-sky-200'
}

function quizDotClass(qt) {
  if (qt === 'SILVER') return 'bg-zinc-200/70'
  if (qt === 'GOLD') return 'bg-amber-400/80'
  return 'bg-sky-400/80'
}

function hasAnyPublished(row) {
  return Boolean(row?.SILVER || row?.GOLD || row?.DIAMOND)
}

export default function ResultOfDayTicker() {
  const [date] = useState(todayISO())
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const items = useMemo(() => {
    const published = (rows || []).filter((r) => hasAnyPublished(r))
    // newest first
    published.sort((a, b) => Number(b.hour) - Number(a.hour))
    // keep UI compact (marquee loops anyway)
    return published.slice(0, 10)
  }, [rows])

  useEffect(() => {
    let cancel = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch(`/api/public/results?date=${encodeURIComponent(date)}`, { auth: false })
        if (!cancel) setRows(data.rows || [])
      } catch (e) {
        if (!cancel) setError(e.message)
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 20_000)
    return () => {
      cancel = true
      clearInterval(id)
    }
  }, [date])

  const loopItems = items.length > 0 ? [...items, ...items] : []

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black/30 ring-1 ring-white/12 backdrop-blur">
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.10)_0px,rgba(255,255,255,0.10)_1px,transparent_1px,transparent_6px)]" />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs tracking-[0.35em] text-zinc-300/80">RESULT OF THE DAY</div>
            <div className="mt-2 text-xl font-semibold">Quiz Result</div>
            <div className="mt-1 text-xs text-zinc-400">Live updates • Today ({date})</div>
          </div>
          <div className="hidden sm:block rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-zinc-200">
            Auto
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="text-sm text-zinc-300">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-200">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-zinc-400">No results published yet.</div>
          ) : (
            <div className="li-pauseOnHover relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/60 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />

              <div className="h-[220px] sm:h-[240px] overflow-hidden">
                <div className="li-marqueeUpTrack">
                  {loopItems.map((r, idx) => {
                    const hour = Number(r.hour)
                    const time = Number.isFinite(hour) ? formatHourRange(hour) : '—'
                    const key = `${r.hour}-${idx}`
                    return (
                      <div key={key} className="px-4 py-4 border-b border-white/10">
                        <div className="text-xs text-zinc-400">{time}</div>

                        <div className="mt-3 space-y-3">
                          {['SILVER', 'GOLD', 'DIAMOND'].map((qt) => {
                            const v = r?.[qt]
                            return (
                              <div key={qt} className="rounded-xl bg-black/25 ring-1 ring-white/10 px-3 py-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className={`inline-flex items-center gap-2 rounded-full ring-1 px-3 py-1 text-[11px] ${quizPillClass(qt)}`}>
                                    <span className={`h-2 w-2 rounded-full ${quizDotClass(qt)}`} />
                                    {quizLabel(qt)}
                                  </div>
                                  <div className="text-[11px] text-zinc-400">Slot {pad2(hour)}:00</div>
                                </div>

                                <div className="mt-2 text-sm text-zinc-200">
                                  <span className="text-zinc-400">Result:</span>{' '}
                                  {v ? (
                                    <>
                                      <span className="font-semibold">Title {v.winningNumber}</span>{' '}
                                      <span className="text-zinc-400">(</span>
                                      <span className="text-zinc-300 line-clamp-2">{v.title || 'Title unavailable'}</span>
                                      <span className="text-zinc-400">)</span>
                                    </>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-zinc-400">
          Tip: hover/touch to pause scroll.
        </div>
      </div>
    </div>
  )
}
