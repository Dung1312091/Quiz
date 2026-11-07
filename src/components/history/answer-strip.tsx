import { cn } from '@/lib/utils'
import type { Session } from '@/lib/types'

const MAX_CELLS = 50

/**
 * Tiny answer-sheet strip: one dot per question in session order
 * (green = đúng, red = sai, hollow pink = chưa trả lời). Decorative —
 * the row's text carries the same information.
 */
export function AnswerStrip({ session, className }: { session: Session; className?: string }) {
  const shown = session.questions.slice(0, MAX_CELLS)
  const rest = session.questions.length - shown.length

  return (
    <div aria-hidden className={cn('flex flex-wrap items-center gap-[3px]', className)}>
      {shown.map((q) => {
        const a = session.attempts[q.id]
        return (
          <span
            key={q.id}
            className={cn(
              'size-2 rounded-full',
              !a && 'border border-sheet-rule',
              a?.correct && 'bg-pass',
              a && !a.correct && 'bg-fail',
            )}
          />
        )
      })}
      {rest > 0 && <span className="ml-1 text-[11px] leading-none text-ink-faint tabular">+{rest}</span>}
    </div>
  )
}
