import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SuperDashboard() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-zinc-400">Overview</div>
        <div className="text-2xl font-semibold">Super Dashboard</div>
        <div className="text-sm text-zinc-300">Manage vendors and play on their behalf.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="text-xs tracking-[0.25em] text-zinc-400">VENDORS</div>
            <div className="mt-2 text-lg font-semibold">My Vendors</div>
            <div className="mt-1 text-sm text-zinc-400">See the vendors assigned to you.</div>
            <div className="mt-4">
              <Button asChild variant="secondary">
                <Link to="/super/vendors">Open</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="text-xs tracking-[0.25em] text-zinc-400">PLAY</div>
            <div className="mt-2 text-lg font-semibold">Play On Behalf</div>
            <div className="mt-1 text-sm text-zinc-400">Pick title and place tickets for a vendor.</div>
            <div className="mt-4">
              <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
                <Link to="/super/play">Start</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 ring-1 ring-white/10">
          <CardContent className="p-5">
            <div className="text-xs tracking-[0.25em] text-zinc-400">PUBLISH</div>
            <div className="mt-2 text-lg font-semibold">Publish Result</div>
            <div className="mt-1 text-sm text-zinc-400">Manual results for the slot.</div>
            <div className="mt-4">
              <Button asChild variant="secondary">
                <Link to="/super/results/publish">Open</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
