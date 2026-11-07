import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_SOURCES, type ResultFilter } from './use-answer-params'

const RESULT_OPTIONS: { value: ResultFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'dung', label: 'Đúng' },
  { value: 'sai', label: 'Sai' },
  { value: 'chua', label: 'Chưa làm' },
]

export function AnswerFilters({
  sourceNames,
  source,
  result,
  onSourceChange,
  onResultChange,
}: {
  sourceNames: string[]
  source: string
  result: ResultFilter
  onSourceChange: (source: string) => void
  onResultChange: (result: ResultFilter) => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span id="filter-source-label" className="text-[13px] text-ink-soft">
          File nguồn
        </span>
        <Select value={source} onValueChange={onSourceChange}>
          <SelectTrigger
            aria-labelledby="filter-source-label"
            className="w-full max-w-[min(20rem,calc(100vw-2rem))] min-w-44 bg-paper shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value={ALL_SOURCES}>Tất cả file</SelectItem>
            {sourceNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span id="filter-result-label" className="text-[13px] text-ink-soft">
          Kết quả gần nhất
        </span>
        <div
          role="group"
          aria-labelledby="filter-result-label"
          className="inline-flex h-9 rounded-md border border-input bg-paper p-0.5"
        >
          {RESULT_OPTIONS.map((opt) => {
            const active = opt.value === result
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => onResultChange(opt.value)}
                className={cn(
                  'rounded-[4px] px-3 text-sm whitespace-nowrap transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  active ? 'bg-lead font-medium text-paper' : 'text-ink-soft hover:bg-desk hover:text-ink',
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
