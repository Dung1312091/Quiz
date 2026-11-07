import { memo } from 'react'
import { Check, FileText, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LastResult } from '@/lib/types'
import type { SearchHit } from '@/lib/search'
import { isMultiAnswer } from '@/store/quiz-store'
import { Bubble } from '@/components/bubble'
import { Highlight } from './highlight'

export const AnswerRow = memo(function AnswerRow({
  hit,
  lastResult,
}: {
  hit: SearchHit
  lastResult: LastResult | undefined
}) {
  const { question: q, textRanges, optionRanges } = hit
  const correct = new Set(q.correct)

  return (
    <li className="px-4 py-5 sm:px-6">
      <p className="max-w-[70ch] text-[17px] leading-[1.45] font-medium text-ink">
        <Highlight text={q.text} ranges={textRanges} />
      </p>

      <ul className="mt-3 space-y-2" aria-label="Các đáp án">
        {q.options.map((opt, pos) => {
          const isRight = correct.has(opt.index)
          return (
            <li key={opt.index} className="flex items-start gap-3">
              <Bubble index={opt.index} state={isRight ? 'right' : 'empty'} size="sm" className="mt-px" />
              <span className={cn('min-w-0 text-[15px] leading-[1.45]', isRight ? 'font-medium text-ink' : 'text-ink-soft')}>
                <Highlight text={opt.text} ranges={optionRanges[pos]} />
                {isRight && (
                  <>
                    <Check aria-hidden className="ml-1.5 inline size-4 -translate-y-px text-pass" strokeWidth={2.5} />
                    <span className="sr-only"> (đáp án đúng)</span>
                  </>
                )}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-faint">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <FileText aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate" title={q.sources.join(', ')}>
            {q.sources.join(', ')}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 tabular">
          <Timer aria-hidden className="size-3.5" />
          {q.timeLimit} giây
        </span>
        {isMultiAnswer(q) && <span className="text-ink-soft">Nhiều đáp án</span>}
        {lastResult && <LastResultTag correct={lastResult.correct} />}
      </div>
    </li>
  )
})

function LastResultTag({ correct }: { correct: boolean }) {
  return (
    <span
      className={cn(
        'rounded-[4px] px-1.5 py-0.5 font-medium',
        correct ? 'bg-pass-wash text-pass' : 'bg-fail-wash text-fail',
      )}
    >
      Lần gần nhất: {correct ? 'Đúng' : 'Sai'}
    </span>
  )
}
