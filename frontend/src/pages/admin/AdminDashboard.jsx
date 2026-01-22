import { useEffect, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { apiFetch } from '@/services/api'

export default function AdminDashboard() {
  const [prices, setPrices] = useState(null)

  useEffect(() => {
    apiFetch('/api/prices')
      .then((d) => setPrices(d.prices))
      .catch(() => setPrices(null))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Overview</div>
        <div className="text-2xl font-semibold">Admin Dashboard</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {['SILVER', 'GOLD', 'DIAMOND'].map((k) => (
          <Card key={k} className="bg-zinc-950/40 ring-1 ring-white/10">
            <CardContent className="p-4">
              <div className="text-xs text-zinc-400">{k}</div>
              <div className="text-2xl font-semibold">₹{prices?.[k] ?? '—'}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-zinc-400">
        Next: create users, manage prices, add stories, publish results.
      </div>
    </div>
  )
}
