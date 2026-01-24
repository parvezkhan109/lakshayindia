import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import Arena3DBackground from '@/components/Arena3DBackground'
import LuckIndiaLogo from '@/components/LuckIndiaLogo'

export default function AboutPage() {
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
            <div className="text-lg font-semibold">About Us</div>
          </div>
        </div>
        <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
          <Link to="/">Home</Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6">
        <div className="max-w-3xl rounded-3xl bg-black/30 ring-1 ring-white/12 backdrop-blur p-6 sm:p-8">
          <div className="text-2xl font-semibold">Welcome to LakshayIndia</div>
          <p className="mt-3 text-sm text-zinc-300/80 leading-relaxed">
            LakshayIndia is a story-title based quiz experience designed to feel fast, clean and modern.
            Each slot brings fresh stories across Silver, Gold and Diamond — you pick the best title and play.
          </p>
          <p className="mt-3 text-sm text-zinc-300/80 leading-relaxed">
            Our focus is a smooth mobile-first UI, clear results and a reliable admin system.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
              <Link to="/register">Register</Link>
            </Button>
            <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
              <Link to="/results">Results</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
