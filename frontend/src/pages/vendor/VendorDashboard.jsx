import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function VendorDashboard() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Live</div>
        <div className="text-2xl font-semibold">Vendor Dashboard</div>
        <div className="text-sm text-zinc-300">Play the current slot and place tickets on a title.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="text-xs tracking-[0.25em] text-zinc-400">PLAY</div>
            <div className="mt-2 text-lg font-semibold">Open Game</div>
            <div className="mt-1 text-sm text-zinc-400">Silver • Gold • Diamond for current hour.</div>
            <div className="mt-4">
              <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
                <Link to="/vendor/play">Start Playing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="text-xs tracking-[0.25em] text-zinc-400">HISTORY</div>
            <div className="mt-2 text-lg font-semibold">Your Plays</div>
            <div className="mt-1 text-sm text-zinc-400">Select date + time and view what you played.</div>
            <div className="mt-4">
              <Button asChild variant="secondary">
                <Link to="/vendor/history">Open History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="text-xs tracking-[0.25em] text-zinc-400">RESULTS</div>
            <div className="mt-2 text-lg font-semibold">View Board</div>
            <div className="mt-1 text-sm text-zinc-400">Check published results anytime.</div>
            <div className="mt-4">
              <Button asChild variant="secondary">
                <Link to="/results">Open Results</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
