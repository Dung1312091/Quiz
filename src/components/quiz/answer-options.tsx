import { Bubble } from '@/components/bubble'
import { cn } from '@/lib/utils'
import type { AnswerOption } from '@/lib/types'

/**
 * Interactive option list. Native radio/checkbox inputs are visually hidden behind the Bubble,
 * so keyboard behavior (arrows for radios, Space to toggle) stays native.
 */
export function AnswerOptions({
  name,
  options,
  multiple,
  selected,
  onChange,
  labelledBy,
  describedBy,
}: {
  /** Unique per question, groups the radios. */
  name: string
  options: AnswerOption[]
  multiple: boolean
  selected: readonly number[]
  onChange: (next: number[]) => void
  labelledBy: string
  describedBy?: string
}) {
  const toggle = (index: number, checked: boolean) => {
    if (!multiple) {
      onChange([index])
      return
    }
    onChange(checked ? [...selected, index] : selected.filter((i) => i !== index))
  }

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="flex flex-col gap-1"
    >
      {options.map((opt) => {
        const checked = selected.includes(opt.index)
        return (
          <label
            key={opt.index}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 transition-colors',
              'hover:bg-desk/70 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring',
            )}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={opt.index}
              checked={checked}
              onChange={(e) => toggle(opt.index, e.target.checked)}
              className="sr-only"
            />
            <Bubble index={opt.index} state={checked ? 'filled' : 'empty'} />
            <span className="min-w-0 flex-1 pt-1 text-[17px] leading-snug text-ink">{opt.text}</span>
          </label>
        )
      })}
    </div>
  )
}
