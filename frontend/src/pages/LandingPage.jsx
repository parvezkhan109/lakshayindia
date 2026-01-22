import { Link } from 'react-router-dom'
import { Globe2, ShieldCheck, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Arena3DBackground from '@/components/Arena3DBackground'
import GameRunBanner from '@/components/GameRunBanner'
import LuckIndiaLogo from '@/components/LuckIndiaLogo'

export default function LandingPage() {
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
          <div className="pointer-events-none absolute inset-0 bg-black/40 backdrop-blur-xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="[transform:perspective(900px)_rotateX(10deg)_rotateY(-14deg)]">
            <LuckIndiaLogo className="h-11 w-11" />
          </div>
          <div className="leading-tight">
            <div className="text-xs tracking-[0.35em] text-zinc-300/80">LAKSHAYINDIA</div>
            <div className="text-lg font-semibold tracking-wide">LakshayIndia</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="secondary">
            <Link to="/results">View Results</Link>
          </Button>
          <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
            <Link to="/login">Login</Link>
          </Button>
        </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/12 px-4 py-2 text-xs text-zinc-200/90 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.70)]" />
                Live now • fast picks • smooth experience
              </div>

              <div className="mt-6 text-xs tracking-[0.5em] text-zinc-400">LAKSHAYINDIA</div>
              <h1 className="mt-3 text-5xl font-bold tracking-tight md:text-7xl">
                Lakshay
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-200">
                  India
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm text-zinc-300/80 md:text-base">
                Pick your title. Lock your move. Stay ahead.
                <span className="text-zinc-200"> </span>
                A premium, game-style experience built for speed and confidence.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="bg-amber-500 text-black hover:bg-amber-400">
                  <Link to="/login">Enter Arena</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                  <Link to="/results">Results</Link>
                </Button>
              </div>

              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                {[{
                  k: 'FAST',
                  v: 'Quick picks',
                }, {
                  k: 'CLEAN',
                  v: 'No clutter',
                }, {
                  k: 'LIVE',
                  v: 'Always on',
                }].map((x) => (
                  <div key={x.k} className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3 backdrop-blur">
                    <div className="text-xs tracking-[0.25em] text-zinc-400">{x.k}</div>
                    <div className="mt-1 text-sm font-medium text-zinc-100">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-amber-500/10 blur-2xl" />
              <div className="absolute -inset-8 rounded-3xl bg-emerald-500/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl bg-black/30 ring-1 ring-white/12 backdrop-blur">
                <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.10)_0px,rgba(255,255,255,0.10)_1px,transparent_1px,transparent_6px)]" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs tracking-[0.35em] text-zinc-300/80">GAME LOBBY</div>
                      <div className="mt-2 text-2xl font-semibold">Pick • Lock • Win</div>
                      <div className="mt-1 text-sm text-zinc-300/70">
                        A premium board designed to keep you focused.
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-zinc-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                      Live
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      { t: 'SILVER', c: 'from-zinc-200/10 to-zinc-200/0' },
                      { t: 'GOLD', c: 'from-amber-400/15 to-amber-400/0' },
                      { t: 'DIAMOND', c: 'from-sky-400/15 to-sky-400/0' },
                    ].map((x) => (
                      <div key={x.t} className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs tracking-[0.25em] text-zinc-300/90">{x.t}</div>
                          <div className={`h-8 w-24 rounded-full bg-gradient-to-r ${x.c}`} />
                        </div>
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {Array.from({ length: 10 }).slice(0, 5).map((_, i) => (
                            <div
                              key={i}
                              className="h-9 rounded-xl bg-black/25 ring-1 ring-white/10"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-300/70">
                    <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1">Fast moves</span>
                    <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1">Clean focus</span>
                    <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1">Smooth vibe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <GameRunBanner />
          </div>

          {/* Feature strip */}
          <div className="mt-10 grid gap-4 md:grid-cols-3 text-left">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20">
                  <Zap className="h-5 w-5 text-amber-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Lightning-fast picks</div>
                  <div className="text-xs text-zinc-400">Move quickly with confidence</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-300/80">
                Built to feel like a real game: faster decisions, smoother flow, zero confusion.
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Trusted access</div>
                  <div className="text-xs text-zinc-400">Clear roles • clean control</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-300/80">
                Simple sign-in and dashboards made for focus — nothing extra, just what you need.
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-400/20">
                  <Globe2 className="h-5 w-5 text-sky-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Fresh story energy</div>
                  <div className="text-xs text-zinc-400">Worldwide-inspired themes</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-300/80">
                Short-story style narratives with global themes — so every round feels fresh.
              </div>
            </div>
          </div>

          {/* Eye-comfort VS section */}
          <div className="mt-12">
            <div className="mx-auto max-w-4xl rounded-3xl bg-black/25 ring-1 ring-white/10 backdrop-blur px-5 py-6">
              <div className="text-xs tracking-[0.35em] text-zinc-400">APPS IN ARENA</div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">Vendor App vs Arena Hub</div>
              <div className="mt-1 text-sm text-zinc-400">Comfort view • soft glow • 3D depth</div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_140px_1fr] items-center">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 text-left [transform:perspective(900px)_rotateY(8deg)_rotateX(10deg)] li-float">
                  <div className="text-xs tracking-[0.25em] text-emerald-300/80">VENDOR APP</div>
                  <div className="mt-2 text-xl font-semibold">Pick Title</div>
                  <div className="mt-1 text-sm text-zinc-400">Tap a story title and place tickets instantly.</div>
                  <div className="mt-4 inline-flex items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/20 px-3 py-1 text-xs text-emerald-200">LIVE SLOT</div>
                </div>

                <div className="relative mx-auto h-28 w-28">
                  <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl li-glowPulse" />
                  <div className="absolute inset-2 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur flex items-center justify-center [transform:perspective(900px)_rotateX(18deg)]">
                    <div className="text-xs tracking-[0.45em] text-zinc-200">VS</div>
                  </div>
                  <div className="absolute -inset-6 rounded-full border border-white/10 opacity-40 li-spinSlow" />
                </div>

                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 text-left [transform:perspective(900px)_rotateY(-8deg)_rotateX(10deg)] li-float2">
                  <div className="text-xs tracking-[0.25em] text-amber-300/80">PLAY • TRACK • WIN</div>
                  <div className="mt-2 text-xl font-semibold">The Arena Never Sleeps</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    Fast picks, smooth gameplay, and instant updates — powered by LakshayIndia.
                  </div>
                  <div className="mt-4 inline-flex items-center rounded-full bg-amber-500/10 ring-1 ring-amber-400/20 px-3 py-1 text-xs text-amber-200">LIVE EXPERIENCE</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {["SILVER", "GOLD", "DIAMOND"].map((x) => (
              <div
                key={x}
                className="rounded-2xl bg-white/5 ring-1 ring-white/10 px-5 py-6 text-left backdrop-blur [transform:perspective(900px)_rotateX(10deg)] hover:[transform:perspective(900px)_rotateX(6deg)_rotateY(2deg)] transition duration-300 li-float"
              >
                <div className="text-xs tracking-[0.25em] text-zinc-400">{x}</div>
                <div className="mt-2 text-lg font-semibold text-zinc-100">Arena Slot</div>
                <div className="mt-1 text-sm text-zinc-400">Pick a title • Place tickets • Win</div>
              </div>
            ))}
          </div>

          {/* Extra game HUD strip */}
          <div className="mt-10 mx-auto max-w-2xl rounded-2xl bg-black/20 ring-1 ring-white/10 backdrop-blur px-5 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_18px_rgba(16,185,129,0.65)]" />
                Live Slots
              </span>
              <span className="text-zinc-500">•</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400/80 shadow-[0_0_18px_rgba(245,158,11,0.55)]" />
                Story Titles
              </span>
              <span className="text-zinc-500">•</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400/80 shadow-[0_0_18px_rgba(239,68,68,0.45)]" />
                Live Updates
              </span>
            </div>
          </div>

          {/* Closing CTA */}
          <div className="mt-12">
            <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-white/7 via-black/25 to-black/30 ring-1 ring-white/12 backdrop-blur px-6 py-7">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="text-left">
                  <div className="text-xs tracking-[0.35em] text-zinc-300/80">LAKSHAYINDIA</div>
                  <div className="mt-2 text-2xl font-semibold">Ready to enter the arena?</div>
                  <div className="mt-1 text-sm text-zinc-300/75">
                    A polished game-style UI built for speed, focus, and fun.
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg" className="bg-amber-500 text-black hover:bg-amber-400">
                    <Link to="/login">Start Now</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                    <Link to="/results">See Results</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-10 pb-6">
            <div className="mx-auto max-w-5xl rounded-2xl bg-black/20 ring-1 ring-white/10 backdrop-blur px-5 py-4">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-3">
                  <LuckIndiaLogo className="h-9 w-9" />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">LakshayIndia</div>
                    <div className="text-xs text-zinc-400">Play • Track • Win</div>
                  </div>
                </div>
                <div className="text-xs text-zinc-400">
                  © {new Date().getFullYear()} LakshayIndia. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
