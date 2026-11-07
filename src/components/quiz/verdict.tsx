import { CircleCheck, CircleX, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Attempt } from '@/lib/types'

/** Small "quá giờ" tag for answers submitted after the time limit. */
export function OvertimeTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm bg-late-wash px-1.5 py-0.5 text-[13px] font-medium text-late',
        className,
      )}
    >
      <Timer className="size-3.5" aria-hidden />
      quá giờ
    </span>
  )
}

/** Compact Đúng / Sai tag (+ quá giờ) used in review lists. */
export function VerdictTags({ attempt }: { attempt: Attempt | undefined }) {
  if (!attempt) {
    return <span className="rounded-sm bg-desk px-1.5 py-0.5 text-[13px] font-medium text-ink-soft">Chưa trả lời</span>
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[13px] font-medium',
          attempt.correct ? 'bg-pass-wash text-pass' : 'bg-fail-wash text-fail',
        )}
      >
        {attempt.correct ? <CircleCheck className="size-3.5" aria-hidden /> : <CircleX className="size-3.5" aria-hidden />}
        {attempt.correct ? 'Đúng' : 'Sai'}
      </span>
      {attempt.overtime && <OvertimeTag />}
    </span>
  )
}
