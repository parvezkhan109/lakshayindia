import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiFetch } from '@/services/api'

export default function AdminCreateUserPage() {
  const [role, setRole] = useState('VENDOR')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  async function onCreate(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: { username, password, role },
      })
      setMsg('User created')
      setUsername('')
      setPassword('')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Admin</div>
        <div className="text-2xl font-semibold">Create User</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5">
          <form className="space-y-4" onSubmit={onCreate}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-zinc-950/40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER">Super</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <Input className="bg-zinc-950/40" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input className="bg-zinc-950/40" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            {err ? <div className="text-sm text-red-200">{err}</div> : null}
            {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}

            <Button type="submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
