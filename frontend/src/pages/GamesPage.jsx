import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Arena3DBackground from '@/components/Arena3DBackground'
import LuckIndiaLogo from '@/components/LuckIndiaLogo'

export default function GamesPage() {
  const games = [
    { k: 'SILVER', d: 'Quick play • fast titles • smooth vibe' },
    { k: 'GOLD', d: 'Mid tier • stronger picks • higher stakes' },
    { k: 'DIAMOND', d: 'Premium • high focus • maximum thrill' },
  ]

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
            <div className="text-lg font-semibold">Games</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
            <Link to="/results">Results</Link>
          </Button>
          <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          {games.map((g) => (
            <Card key={g.k} className="bg-black/30 ring-1 ring-white/12 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-xs tracking-[0.35em] text-zinc-400">{g.k}</div>
                <div className="mt-2 text-xl font-semibold">{g.k} Quiz</div>
                <div className="mt-2 text-sm text-zinc-300/80">{g.d}</div>
                <div className="mt-5">
                  <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                    <Link to="/login">Play</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
