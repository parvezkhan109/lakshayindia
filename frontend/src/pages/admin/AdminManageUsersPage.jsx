import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/services/api'

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [resetPwd, setResetPwd] = useState({})

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const data = await apiFetch('/api/users')
      setUsers(data.users || [])
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function doReset(id) {
    const password = resetPwd[id]
    if (!password || password.length < 6) {
      setErr('Password must be at least 6 chars')
      return
    }
    await apiFetch(`/api/users/${id}/reset-password`, { method: 'POST', body: { password } })
    setResetPwd((p) => ({ ...p, [id]: '' }))
  }

  async function doDelete(id) {
    if (!confirm('Delete user?')) return
    await apiFetch(`/api/users/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Admin</div>
        <div className="text-2xl font-semibold">Manage Users</div>
      </div>

      <Card className="bg-zinc-950/40 ring-1 ring-white/10">
        <CardContent className="p-5">
          {loading ? (
            <div className="text-sm text-zinc-300">Loading…</div>
          ) : err ? (
            <div className="text-sm text-red-200">{err}</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="py-2">ID</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Username</th>
                    <th className="py-2">Reset Password</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-200">
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-white/10">
                      <td className="py-2 pr-3">{u.id}</td>
                      <td className="py-2 pr-3">{u.role}</td>
                      <td className="py-2 pr-3">{u.username}</td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <Input
                            className="h-9 w-44 bg-zinc-950/40"
                            type="password"
                            placeholder="new password"
                            value={resetPwd[u.id] || ''}
                            onChange={(e) => setResetPwd((p) => ({ ...p, [u.id]: e.target.value }))}
                          />
                          <Button variant="secondary" onClick={() => doReset(u.id)}>
                            Reset
                          </Button>
                        </div>
                      </td>
                      <td className="py-2">
                        <Button variant="destructive" onClick={() => doDelete(u.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
