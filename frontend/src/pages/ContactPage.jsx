import { Link } from 'react-router-dom'

import { Mail, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Arena3DBackground from '@/components/Arena3DBackground'
import LuckIndiaLogo from '@/components/LuckIndiaLogo'

export default function ContactPage() {
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
            <div className="text-lg font-semibold">Contact Us</div>
          </div>
        </div>
        <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
          <Link to="/">Home</Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-black/30 ring-1 ring-white/12 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-2xl font-semibold">Get in touch</div>
              <div className="mt-2 text-sm text-zinc-300/80">
                For support, registration help or business queries — contact us anytime.
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
                    <Phone className="h-5 w-5 text-emerald-200" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Mobile</div>
                    <div className="text-sm font-semibold">9118121308</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-400/20">
                    <Mail className="h-5 w-5 text-amber-200" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Email</div>
                    <div className="text-sm font-semibold">contact@lakshayindia.biz</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="bg-amber-500 text-black hover:bg-amber-400">
                  <a href="mailto:contact@lakshayindia.biz">Email Us</a>
                </Button>
                <Button asChild variant="secondary" className="border border-white/15 bg-white/5 hover:bg-white/10">
                  <a href="tel:+919118121308">Call Now</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 ring-1 ring-white/12 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-xs tracking-[0.35em] text-zinc-400">INFO</div>
              <div className="mt-2 text-xl font-semibold">Need a vendor account?</div>
              <div className="mt-2 text-sm text-zinc-300/80">
                Use the Register page to submit your details. Admin will review your form and create your account.
              </div>
              <div className="mt-6">
                <Button asChild className="bg-emerald-500 text-black hover:bg-emerald-400">
                  <Link to="/register">Open Register Form</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
