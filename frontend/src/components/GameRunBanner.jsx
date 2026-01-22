import React from 'react'

function LuckyCoin({ className = '' }) {
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="coinA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.55" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="coinB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="64" cy="64" r="50" fill="url(#coinA)" />
      <circle cx="64" cy="64" r="43" fill="none" stroke="#fffbeb" strokeOpacity="0.25" strokeWidth="6" />
      <path
        d="M28 52c10-18 28-28 50-28 12 0 22 2 32 7"
        stroke="url(#coinB)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      <g fill="#111827" fillOpacity="0.85">
        <path d="M63 40c-8 0-15 5-15 13 0 7 5 11 13 12l4 1c5 1 7 2 7 5 0 3-3 5-7 5-5 0-8-2-10-6l-9 4c3 7 9 11 18 12v8h8v-8c10-2 16-8 16-16 0-8-6-12-15-14l-4-1c-6-1-8-2-8-5 0-3 3-5 7-5 4 0 7 2 9 5l8-5c-3-6-8-9-13-10v-6h-8v6z" />
      </g>
    </svg>
  )
}

const DEFAULT_TILES = [
  { label: 'SILVER', tone: 'from-zinc-900/70 to-zinc-950/60', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.12)]' },
  { label: 'GOLD', tone: 'from-amber-500/10 to-zinc-950/70', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.18)]' },
  { label: 'DIAMOND', tone: 'from-emerald-500/10 to-zinc-950/70', glow: 'shadow-[0_0_24px_rgba(16,185,129,0.18)]' },
]

function Tile({ quiz, n }) {
  return (
    <div
      className={
        `relative shrink-0 rounded-2xl ring-1 ring-white/10 bg-gradient-to-br ${quiz.tone} px-4 py-3 ` +
        `[transform:perspective(900px)_rotateX(12deg)_rotateY(-10deg)] ${quiz.glow}`
      }
    >
      <div className="text-[10px] tracking-[0.3em] text-zinc-400">{quiz.label}</div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="text-2xl font-extrabold tracking-tight text-zinc-100">{n}</div>
        <div className="text-xs text-zinc-400">RUN</div>
      </div>
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-60" />
    </div>
  )
}

export default function GameRunBanner({ dense = false, className = '' }) {
  const height = dense ? 'h-[86px]' : 'h-[120px]'
  const tileW = dense ? 'w-[160px]' : 'w-[190px]'

  const tiles = []
  for (let i = 0; i < 30; i += 1) {
    const quiz = DEFAULT_TILES[i % DEFAULT_TILES.length]
    tiles.push({ quiz, n: i % 10, key: `${quiz.label}-${i}` })
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-white/5 ${height} ${className}`}>
      <style>{`
        @keyframes luck-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes luck-float {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-6px) rotate(6deg); }
        }
        @keyframes luck-spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.18),transparent_50%),radial-gradient(circle_at_85%_55%,rgba(16,185,129,0.14),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_5px)]" />
      </div>

      <div className="relative flex h-full items-center gap-4 px-5">
        <div className="hidden sm:block">
          <div
            className="relative"
            style={{ animation: 'luck-float 2.4s ease-in-out infinite' }}
          >
            <div
              className="absolute -inset-6 rounded-full bg-amber-500/10 blur-2xl"
              style={{ animation: 'luck-spin 3.2s linear infinite' }}
            />
            <LuckyCoin className={dense ? 'h-12 w-12' : 'h-14 w-14'} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs tracking-[0.45em] text-zinc-400">LIVE GAME</div>
          <div className="mt-1 text-sm font-semibold text-zinc-100">Tickets running… pick your number</div>

          <div className="mt-3 overflow-hidden">
            <div
              className="flex w-[200%] gap-3"
              style={{ animation: 'luck-marquee 14s linear infinite' }}
            >
              {[0, 1].map((rep) => (
                <div key={rep} className="flex gap-3">
                  {tiles.map((t) => (
                    <div key={`${t.key}-${rep}`} className={tileW}>
                      <Tile quiz={t.quiz} n={t.n} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
