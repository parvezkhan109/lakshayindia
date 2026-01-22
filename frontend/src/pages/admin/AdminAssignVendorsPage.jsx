import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/services/api'

export default function AdminAssignVendorsPage() {
  const [supers, setSupers] = useState([])
  const [vendors, setVendors] = useState([])
  const [assignments, setAssignments] = useState([])
  const [superId, setSuperId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    const [su, ve, as] = await Promise.all([
      apiFetch('/api/users?role=SUPER'),
      apiFetch('/api/users?role=VENDOR'),
      apiFetch('/api/assignments'),
    ])
    setSupers(su.users || [])
    setVendors(ve.users || [])
    setAssignments(as.assignments || [])
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message))
  }, [])

  async function onAssign() {
    setErr('')
    setMsg('')
    try {
      await apiFetch('/api/assignments', {
        method: 'POST',
        body: { superUserId: Number(superId), vendorUserId: Number(vendorId) },
      })
      setMsg('Assigned')
      await load()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Admin</div>
        <div className="text-2xl font-semibold">Assign Vendors</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Super</div>
              <Select value={superId} onValueChange={setSuperId}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue placeholder="Select super" /></SelectTrigger>
                <SelectContent>
                  {supers.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.username} (#{u.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Vendor</div>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger className="bg-zinc-950/40"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.username} (#{u.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={onAssign} disabled={!superId || !vendorId}>
                Assign
              </Button>
            </div>
          </div>

          {err ? <div className="text-sm text-red-200">{err}</div> : null}
          {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-2">Super</th>
                  <th className="py-2">Vendor</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody className="text-zinc-200">
                {assignments.map((a) => (
                  <tr key={a.id} className="border-t border-white/10">
                    <td className="py-2">{a.super_username} (#{a.super_user_id})</td>
                    <td className="py-2">{a.vendor_username} (#{a.vendor_user_id})</td>
                    <td className="py-2 text-zinc-400">{a.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
