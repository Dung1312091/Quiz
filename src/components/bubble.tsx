import { cn } from '@/lib/utils'
import { optionLetter } from '@/lib/text'

export type BubbleState = 'empty' | 'filled' | 'right' | 'wrong' | 'missed'

/**
 * The answer-sheet bubble — the signature element of the UI.
 * - empty  : pink printed ring with the option letter
 * - filled : graphite fill (user's pencil mark)
 * - right  : green fill (correct & chosen, or the correct answer when revealing)
 * - wrong  : red fill (chosen but incorrect)
 * - missed : green ring, not filled (correct answer the user did not choose)
 */
export function Bubble({
  index,
  state = 'empty',
  size = 'md',
  className,
}: {
  index: number
  state?: BubbleState
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] font-semibold tabular select-none',
        'transition-[background-color,border-color,color] duration-150',
        size === 'sm' && 'size-5 text-[10px]',
        size === 'md' && 'size-8 text-sm',
        size === 'lg' && 'size-10 text-base',
        state === 'empty' && 'border-sheet-rule bg-paper text-sheet',
        state === 'filled' && 'border-lead bg-lead text-paper',
        state === 'right' && 'border-pass bg-pass text-paper',
        state === 'wrong' && 'border-fail bg-fail text-paper',
        state === 'missed' && 'border-pass border-2 bg-pass-wash text-pass',
        className,
      )}
    >
      {optionLetter(index)}
    </span>
  )
}
