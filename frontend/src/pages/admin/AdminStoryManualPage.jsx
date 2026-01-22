import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/services/api'
import { SLOT_OPTIONS, formatSlotLabel } from '@/lib/slots'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AdminStoryManualPage() {
  const [date, setDate] = useState(todayISO())
  const [hour, setHour] = useState(String(new Date().getHours()))

  const [mode, setMode] = useState('SINGLE')

  // Single-quiz form
  const [quizType, setQuizType] = useState('SILVER')
  const [summary, setSummary] = useState('')
  const [titles, setTitles] = useState(() => Array.from({ length: 10 }, () => ''))
  const [correctNumber, setCorrectNumber] = useState('0')

  // Batch form
  const [batch, setBatch] = useState(() => ({
    SILVER: { summary: '', titles: Array.from({ length: 10 }, () => ''), correctNumber: '0' },
    GOLD: { summary: '', titles: Array.from({ length: 10 }, () => ''), correctNumber: '0' },
    DIAMOND: { summary: '', titles: Array.from({ length: 10 }, () => ''), correctNumber: '0' },
  }))
  const [suggestionsBusy, setSuggestionsBusy] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [singleSuggestion, setSingleSuggestion] = useState(null)
  const [titlesOpen, setTitlesOpen] = useState(() => ({
    SILVER: true,
    GOLD: true,
    DIAMOND: true,
  }))

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const canSubmit = useMemo(() => {
    if (!date || hour === '') return false

    if (mode === 'SINGLE') {
      return summary.trim().length >= 10 && titles.every((t) => t.trim().length >= 1)
    }

    for (const qt of ['SILVER', 'GOLD', 'DIAMOND']) {
      const q = batch[qt]
      if (!q) return false
      if (String(q.summary || '').trim().length < 10) return false
      if (!Array.isArray(q.titles) || q.titles.length !== 10) return false
      if (!q.titles.every((t) => String(t || '').trim().length >= 1)) return false
    }
    return true
  }, [date, hour, mode, summary, titles, batch])

  async function onCreate() {
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      if (mode === 'SINGLE') {
        const payload = {
          date,
          hour: Number(hour),
          quizType,
          summary,
          titles,
          correctNumber: Number(correctNumber),
        }
        const data = await apiFetch('/api/stories/manual', { method: 'POST', body: payload })
        setMsg(`Story created (id ${data.storyId})`)
      } else {
        const payload = {
          date,
          hour: Number(hour),
          quizzes: {
            SILVER: {
              summary: batch.SILVER.summary,
              titles: batch.SILVER.titles,
              correctNumber: Number(batch.SILVER.correctNumber),
            },
            GOLD: {
              summary: batch.GOLD.summary,
              titles: batch.GOLD.titles,
              correctNumber: Number(batch.GOLD.correctNumber),
            },
            DIAMOND: {
              summary: batch.DIAMOND.summary,
              titles: batch.DIAMOND.titles,
              correctNumber: Number(batch.DIAMOND.correctNumber),
            },
          },
        }
        const data = await apiFetch('/api/stories/manual-batch', { method: 'POST', body: payload })
        setMsg(`Slot stories created (slotId ${data.slotId})`)
      }
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function onLoadSuggestions() {
    setSuggestionsBusy(true)
    setErr('')
    setMsg('')
    try {
      const qs = new URLSearchParams({ date, hour: String(Number(hour)) }).toString()
      const data = await apiFetch(`/api/stories/suggestions?${qs}`)
      setSuggestions(data.suggestions || null)
      setSingleSuggestion(null)

      if (data.suggestions) {
        setBatch((prev) => ({
          ...prev,
          SILVER: {
            summary: data.suggestions.SILVER?.summary || prev.SILVER.summary,
            titles: data.suggestions.SILVER?.titles || prev.SILVER.titles,
            correctNumber: String(data.suggestions.SILVER?.correctNumber ?? prev.SILVER.correctNumber),
          },
          GOLD: {
            summary: data.suggestions.GOLD?.summary || prev.GOLD.summary,
            titles: data.suggestions.GOLD?.titles || prev.GOLD.titles,
            correctNumber: String(data.suggestions.GOLD?.correctNumber ?? prev.GOLD.correctNumber),
          },
          DIAMOND: {
            summary: data.suggestions.DIAMOND?.summary || prev.DIAMOND.summary,
            titles: data.suggestions.DIAMOND?.titles || prev.DIAMOND.titles,
            correctNumber: String(data.suggestions.DIAMOND?.correctNumber ?? prev.DIAMOND.correctNumber),
          },
        }))
        setMsg('Suggestions loaded for this slot.')
      }
    } catch (e) {
      setErr(e.message)
      setSuggestions(null)
    } finally {
      setSuggestionsBusy(false)
    }
  }

  async function onLoadSuggestionsSingle() {
    setSuggestionsBusy(true)
    setErr('')
    setMsg('')
    try {
      const qs = new URLSearchParams({ date, hour: String(Number(hour)) }).toString()
      const data = await apiFetch(`/api/stories/suggestions?${qs}`)
      const s = data?.suggestions?.[quizType] || null

      setSuggestions(data.suggestions || null)
      setSingleSuggestion(s)

      if (s) {
        setSummary(s.summary || '')
        setTitles(Array.isArray(s.titles) && s.titles.length === 10 ? s.titles : Array.from({ length: 10 }, () => ''))
        setCorrectNumber(String(s.correctNumber ?? '0'))
        setMsg('Suggestion applied to this quiz.')
      }
    } catch (e) {
      setErr(e.message)
      setSingleSuggestion(null)
    } finally {
      setSuggestionsBusy(false)
    }
  }

  function QuizEditor({ qt }) {
    const q = batch[qt]
    return (
      <Card className="bg-zinc-950/30 ring-1 ring-white/10">
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">
            {qt === 'SILVER' ? 'Silver' : qt === 'GOLD' ? 'Gold' : 'Diamond'}
          </div>

          <div className="space-y-2">
            <Label>Story Summary</Label>
            <Textarea
              className="min-h-20 bg-zinc-950/40"
              value={q.summary}
              onChange={(e) => {
                const v = e.target.value
                setBatch((prev) => ({
                  ...prev,
                  [qt]: { ...prev[qt], summary: v },
                }))
              }}
            />
          </div>

          <details
            className="text-sm"
            open={!!titlesOpen[qt]}
            onToggle={(e) => {
              const open = e.currentTarget.open
              setTitlesOpen((prev) => ({ ...prev, [qt]: open }))
            }}
          >
            <summary className="cursor-pointer select-none text-zinc-200">Titles (0–9)</summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {q.titles.map((t, i) => (
                <div key={i} className="space-y-2">
                  <Label>Title {i}</Label>
                  <Input
                    className="bg-zinc-950/40"
                    value={t}
                    onChange={(e) => {
                      const v = e.target.value
                      setBatch((prev) => {
                        const nextTitles = [...prev[qt].titles]
                        nextTitles[i] = v
                        return { ...prev, [qt]: { ...prev[qt], titles: nextTitles } }
                      })
                    }}
                  />
                </div>
              ))}
            </div>
          </details>

          <div className="space-y-2">
            <Label>Correct Answer (0-9)</Label>
            <Select
              value={q.correctNumber}
              onValueChange={(v) => setBatch((prev) => ({ ...prev, [qt]: { ...prev[qt], correctNumber: v } }))}
            >
              <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{String(i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Admin</div>
        <div className="text-2xl font-semibold">Manual Story</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input className="bg-zinc-950/40" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>
                  {SLOT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-zinc-500">Selected: {formatSlotLabel(hour) || '—'}</div>
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single Quiz</SelectItem>
                  <SelectItem value="BATCH">Slot Batch (3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === 'SINGLE' ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Quiz Type</Label>
                  <Select value={quizType} onValueChange={setQuizType}>
                    <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SILVER">Silver</SelectItem>
                      <SelectItem value="GOLD">Gold</SelectItem>
                      <SelectItem value="DIAMOND">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 flex items-end gap-3">
                  <Button variant="outline" disabled={suggestionsBusy || busy} onClick={onLoadSuggestionsSingle}>
                    {suggestionsBusy ? 'Loading…' : 'Get Suggestions (Public)'}
                  </Button>
                  {singleSuggestion?.template?.name ? (
                    <div className="pb-2 text-xs text-zinc-400">{singleSuggestion.template.name}</div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Story Summary</Label>
                <Textarea className="min-h-24 bg-zinc-950/40" value={summary} onChange={(e) => setSummary(e.target.value)} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {titles.map((t, i) => (
                  <div key={i} className="space-y-2">
                    <Label>Title {i} (number {i})</Label>
                    <Input
                      className="bg-zinc-950/40"
                      value={t}
                      onChange={(e) => {
                        const v = e.target.value
                        setTitles((prev) => {
                          const next = [...prev]
                          next[i] = v
                          return next
                        })
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3 items-end">
                <div className="space-y-2">
                  <Label>Correct Answer (0-9)</Label>
                  <Select value={correctNumber} onValueChange={setCorrectNumber}>
                    <SelectTrigger className="bg-zinc-950/40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>{String(i)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <Button disabled={!canSubmit || busy} onClick={onCreate}>
                    {busy ? 'Saving…' : 'Create Story'}
                  </Button>
                  {err ? <div className="text-sm text-red-200">{err}</div> : null}
                  {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Button variant="outline" disabled={suggestionsBusy || busy} onClick={onLoadSuggestions}>
                  {suggestionsBusy ? 'Loading…' : 'Get Suggestions (Public)'}
                </Button>
                {suggestions?.SILVER?.template?.name ? (
                  <div className="text-xs text-zinc-400">
                    {suggestions.SILVER.template.name} • {suggestions.GOLD.template.name} • {suggestions.DIAMOND.template.name}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <QuizEditor qt="SILVER" />
                <QuizEditor qt="GOLD" />
                <QuizEditor qt="DIAMOND" />
              </div>

              <div className="flex items-center gap-3">
                <Button disabled={!canSubmit || busy} onClick={onCreate}>
                  {busy ? 'Saving…' : 'Create Slot Stories (3)'}
                </Button>
                {err ? <div className="text-sm text-red-200">{err}</div> : null}
                {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}
              </div>

              <div className="text-xs text-zinc-400">
                This will create Silver/Gold/Diamond stories for the same date + time slot.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
