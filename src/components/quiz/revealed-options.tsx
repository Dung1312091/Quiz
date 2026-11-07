import { Check, X } from 'lucide-react'
import { Bubble, type BubbleState } from '@/components/bubble'
import { cn } from '@/lib/utils'
import type { AnswerOption } from '@/lib/types'

/** Bubble state of one option once the answer has been graded. */
export function revealedBubbleState(optionIndex: number, correct: readonly number[], selected: readonly number[]): BubbleState {
  const chosen = selected.includes(optionIndex)
  const isCorrect = correct.includes(optionIndex)
  if (chosen && isCorrect) return 'right'
  if (chosen) return 'wrong'
  if (isCorrect) return 'missed'
  return 'empty'
}

const STATUS_TEXT: Record<BubbleState, string> = {
  right: 'Bạn chọn, đúng',
  wrong: 'Bạn chọn, sai',
  missed: 'Đáp án đúng',
  empty: '',
  filled: '',
}

/**
 * Read-only option list in graded state.
 * Each option carries a text/icon marker so the result never relies on color alone.
 */
export function RevealedOptions({
  options,
  correct,
  selected,
  size = 'md',
}: {
  options: AnswerOption[]
  correct: readonly number[]
  selected: readonly number[]
  size?: 'sm' | 'md'
}) {
  return (
    <ul className={cn('flex flex-col', size === 'md' ? 'gap-1' : 'gap-0.5')}>
      {options.map((opt) => {
        const state = revealedBubbleState(opt.index, correct, selected)
        return (
          <li
            key={opt.index}
            className={cn(
              'flex items-start rounded-md',
              size === 'md' ? 'gap-3 px-3 py-2.5' : 'gap-2.5 px-2 py-1.5',
              state === 'empty' && 'opacity-55',
            )}
          >
            <Bubble index={opt.index} state={state} size={size === 'md' ? 'md' : 'sm'} />
            <span
              className={cn(
                'min-w-0 flex-1 text-ink',
                size === 'md' ? 'pt-1 text-[17px] leading-snug' : 'pt-px text-[15px] leading-snug',
              )}
            >
              {opt.text}
            </span>
            <OptionMarker state={state} size={size} />
          </li>
        )
      })}
    </ul>
  )
}

function OptionMarker({ state, size }: { state: BubbleState; size: 'sm' | 'md' }) {
  if (state === 'empty' || state === 'filled') return null
  const pad = size === 'md' ? 'pt-1.5' : 'pt-0.5'
  if (state === 'missed') {
    return <span className={cn('shrink-0 text-[13px] font-medium text-pass', pad)}>{STATUS_TEXT.missed}</span>
  }
  const Icon = state === 'right' ? Check : X
  return (
    <span className={cn('shrink-0', pad, state === 'right' ? 'text-pass' : 'text-fail')}>
      <Icon className="size-4" aria-hidden />
      <span className="sr-only">{STATUS_TEXT[state]}</span>
    </span>
  )
}
