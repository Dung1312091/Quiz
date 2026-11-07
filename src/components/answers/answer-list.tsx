import { useState } from 'react'
import type { LastResult } from '@/lib/types'
import type { SearchHit } from '@/lib/search'
import { Button } from '@/components/ui/button'
import { AnswerRow } from './answer-row'

const PAGE_SIZE = 100

/**
 * One paper sheet with rows separated by rules. Renders the first PAGE_SIZE hits,
 * then "Hiện thêm". Remount (via `key`) to reset paging when the query/filters change.
 */
export function AnswerList({
  hits,
  lastResults,
}: {
  hits: SearchHit[]
  lastResults: Record<string, LastResult>
}) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const visible = hits.length > limit ? hits.slice(0, limit) : hits
  const remaining = hits.length - visible.length

  return (
    <div>
      <ol className="divide-y divide-rule rounded-md border border-rule bg-paper">
        {visible.map((hit) => (
          <AnswerRow key={hit.question.id} hit={hit} lastResult={lastResults[hit.question.id]} />
        ))}
      </ol>
      {remaining > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button variant="outline" className="bg-paper shadow-none" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
            Hiện thêm {Math.min(PAGE_SIZE, remaining)} câu
          </Button>
          <span className="text-[13px] text-ink-faint tabular">
            Đang hiện {visible.length} / {hits.length} câu
          </span>
        </div>
      )}
    </div>
  )
}
