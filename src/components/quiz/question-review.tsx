import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Attempt, QuestionSnapshot } from '@/lib/types'
import { RevealedOptions } from './revealed-options'
import { VerdictTags } from './verdict'
import { formatLetters } from './format'

/**
 * Read-only card of one graded question: number, text, options in revealed state, Đúng/Sai + quá giờ.
 * Reused by the result page list and the in-session review on /lam-bai.
 */
export function QuestionReview({
  question,
  attempt,
  number,
  className,
  children,
}: {
  question: QuestionSnapshot
  attempt: Attempt | undefined
  /** 1-based position of the question in its session. */
  number: number
  className?: string
  /** Optional actions rendered at the bottom of the card. */
  children?: ReactNode
}) {
  const showCorrect = !attempt || !attempt.correct
  return (
    <article className={cn('rounded-md border border-rule bg-paper p-4 sm:p-5', className)}>
      <header className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-[13px] font-semibold text-sheet tabular">Câu {number}</span>
        <VerdictTags attempt={attempt} />
      </header>
      <p className="mb-3 max-w-[70ch] text-[17px] leading-[1.45] font-medium text-ink">{question.text}</p>
      <RevealedOptions options={question.options} correct={question.correct} selected={attempt?.selected ?? []} size="sm" />
      {showCorrect && (
        <p className="mt-3 text-[13px] text-ink-soft">
          Đáp án đúng: <span className="font-semibold text-pass">{formatLetters(question.correct)}</span>
        </p>
      )}
      {children}
    </article>
  )
}
