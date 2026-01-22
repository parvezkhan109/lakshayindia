import { useEffect, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { apiFetch } from '@/services/api'

export default function SuperVendorsPage() {
  const [vendors, setVendors] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    apiFetch('/api/assignments/my-vendors')
      .then((d) => setVendors(d.vendors || []))
      .catch((e) => setErr(e.message))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Super</div>
        <div className="text-2xl font-semibold">My Vendors</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5">
          {err ? (
            <div className="text-sm text-red-200">{err}</div>
          ) : vendors.length === 0 ? (
            <div className="text-sm text-zinc-400">No vendors assigned yet.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {vendors.map((v) => (
                <li key={v.id} className="rounded-xl bg-white/5 px-3 py-2">
                  {v.username} (#{v.id})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
