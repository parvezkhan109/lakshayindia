import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Arena3DBackground from '@/components/Arena3DBackground'
import LuckIndiaLogo from '@/components/LuckIndiaLogo'
import ResultOfDayTicker from '@/components/ResultOfDayTicker'
import { apiFetch } from '@/services/api'
import { setSession } from '@/services/session'

function roleHome(role) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'SUPER') return '/super'
  return '/vendor'
}

export default function LandingPage() {
  const nav = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const [loginRole, setLoginRole] = useState('')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginError, setLoginError] = useState('')

  const navItems = useMemo(
    () => [
      { label: 'Home', to: '/' },
      { label: 'About us', to: '/about' },
      { label: 'Games', to: '/games' },
      { label: 'Result', to: '/results' },
      { label: 'Register', to: '/register' },
      { label: 'Contact us', to: '/contact' },
    ],
    []
  )

  const faqs = useMemo(
    () => [
      {
        q: 'How to play this game?',
        a: 'Choose the best title number (0–9) for the story. Enter tickets and submit your play for Silver/Gold/Diamond.'
      },
      {
        q: 'What are Silver / Gold / Diamond?',
        a: 'These are 3 quiz categories. Each category has its own result and ticket totals.'
      },
      {
        q: 'When does result come?',
        a: 'Results are published slot-wise. Check “Result of the Day” box for the latest published slot.'
      },
      {
        q: 'Do I need to register?',
        a: 'Yes. Submit the register form and Admin will review and create your login.'
      },
    ],
    []
  )

  async function onQuickLogin(e) {
    e.preventDefault()
    setLoginError('')

    if (!loginRole) {
      setLoginError('Please select a role')
      return
    }

    setLoginBusy(true)
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { username: loginUsername, password: loginPassword, role: loginRole },
      })
      setSession({ token: data.token, user: data.user })
      nav(roleHome(data.user.role), { replace: true })
    } catch (err) {
      setLoginError(err.message || 'Login failed')
    } finally {
      setLoginBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* 3D pro-game atmosphere (original gradients + subtle grain) */}
      <div className="pointer-events-none absolute inset-0">
        <Arena3DBackground variant="landing" className="opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(245,158,11,0.20),transparent_44%),radial-gradient(circle_at_80%_18%,rgba(16,185,129,0.16),transparent_48%),radial-gradient(circle_at_55%_82%,rgba(59,130,246,0.12),transparent_52%)]" />
        {/* Contrast veil to keep text always readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75" />
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.10)_0px,rgba(255,255,255,0.10)_1px,transparent_1px,transparent_4px)]" />
        <div className="li-glowPulse absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-amber-500/10" />
        <div className="li-glowPulse absolute -bottom-60 right-[-180px] h-[620px] w-[620px] rounded-full bg-emerald-500/10" />
        <div className="li-glowPulse absolute -bottom-40 left-[-160px] h-[520px] w-[520px] rounded-full bg-sky-500/10" />

        {/* Orbit rings */}
        <div className="absolute left-1/2 top-28 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/10 opacity-30 li-spinSlow" />
        <div className="absolute left-1/2 top-28 h-[440px] w-[440px] -translate-x-1/2 rounded-full border border-white/10 opacity-20 li-spinSlow [animation-duration:34s]" />
        <div className="absolute left-1/2 top-28 h-[360px] w-[360px] -translate-x-1/2 rounded-full border border-white/10 opacity-15 li-spinSlow [animation-duration:46s]" />
      </div>

      <header className="sticky top-0 z-30">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* 3D glass slab (tilted) */}
            <div className="absolute -inset-x-10 -top-10 h-[160%] [transform:perspective(900px)_rotateX(18deg)] origin-top">
              <img
                src="/hero-strip.svg"
                alt=""
                className="h-full w-full object-cover opacity-35"
                decoding="async"
                loading="eager"
                draggable={false}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(245,158,11,0.28),transparent_48%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.22),transparent_46%),radial-gradient(circle_at_60%_90%,rgba(16,185,129,0.18),transparent_52%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/62 to-black/75" />
            </div>

            {/* Gloss + depth lights */}
            <div className="absolute inset-0 backdrop-blur-2xl" />
            <div className="absolute -top-16 left-10 h-40 w-72 rounded-full bg-amber-400/12 blur-3xl" />
            <div className="absolute -top-20 right-8 h-44 w-80 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-44 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

            {/* Glass shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:py-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center sm:items-start">
                <div className="[transform:perspective(900px)_rotateX(10deg)_rotateY(-14deg)]">
                  <LuckIndiaLogo className="h-20 w-20 sm:h-24 sm:w-24 scale-[1.85] origin-center sm:origin-left" />
                </div>
                <div className="mt-1 leading-tight text-center sm:text-left">
                  <div className="text-sm sm:text-base font-semibold text-amber-300 tracking-wide">LAKSHAY INDIA</div>
                  <div className="mt-0.5 text-[10px] sm:text-[11px] text-amber-200/90 tracking-[0.18em] uppercase">
                    WHERE STORIES BEGIN &amp; DESTINIES ARE CHOSEN
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop top navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  className="rounded-full px-3 py-2 text-sm text-zinc-200/90 hover:bg-white/8"
                >
                  {it.label}
                </Link>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" className="hidden sm:inline-flex border border-white/15 bg-white/5 hover:bg-white/10">
                <Link to="/results">Results</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex bg-amber-500 text-black hover:bg-amber-400">
                <Link to="/login">Login</Link>
              </Button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/12 hover:bg-white/10"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-zinc-200" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile right-side menu */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-zinc-950/90 backdrop-blur ring-1 ring-white/10">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <LuckIndiaLogo className="h-14 w-14" />
                <div>
                  <div className="text-xs tracking-[0.35em] text-zinc-300/80">MENU</div>
                  <div className="text-sm font-semibold text-amber-300">LAKSHAY INDIA</div>
                  <div className="mt-0.5 text-[10px] text-amber-200/90 tracking-[0.18em] uppercase">WHERE STORIES BEGIN &amp; DESTINIES ARE CHOSEN</div>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/12 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-zinc-200" />
              </button>
            </div>

            <div className="px-3 py-3">
              {navItems.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm text-zinc-100/90 hover:bg-white/8"
                >
                  {it.label}
                </Link>
              ))}
            </div>

            <div className="px-4 py-4 border-t border-white/10">
              <div className="text-xs text-zinc-400">Contact</div>
              <div className="mt-1 text-sm text-zinc-200">9118121308</div>
              <div className="mt-1 text-sm text-zinc-200">contact@lakshayindia.biz</div>
            </div>
          </div>
        </div>
      ) : null}

      <main className="relative mx-auto max-w-7xl px-4 py-4 md:py-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 items-start">
            {/* LEFT COLUMN: Welcome + Quick Login */}
            <div className="order-2 md:order-1 space-y-5">
              <Card className="bg-black/25 ring-1 ring-white/10 backdrop-blur">
                <CardContent className="p-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/12 px-4 py-2 text-xs text-zinc-200/90 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.70)]" />
                    Live Results • Stories • Titles
                  </div>

                  <div className="mt-3 text-xs tracking-[0.5em] text-zinc-400">WELCOME TO</div>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    Lakshay
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-200">
                      India
                    </span>
                  </h1>

                  <div className="mt-3">
                    <div className="text-base font-semibold">Welcome to Lakshay India!</div>
                    <p className="mt-2 text-sm text-zinc-300/80 leading-relaxed">
                      Education game with creative fun — select the best story title from multiple titles.
                    </p>
                    <p className="mt-2 text-sm text-zinc-300/80 leading-relaxed">
                      Try the latest game and check how lucky you are.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
                        <Link to="/register">Register</Link>
                      </Button>
                      <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                        <Link to="/contact">Contact</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/25 ring-1 ring-white/10 backdrop-blur">
                <CardContent className="p-5">
                  <div className="text-xs tracking-[0.35em] text-zinc-300/80">LOGIN</div>
                  <div className="mt-2 text-lg font-semibold">Quick Login</div>
                  <div className="mt-1 text-xs text-zinc-400">You can login from here also.</div>

                  <form onSubmit={onQuickLogin} className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={loginRole || undefined} onValueChange={setLoginRole}>
                          <SelectTrigger className="bg-zinc-950/40"><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VENDOR">Vendor</SelectItem>
                            <SelectItem value="SUPER">Super</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-1">
                        <Label>Username</Label>
                        <Input className="bg-zinc-950/40" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                      </div>
                      <div className="space-y-2 sm:col-span-1">
                        <Label>Password</Label>
                        <Input className="bg-zinc-950/40" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                      </div>
                    </div>

                    {loginError ? <div className="text-sm text-red-200">{loginError}</div> : null}

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="submit"
                        disabled={loginBusy || !loginRole || !loginUsername.trim() || !loginPassword}
                        className="bg-amber-500 text-black hover:bg-amber-400"
                      >
                        {loginBusy ? 'Logging in…' : 'Login'}
                      </Button>
                      <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                        <Link to="/register">New user? Register</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Results + FAQs */}
            <div className="order-1 md:order-2 space-y-5">
              <ResultOfDayTicker />

              <Card className="bg-black/25 ring-1 ring-white/10 backdrop-blur">
                <CardContent className="p-5">
                  <div className="text-xs tracking-[0.35em] text-zinc-300/80">FAQS</div>
                  <div className="mt-2 text-lg font-semibold">Frequently Asked Questions</div>
                  <div className="mt-4 space-y-3">
                    {faqs.map((it) => (
                      <div key={it.q} className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                        <div className="text-sm font-semibold text-zinc-100">{it.q}</div>
                        <div className="mt-1 text-sm text-zinc-300/80">{it.a}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-6">
        <div className="mx-auto max-w-7xl px-4 pb-8">
          <div className="overflow-hidden rounded-3xl bg-black/25 ring-1 ring-white/10 backdrop-blur">
            <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />

            <div className="grid gap-8 p-6 md:grid-cols-4 md:gap-10 md:p-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="[transform:perspective(900px)_rotateX(10deg)_rotateY(-14deg)]">
                    <LuckIndiaLogo className="h-14 w-14 scale-[1.35] origin-left" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-amber-300 tracking-wide">LAKSHAY INDIA</div>
                    <div className="mt-0.5 text-[11px] text-amber-200/90 tracking-[0.18em] uppercase">
                      WHERE STORIES BEGIN &amp; DESTINIES ARE CHOSEN
                    </div>
                    <div className="mt-3 text-sm text-zinc-300/80 leading-relaxed max-w-xl">
                      A story-title based education game with live results, multiple quiz categories and a smooth, secure admin workflow.
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <div className="text-xs tracking-[0.35em] text-zinc-300/80">QUICK LINKS</div>
                <div className="mt-4 space-y-2 text-sm">
                  <Link className="block text-zinc-200/90 hover:text-white" to="/">Home</Link>
                  <Link className="block text-zinc-200/90 hover:text-white" to="/about">About us</Link>
                  <Link className="block text-zinc-200/90 hover:text-white" to="/games">Games</Link>
                  <Link className="block text-zinc-200/90 hover:text-white" to="/results">Result</Link>
                </div>
              </div>

              {/* Support */}
              <div>
                <div className="text-xs tracking-[0.35em] text-zinc-300/80">SUPPORT</div>
                <div className="mt-4 space-y-2 text-sm">
                  <Link className="block text-zinc-200/90 hover:text-white" to="/register">Register</Link>
                  <Link className="block text-zinc-200/90 hover:text-white" to="/login">Login</Link>
                  <Link className="block text-zinc-200/90 hover:text-white" to="/contact">Contact us</Link>
                </div>

                <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                  <div className="text-xs text-zinc-400">Help Desk</div>
                  <div className="mt-1 text-sm text-zinc-200">9118121308</div>
                  <div className="mt-1 text-sm text-zinc-200">contact@lakshayindia.biz</div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-col gap-2 px-6 py-4 text-xs text-zinc-400 md:flex-row md:items-center md:justify-between md:px-8">
              <div>Copyright 2026 LAKSHAYINDIA. All rights reserved.</div>
              <div className="text-zinc-400/80">Built for speed • security • clarity</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
