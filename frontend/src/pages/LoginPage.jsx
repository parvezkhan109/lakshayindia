import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
import { setSession } from '@/services/session'
import Arena3DBackground from '@/components/Arena3DBackground'
import LuckIndiaLogo from '@/components/LuckIndiaLogo'

function roleHome(role) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'SUPER') return '/super'
  return '/vendor'
}

export default function LoginPage() {
  const nav = useNavigate()

  const [role, setRole] = useState('VENDOR')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const faceMode = useMemo(() => {
    if (!passwordFocused) return 'idle'
    if (showPassword) return 'peek'
    return 'closed'
  }, [passwordFocused, showPassword])

  const canSubmit = useMemo(() => {
    return username.trim().length >= 1 && password.length >= 1 && !!role
  }, [username, password, role])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { username, password, role },
      })

      setSession({ token: data.token, user: data.user })
      nav(roleHome(data.user.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  function TelegramFace({ mode = 'idle' }) {
    const leftEye = mode === 'closed' ? 'closed' : mode === 'peek' ? 'closed' : 'open'
    const rightEye = mode === 'closed' ? 'closed' : mode === 'peek' ? 'open' : 'open'

    const handMotion = useMemo(() => {
      if (mode === 'closed') {
        return {
          left: { tx: 0, ty: 0, rot: -8 },
          right: { tx: 0, ty: 0, rot: 8 },
        }
      }
      if (mode === 'peek') {
        return {
          left: { tx: 0, ty: 0, rot: -8 },
          right: { tx: 0, ty: 9, rot: 6 },
        }
      }
      return {
        left: { tx: -6, ty: 18, rot: -14 },
        right: { tx: 6, ty: 18, rot: 14 },
      }
    }, [mode])

    return (
      <div className="select-none">
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-amber-500/30 via-emerald-500/20 to-sky-500/20 ring-1 ring-white/15 shadow-[0_16px_60px_rgba(0,0,0,0.55)] grid place-items-center">
          <svg width="56" height="56" viewBox="0 0 64 64" className="drop-shadow">
            <defs>
              <radialGradient id="faceGlow" cx="30%" cy="25%" r="80%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
              </radialGradient>
            </defs>

            <circle cx="32" cy="32" r="26" fill="rgba(24,24,27,0.92)" stroke="rgba(255,255,255,0.14)" />
            <circle cx="32" cy="32" r="26" fill="url(#faceGlow)" />

            {/* Hands (Telegram-style cover) */}
            <g
              style={{
                transform: `translate(${handMotion.left.tx}px, ${handMotion.left.ty}px) rotate(${handMotion.left.rot}deg)`,
                transformOrigin: '20px 30px',
                transition: 'transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1)',
              }}
            >
              {/* Left arm */}
              <path
                d="M10 44c4-8 10-12 16-12"
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Left hand */}
              <path
                d="M12 30c0-5 4-9 9-9h2c5 0 9 4 9 9v4c0 5-4 9-9 9h-2c-5 0-9-4-9-9v-4z"
                fill="rgba(250,204,140,0.95)"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="1"
              />
              <path
                d="M15 26h16"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M15 29h16"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            <g
              style={{
                transform: `translate(${handMotion.right.tx}px, ${handMotion.right.ty}px) rotate(${handMotion.right.rot}deg)`,
                transformOrigin: '44px 30px',
                transition: 'transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1)',
              }}
            >
              {/* Right arm */}
              <path
                d="M54 44c-4-8-10-12-16-12"
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Right hand */}
              <path
                d="M32 30c0-5 4-9 9-9h2c5 0 9 4 9 9v4c0 5-4 9-9 9h-2c-5 0-9-4-9-9v-4z"
                fill="rgba(250,204,140,0.95)"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="1"
              />
              <path
                d="M35 26h16"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M35 29h16"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {/* Eyes */}
            {leftEye === 'open' ? (
              <>
                <circle cx="24" cy="28" r="3.2" fill="rgba(255,255,255,0.92)" />
                <circle cx="25" cy="29" r="1.2" fill="rgba(0,0,0,0.8)" />
              </>
            ) : (
              <path d="M19 28c2.6 3 7.4 3 10 0" fill="none" stroke="rgba(255,255,255,0.86)" strokeWidth="2.6" strokeLinecap="round" />
            )}

            {rightEye === 'open' ? (
              <>
                <circle cx="40" cy="28" r="3.2" fill="rgba(255,255,255,0.92)" />
                <circle cx="41" cy="29" r="1.2" fill="rgba(0,0,0,0.8)" />
              </>
            ) : (
              <path d="M35 28c2.6 3 7.4 3 10 0" fill="none" stroke="rgba(255,255,255,0.86)" strokeWidth="2.6" strokeLinecap="round" />
            )}

            {/* Mouth */}
            <path
              d="M24 41c3 3.5 13 3.5 16 0"
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <Arena3DBackground variant="landing" className="opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(245,158,11,0.18),transparent_45%),radial-gradient(circle_at_80%_25%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(239,68,68,0.10),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.10)_0px,rgba(255,255,255,0.10)_1px,transparent_1px,transparent_5px)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/80" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2 md:gap-0">
            <div className="hidden md:flex flex-col justify-center rounded-l-3xl bg-white/5 ring-1 ring-white/10 px-10 py-10 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-black/30 ring-1 ring-white/10 p-3">
                  <LuckIndiaLogo className="h-12 w-12" />
                </div>
                <div>
                  <div className="text-xs tracking-[0.35em] text-zinc-300/80">LAKSHAYINDIA</div>
                  <div className="mt-1 text-2xl font-semibold tracking-wide">Game Login</div>
                </div>
              </div>

              <p className="mt-6 text-sm text-zinc-300/80">
                <span className="text-zinc-100 font-medium">Ready for the next run?</span> Enter the arena.
              </p>

              <div className="mt-8 rounded-3xl bg-black/25 ring-1 ring-white/10 px-5 py-5">
                <div className="text-xs tracking-[0.35em] text-amber-300/80">LAKSHAYINDIA</div>
                <div className="mt-2 text-lg font-semibold">
                  Play smart. Stay sharp. Win the moment.
                </div>
                <div className="mt-2 text-sm text-zinc-300/70">Fast picks • clean UI • instant vibe</div>
              </div>
            </div>

            <Card className="w-full bg-black/35 backdrop-blur ring-1 ring-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.6)] md:rounded-l-none md:rounded-r-3xl rounded-3xl">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 md:hidden">
                    <LuckIndiaLogo className="h-10 w-10" />
                    <div className="leading-tight">
                      <div className="text-xs tracking-[0.35em] text-zinc-300/80">LAKSHAYINDIA</div>
                      <div className="text-lg font-semibold tracking-wide">Sign in</div>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <div className="text-xs tracking-[0.35em] text-zinc-300/80">LAKSHAYINDIA</div>
                    <h1 className="mt-2 text-2xl font-semibold tracking-wide">Sign in</h1>
                    <p className="mt-1 text-sm text-zinc-300/70">Welcome back — continue your run.</p>
                  </div>
                </div>

                <div className="mb-6">
                  <TelegramFace mode={faceMode} />
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-white/5 border-white/15">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SUPER">Super</SelectItem>
                        <SelectItem value="VENDOR">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      className="bg-white/5 border-white/15"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-xs text-zinc-300/75 hover:text-zinc-100 underline-offset-4 hover:underline"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <Input
                      className="bg-white/5 border-white/15"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      autoComplete="current-password"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-500/30">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="w-full bg-amber-500 text-black hover:bg-amber-400"
                    disabled={!canSubmit || loading}
                  >
                    {loading ? 'Signing in…' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
