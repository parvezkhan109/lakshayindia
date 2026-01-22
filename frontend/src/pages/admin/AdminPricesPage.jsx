import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/services/api'

export default function AdminPricesPage() {
  const [values, setValues] = useState({ silver: 11, gold: 55, diamond: 110 })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    apiFetch('/api/prices')
      .then((d) =>
        setValues({
          silver: d.prices.SILVER,
          gold: d.prices.GOLD,
          diamond: d.prices.DIAMOND,
        })
      )
      .catch(() => {})
  }, [])

  async function onSave() {
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await apiFetch('/api/prices', {
        method: 'PUT',
        body: {
          silver: Number(values.silver),
          gold: Number(values.gold),
          diamond: Number(values.diamond),
        },
      })
      setMsg('Prices updated')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Admin</div>
        <div className="text-2xl font-semibold">Manage Prices</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Silver (₹)</Label>
              <Input className="bg-zinc-950/40" value={values.silver} onChange={(e) => setValues((p) => ({ ...p, silver: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Gold (₹)</Label>
              <Input className="bg-zinc-950/40" value={values.gold} onChange={(e) => setValues((p) => ({ ...p, gold: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Diamond (₹)</Label>
              <Input className="bg-zinc-950/40" value={values.diamond} onChange={(e) => setValues((p) => ({ ...p, diamond: e.target.value }))} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSave} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
            {err ? <div className="text-sm text-red-200">{err}</div> : null}
            {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
