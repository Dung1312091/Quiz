import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { optionLetter } from '@/lib/text'

const DURATION_MS = 4200
const PARTICLE_COUNT = 48

type ParticleKind = 'lead' | 'ring' | 'pass' | 'sheet'

interface Particle {
  id: number
  kind: ParticleKind
  size: number
  dx: number
  dy: number
  rot: number
  delay: number
  duration: number
  letter: string | null
}

function makeParticles(): Particle[] {
  const kinds: ParticleKind[] = ['lead', 'ring', 'pass', 'sheet', 'ring', 'lead']
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => {
    const angle = Math.random() * Math.PI * 2
    const distance = 18 + Math.random() * 30 // vmin
    const size = 10 + Math.round(Math.random() * 18)
    return {
      id,
      kind: kinds[id % kinds.length],
      size,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 12, // bias upward before falling
      rot: Math.round((Math.random() - 0.5) * 540),
      delay: Math.round(Math.random() * 180),
      duration: 1600 + Math.round(Math.random() * 900),
      letter: size >= 20 ? optionLetter(id % 4) : null,
    }
  })
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Full-screen celebration shown once when a session is finished:
 * a burst of answer-sheet bubbles + a "teacher's stamp" message.
 * Never blocks the page: particles ignore pointer events; the stamp closes on click / Esc / timeout.
 */
export function Celebration({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const reduced = useMemo(prefersReducedMotion, [])
  const particles = useMemo(() => (reduced ? [] : makeParticles()), [reduced])

  useEffect(() => {
    const fade = window.setTimeout(() => setLeaving(true), DURATION_MS - 400)
    const done = window.setTimeout(onDone, DURATION_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
      window.removeEventListener('keydown', onKey)
    }
  }, [onDone])

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-4',
        'transition-opacity duration-400',
        leaving && 'opacity-0',
      )}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          aria-hidden
          className={cn(
            'celebrate-particle absolute top-1/2 left-1/2 flex items-center justify-center rounded-full font-semibold',
            p.kind === 'lead' && 'bg-lead text-paper',
            p.kind === 'ring' && 'border-2 border-sheet-rule bg-paper text-sheet',
            p.kind === 'pass' && 'bg-pass text-paper',
            p.kind === 'sheet' && 'bg-sheet text-paper',
          )}
          style={
            {
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              fontSize: Math.round(p.size * 0.5),
              '--dx': `${p.dx}vmin`,
              '--dy': `${p.dy}vmin`,
              '--rot': `${p.rot}deg`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
            } as React.CSSProperties
          }
        >
          {p.letter}
        </span>
      ))}

      <button
        type="button"
        onClick={onDone}
        aria-label="Đóng lời chúc mừng"
        className="celebrate-stamp pointer-events-auto relative cursor-pointer rounded-md border-[3px] border-sheet bg-paper px-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-9 sm:py-6"
      >
        <span role="status" className="flex items-center gap-3 text-[22px] leading-snug font-bold text-sheet sm:text-[28px]">
          <span>Chúc mừng bạn đã không bị bay màu</span>
          <span aria-hidden className="celebrate-smile inline-block text-[34px] leading-none sm:text-[40px]">
            😄
          </span>
        </span>
      </button>
    </div>,
    document.body,
  )
}
