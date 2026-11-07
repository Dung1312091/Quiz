import type { ReactNode } from 'react'
import { mergeRanges, type Range } from '@/lib/search'

/** Renders `text` with the given inclusive ranges wrapped in <mark>. */
export function Highlight({ text, ranges }: { text: string; ranges?: readonly Range[] }) {
  if (!ranges || ranges.length === 0) return <>{text}</>

  const parts: ReactNode[] = []
  let cursor = 0
  for (const [rawStart, rawEnd] of mergeRanges(ranges)) {
    const start = Math.max(rawStart, cursor)
    const end = Math.min(rawEnd, text.length - 1)
    if (end < start) continue
    if (start > cursor) parts.push(text.slice(cursor, start))
    parts.push(
      <mark key={start} className="rounded-[2px] bg-sheet-wash text-ink">
        {text.slice(start, end + 1)}
      </mark>,
    )
    cursor = end + 1
  }
  if (cursor < text.length) parts.push(text.slice(cursor))

  return <>{parts}</>
}
