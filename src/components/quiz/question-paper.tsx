import { useEffect, useId, useRef, useState } from 'react'
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isMultiAnswer } from '@/store/quiz-store'
import type { Attempt, QuestionSnapshot } from '@/lib/types'
import { AnswerOptions } from './answer-options'
import { RevealedOptions } from './revealed-options'
import { TimerLine, TimerText, useQuestionClock } from './question-timer'
import { OvertimeTag } from './verdict'
import { formatLetters } from './format'

/**
 * The question "paper" for the question currently being answered.
 * Mount it with a `key` per question so selection and timer reset.
 */
export function QuestionPaper({
  question,
  number,
  total,
  attempt,
  isRetry,
  showAnswerCountHint,
  isLast,
  focusOnMount,
  onSubmit,
  onContinue,
}: {
  question: QuestionSnapshot
  number: number
  total: number
  /** Present once this question has been graded → revealed state. */
  attempt: Attempt | undefined
  isRetry: boolean
  showAnswerCountHint: boolean
  isLast: boolean
  focusOnMount: boolean
  onSubmit: (selected: number[], elapsedMs: number) => void
  onContinue: () => void
}) {
  const [selected, setSelected] = useState<number[]>([])
  const clock = useQuestionClock(attempt?.elapsedMs)
  const revealed = attempt !== undefined
  const multiple = isMultiAnswer(question)
  const ids = useId()
  const questionId = `${ids}-question`
  const hintId = `${ids}-hint`
  const showHint = showAnswerCountHint && multiple
  const questionRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (focusOnMount) questionRef.current?.focus()
  }, [focusOnMount])

  return (
    <article className="relative overflow-clip rounded-md border border-rule bg-paper">
      <TimerLine elapsedMs={clock.elapsedMs} timeLimit={question.timeLimit} />
      <div className="px-4 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-7">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="text-sm font-semibold text-sheet tabular">
            Câu {number}/{total}
          </span>
          <TimerText elapsedMs={clock.elapsedMs} timeLimit={question.timeLimit} frozen={revealed} />
        </header>

        {isRetry && (
          <p className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-ink-soft">
            <RotateCcw className="size-3.5" aria-hidden />
            Lượt làm lại các câu sai
          </p>
        )}

        <p
          id={questionId}
          ref={questionRef}
          tabIndex={-1}
          className="max-w-[70ch] text-xl leading-[1.45] font-medium text-ink outline-none sm:text-[22px]"
        >
          {question.text}
        </p>
        {showHint && (
          <p id={hintId} className="mt-2 text-sm text-ink-soft">
            Chọn {question.correct.length} đáp án
          </p>
        )}

        <div className="mt-5 -mx-3">
          {revealed ? (
            <RevealedOptions options={question.options} correct={question.correct} selected={attempt.selected} />
          ) : (
            <AnswerOptions
              name={questionId}
              options={question.options}
              multiple={multiple}
              selected={selected}
              onChange={setSelected}
              labelledBy={questionId}
              describedBy={showHint ? hintId : undefined}
            />
          )}
        </div>

        {/* Phone: pinned above the bottom tab bar so Nộp / Tiếp tục is always within thumb reach. */}
        <footer className="sticky bottom-[calc(var(--mobile-nav-h)+env(safe-area-inset-bottom))] z-10 -mx-4 mt-6 flex flex-col gap-3 border-t border-rule bg-paper px-4 pt-4 pb-4 sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-0 sm:pt-5 sm:pb-0">
          <div aria-live="polite" className="sm:min-h-6">
            {attempt && <ResultLine attempt={attempt} correct={question.correct} />}
          </div>
          {revealed ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-[13px] text-ink-faint sm:pointer-fine:inline">
                hoặc nhấn <kbd className="rounded-sm border border-rule bg-desk px-1.5 py-0.5 font-sans text-xs text-ink-soft">Space</kbd>
              </span>
              <Button size="lg" autoFocus onClick={onContinue} className="w-full sm:w-auto">
                {isLast ? 'Xem kết quả' : 'Tiếp tục'}
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              disabled={selected.length === 0}
              onClick={() => onSubmit(selected, clock.read())}
              className="w-full sm:w-auto"
            >
              Nộp câu trả lời
            </Button>
          )}
        </footer>
      </div>
    </article>
  )
}

/** "Đúng" / "Sai" with icon, quá giờ tag and the correct letters for wrong answers. */
export function ResultLine({ attempt, correct }: { attempt: Attempt; correct: readonly number[] }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {attempt.correct ? (
        <span className="inline-flex items-center gap-1.5 text-[17px] font-semibold text-pass">
          <CircleCheck className="size-5" aria-hidden />
          Đúng
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[17px] font-semibold text-fail">
          <CircleX className="size-5" aria-hidden />
          Sai
        </span>
      )}
      {attempt.overtime && <OvertimeTag />}
      {!attempt.correct && (
        <span className="text-[15px] text-ink-soft">
          Đáp án đúng: <span className="font-semibold text-ink">{formatLetters(correct)}</span>
        </span>
      )}
    </p>
  )
}
