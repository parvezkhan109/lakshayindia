import { Link, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import GameRunBanner from '@/components/GameRunBanner'
import { Separator } from '@/components/ui/separator'
import { clearSession, getSession } from '@/services/session'

function roleHome(role) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'SUPER') return '/super'
  return '/vendor'
}

export default function DashboardLayout() {
  const nav = useNavigate()
  const session = getSession()
  const role = session?.user?.role

  const items =
    role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/users/create', label: 'Create User' },
          { to: '/admin/users', label: 'Manage Users' },
          { to: '/admin/prices', label: 'Manage Prices' },
          { to: '/admin/stories/manual', label: 'Story (Manual)' },
          { to: '/admin/results/publish', label: 'Result Publish' },
          { to: '/admin/assignments', label: 'Assign Vendors' },
          { to: '/admin/plays/audit', label: 'Plays Audit' },
          { to: '/results', label: 'Public Results' },
        ]
      : role === 'SUPER'
      ? [
          { to: '/super', label: 'Dashboard' },
          { to: '/super/vendors', label: 'My Vendors' },
          { to: '/super/play', label: 'Play for Vendor' },
          { to: '/super/results/publish', label: 'Publish Result' },
          { to: '/results', label: 'Public Results' },
        ]
      : [
          { to: '/vendor', label: 'Dashboard' },
          { to: '/vendor/play', label: 'Play' },
          { to: '/vendor/history', label: 'History' },
          { to: '/results', label: 'Results' },
        ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-amber-500/15 to-red-500/10 ring-1 ring-white/15" />
            <div>
              <div className="text-sm text-muted-foreground">LakshayIndia</div>
              <div className="text-lg font-semibold">{role} Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {session?.user?.username}
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                clearSession()
                nav('/login')
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {role === 'SUPER' || role === 'VENDOR' ? (
          <div className="mt-5">
            <GameRunBanner dense />
          </div>
        ) : null}

        <Separator className="my-6 bg-white/10" />

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl bg-zinc-950/70 backdrop-blur ring-1 ring-white/12">
            <div className="p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Menu</div>
              <div className="mt-3 grid gap-2">
                {items.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    className="rounded-xl px-3 py-2 text-sm text-zinc-100/90 hover:bg-white/8"
                  >
                    {it.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                Home: <Link className="underline" to={roleHome(role)}>open</Link>
              </div>
            </div>
          </aside>

          <main className="rounded-2xl bg-zinc-950/65 backdrop-blur p-5 ring-1 ring-white/12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
