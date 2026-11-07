import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Session } from '@/lib/types'
import type { SessionStats } from '@/store/quiz-store'
import { AbandonSessionButton } from './abandon-session-button'

interface AnsweredItem {
  id: string
  number: number
  text: string
}

/**
 * "Phiếu trả lời" — the answer-sheet sidebar: counters, numbered OMR grid, Đúng/Sai lists.
 * `onSelect(id)` opens the read-only review of an answered question; `onSelect(null)` returns to the current one.
 */
export function AnswerSheet({
  session,
  stats,
  reviewingId,
  onSelect,
  showTitle = true,
}: {
  session: Session
  stats: SessionStats
  reviewingId: string | null
  onSelect: (questionId: string | null) => void
  showTitle?: boolean
}) {
  const { right, wrong } = useMemo(() => {
    const right: AnsweredItem[] = []
    const wrong: AnsweredItem[] = []
    session.questions.forEach((q, i) => {
      const a = session.attempts[q.id]
      if (!a) return
      ;(a.correct ? right : wrong).push({ id: q.id, number: i + 1, text: q.text })
    })
    return { right, wrong }
  }, [session])

  return (
    <section aria-label="Phiếu trả lời" className="rounded-md border border-sheet-rule bg-paper">
      {showTitle && (
        <h2 className="border-b border-sheet-rule px-4 py-3 text-[15px] font-semibold text-sheet">Phiếu trả lời</h2>
      )}

      <SheetCounters correct={stats.correct} wrong={stats.wrong} remaining={stats.total - stats.answered} />

      <SheetGrid session={session} reviewingId={reviewingId} onSelect={onSelect} />

      <Tabs defaultValue="dung" className="gap-0 border-t border-sheet-rule px-4 pt-3 pb-2">
        <TabsList variant="line" className="h-8">
          <TabsTrigger value="dung" className="tabular">
            Đúng ({right.length})
          </TabsTrigger>
          <TabsTrigger value="sai" className="tabular">
            Sai ({wrong.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dung" className="mt-2">
          <AnsweredList items={right} reviewingId={reviewingId} onSelect={onSelect} empty="Chưa có câu đúng." />
        </TabsContent>
        <TabsContent value="sai" className="mt-2">
          <AnsweredList items={wrong} reviewingId={reviewingId} onSelect={onSelect} empty="Chưa có câu sai." />
        </TabsContent>
      </Tabs>

      <div className="border-t border-sheet-rule px-2 py-2">
        <AbandonSessionButton answered={stats.answered} total={stats.total} />
      </div>
    </section>
  )
}

function SheetCounters({ correct, wrong, remaining }: { correct: number; wrong: number; remaining: number }) {
  const items = [
    { label: 'Đúng', value: correct, tone: 'text-pass' },
    { label: 'Sai', value: wrong, tone: 'text-fail' },
    { label: 'Còn lại', value: remaining, tone: 'text-ink' },
  ]
  return (
    <dl className="grid grid-cols-3 divide-x divide-sheet-rule border-b border-sheet-rule">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col-reverse gap-0.5 px-3 py-2.5">
          <dt className="text-xs text-sheet">{it.label}</dt>
          <dd className={cn('text-[22px] leading-none font-semibold tabular', it.tone)}>{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SheetGrid({
  session,
  reviewingId,
  onSelect,
}: {
  session: Session
  reviewingId: string | null
  onSelect: (questionId: string | null) => void
}) {
  return (
    <div className="max-h-72 overflow-y-auto bg-sheet-wash/60 p-3">
      <ol className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1.5" aria-label="Danh sách câu hỏi">
        {session.questions.map((q, i) => {
          const attempt = session.attempts[q.id]
          const isCurrent = i === session.currentIndex
          const isReviewing = reviewingId === q.id
          const clickable = Boolean(attempt) || isCurrent
          const status = attempt ? (attempt.correct ? 'đúng' : 'sai') : isCurrent ? 'đang làm' : 'chưa làm'
          return (
            <li key={q.id}>
              <button
                type="button"
                disabled={!clickable}
                aria-current={isCurrent ? 'step' : undefined}
                aria-pressed={clickable ? isReviewing || (isCurrent && reviewingId === null) : undefined}
                aria-label={`Câu ${i + 1}: ${status}${attempt?.overtime ? ', quá giờ' : ''}`}
                title={`Câu ${i + 1}: ${status}`}
                onClick={() => onSelect(isCurrent ? null : q.id)}
                className={cn(
                  'flex h-8 w-full items-center justify-center rounded-sm border text-xs font-semibold tabular transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none',
                  !attempt && !isCurrent && 'border-sheet-rule bg-paper text-sheet/70',
                  isCurrent && !attempt && 'border-2 border-ink bg-paper text-ink',
                  attempt?.correct && 'border-pass bg-pass text-paper hover:bg-pass/85',
                  attempt && !attempt.correct && 'border-fail bg-fail text-paper line-through hover:bg-fail/85',
                  isCurrent && attempt && 'outline-2 outline-offset-1 outline-ink',
                  isReviewing && 'ring-2 ring-ink ring-offset-1',
                )}
              >
                {i + 1}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function AnsweredList({
  items,
  reviewingId,
  onSelect,
  empty,
}: {
  items: AnsweredItem[]
  reviewingId: string | null
  onSelect: (questionId: string) => void
  empty: string
}) {
  if (items.length === 0) return <p className="px-1 py-2 text-[13px] text-ink-faint">{empty}</p>
  return (
    <ul className="-mx-1 max-h-56 overflow-y-auto">
      {items.map((it) => (
        <li key={it.id}>
          <button
            type="button"
            onClick={() => onSelect(it.id)}
            className={cn(
              'flex w-full items-baseline gap-2 rounded-sm px-1 py-1.5 text-left text-[13px] text-ink-soft hover:bg-desk hover:text-ink',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              reviewingId === it.id && 'bg-desk text-ink',
            )}
          >
            <span className="w-7 shrink-0 font-semibold text-sheet tabular">{it.number}</span>
            <span className="truncate">{it.text}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
