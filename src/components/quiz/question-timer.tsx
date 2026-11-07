import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatClock } from './format'

const TICK_MS = 250

/**
 * Elapsed time since the owning component mounted. The quiz paper is remounted per question,
 * so the clock restarts for every question (and after a reload — acceptable by design).
 * While `frozenMs` is set the clock stops and reports that value instead.
 */
export function useQuestionClock(frozenMs: number | undefined) {
  const [startAt] = useState(() => Date.now())
  const [now, setNow] = useState(startAt)
  const running = frozenMs === undefined

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [running])

  return {
    elapsedMs: running ? Math.max(0, now - startAt) : frozenMs,
    /** Precise elapsed time at the moment of the call (used when submitting). */
    read: () => Date.now() - startAt,
  }
}

function timerInfo(elapsedMs: number, timeLimit: number) {
  const limitMs = timeLimit * 1000
  const hasLimit = limitMs > 0
  const overtime = hasLimit && elapsedMs > limitMs
  return {
    hasLimit,
    overtime,
    /** 1 → full, 0 → depleted */
    fraction: hasLimit ? Math.max(0, 1 - elapsedMs / limitMs) : 0,
    remainingSeconds: hasLimit ? Math.ceil(Math.max(0, limitMs - elapsedMs) / 1000) : 0,
    overSeconds: overtime ? Math.ceil((elapsedMs - limitMs) / 1000) : 0,
  }
}

/** Thin line along the top edge of the paper, depleting over the time limit; red once overtime. */
export function TimerLine({ elapsedMs, timeLimit }: { elapsedMs: number; timeLimit: number }) {
  const { hasLimit, overtime, fraction } = timerInfo(elapsedMs, timeLimit)
  if (!hasLimit) return null
  return (
    <div aria-hidden className={cn('absolute inset-x-0 top-0 h-[3px]', overtime ? 'bg-fail' : 'bg-rule')}>
      {!overtime && (
        <div
          className="h-full origin-left bg-ink-soft transition-transform duration-[250ms] ease-linear"
          style={{ transform: `scaleX(${fraction})` }}
        />
      )}
    </div>
  )
}

/** Numeric countdown "0:42"; once past the limit: "+0:12 quá giờ" in red. */
export function TimerText({ elapsedMs, timeLimit, frozen }: { elapsedMs: number; timeLimit: number; frozen: boolean }) {
  const { hasLimit, overtime, remainingSeconds, overSeconds } = timerInfo(elapsedMs, timeLimit)
  const label = !hasLimit
    ? formatClock(elapsedMs / 1000)
    : overtime
      ? `+${formatClock(overSeconds)} quá giờ`
      : formatClock(remainingSeconds)
  return (
    <span
      role="timer"
      aria-label={
        overtime
          ? `Quá giờ ${overSeconds} giây`
          : hasLimit
            ? `Còn ${remainingSeconds} giây${frozen ? ', đã dừng' : ''}`
            : `Đã làm ${Math.floor(elapsedMs / 1000)} giây`
      }
      className={cn('text-sm font-medium tabular', overtime ? 'text-fail' : frozen ? 'text-ink-faint' : 'text-ink-soft')}
    >
      {label}
    </span>
  )
}
