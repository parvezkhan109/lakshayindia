import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getAllStates, getDistricts } from 'india-state-district'

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
import { Textarea } from '@/components/ui/textarea'
import Arena3DBackground from '@/components/Arena3DBackground'
import LuckIndiaLogo from '@/components/LuckIndiaLogo'
import { apiFetch } from '@/services/api'

export default function RegisterPage() {
  const states = useMemo(() => getAllStates(), [])
  const [stateCode, setStateCode] = useState('')

  const districts = useMemo(() => {
    if (!stateCode) return []
    return getDistricts(stateCode) || []
  }, [stateCode])

  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    dob: '',
    permanentAddress: '',
    state: '',
    district: '',
    contactNumber: '',
    email: '',
    username: '',
    password: '',
    aadharCard: '',
    panCard: '',
  })

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function onStateChange(code) {
    setStateCode(code)
    const st = states.find((s) => s.code === code)
    setForm((p) => ({
      ...p,
      state: st?.name || '',
      district: '',
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setMsg('')

    if (!stateCode) {
      setBusy(false)
      setErr('Please select a state.')
      return
    }
    if (!form.district) {
      setBusy(false)
      setErr('Please select a district.')
      return
    }

    try {
      await apiFetch('/api/public/queries', {
        method: 'POST',
        auth: false,
        body: form,
      })
      setMsg('Submitted successfully. Admin will review and create your account.')
      setForm({
        name: '',
        fatherName: '',
        dob: '',
        permanentAddress: '',
        state: '',
        district: '',
        contactNumber: '',
        email: '',
        username: '',
        password: '',
        aadharCard: '',
        panCard: '',
      })
      setStateCode('')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <Arena3DBackground variant="landing" className="opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <LuckIndiaLogo className="h-12 w-12 sm:h-14 sm:w-14" />
          <div>
            <div className="text-xs tracking-[0.35em] text-zinc-300/80">LAKSHAYINDIA</div>
            <div className="text-lg font-semibold">Register</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4">
        <Card className="bg-black/30 ring-1 ring-white/12 backdrop-blur">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-semibold">Registration Form</div>
              <div className="text-sm text-zinc-300/75">
                Mandatory fields: Aadhar Card and PAN Card.
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input className="bg-zinc-950/40" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Father Name</Label>
                  <Input className="bg-zinc-950/40" value={form.fatherName} onChange={(e) => setField('fatherName', e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input className="bg-zinc-950/40" type="date" value={form.dob} onChange={(e) => setField('dob', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input className="bg-zinc-950/40" value={form.contactNumber} onChange={(e) => setField('contactNumber', e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permanent Address</Label>
                <Textarea className="bg-zinc-950/40" value={form.permanentAddress} onChange={(e) => setField('permanentAddress', e.target.value)} required />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={stateCode} onValueChange={onStateChange}>
                    <SelectTrigger className="bg-zinc-950/40">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={form.district} onValueChange={(v) => setField('district', v)} disabled={!stateCode}>
                    <SelectTrigger className="bg-zinc-950/40">
                      <SelectValue placeholder={stateCode ? 'Select district' : 'Select state first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email ID</Label>
                  <Input className="bg-zinc-950/40" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input className="bg-zinc-950/40" value={form.username} onChange={(e) => setField('username', e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input className="bg-zinc-950/40" type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Aadhar Card (mandatory)</Label>
                  <Input className="bg-zinc-950/40" value={form.aadharCard} onChange={(e) => setField('aadharCard', e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>PAN Card (mandatory)</Label>
                  <Input className="bg-zinc-950/40" value={form.panCard} onChange={(e) => setField('panCard', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label> </Label>
                  <div className="text-xs text-zinc-400 pt-2">
                    Need help? Call 9118121308 or email contact@lakshayindia.biz
                  </div>
                </div>
              </div>

              {err ? <div className="text-sm text-red-200">{err}</div> : null}
              {msg ? <div className="text-sm text-emerald-200">{msg}</div> : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={busy} className="bg-amber-500 text-black hover:bg-amber-400">
                  {busy ? 'Submitting…' : 'Submit'}
                </Button>
                <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
