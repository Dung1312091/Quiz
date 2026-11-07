import { useMemo, useState } from 'react'
import type { Attempt, QuestionSnapshot, Session } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionReview } from './question-review'

type Filter = 'all' | 'wrong' | 'right'

interface ReviewItem {
  question: QuestionSnapshot
  attempt: Attempt | undefined
  number: number
}

/** Per-question review of a finished session, filterable Tất cả / Sai / Đúng. */
export function SessionReviewList({ session }: { session: Session }) {
  const lists = useMemo(() => {
    const all = session.questions.map((q, i) => ({ question: q, attempt: session.attempts[q.id], number: i + 1 }))
    return {
      all,
      wrong: all.filter((it) => it.attempt && !it.attempt.correct),
      right: all.filter((it) => it.attempt?.correct),
    } satisfies Record<Filter, ReviewItem[]>
  }, [session])
  // Open on the wrong answers when there are any — that's what people come back for.
  const [filter, setFilter] = useState<Filter>(lists.wrong.length > 0 ? 'wrong' : 'all')

  return (
    <Tabs asChild value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mt-10 gap-4">
      <section aria-labelledby="review-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="review-heading" className="text-[17px] font-semibold text-ink">
            Xem lại từng câu
          </h2>
          <TabsList variant="line" className="h-8">
            <TabsTrigger value="all" className="tabular">
              Tất cả ({lists.all.length})
            </TabsTrigger>
            <TabsTrigger value="wrong" className="tabular">
              Sai ({lists.wrong.length})
            </TabsTrigger>
            <TabsTrigger value="right" className="tabular">
              Đúng ({lists.right.length})
            </TabsTrigger>
          </TabsList>
        </div>
        {(Object.keys(lists) as Filter[]).map((key) => (
          <TabsContent key={key} value={key}>
            <ReviewItems items={lists[key]} empty={EMPTY_TEXT[key]} />
          </TabsContent>
        ))}
      </section>
    </Tabs>
  )
}

const EMPTY_TEXT: Record<Filter, string> = {
  all: 'Lượt này không có câu hỏi.',
  wrong: 'Không có câu sai trong lượt này.',
  right: 'Không có câu đúng trong lượt này.',
}

function ReviewItems({
  items,
  empty,
}: {
  items: ReviewItem[]
  empty: string
}) {
  if (items.length === 0) {
    return <p className="rounded-md border border-dashed border-rule px-4 py-6 text-[15px] text-ink-soft">{empty}</p>
  }
  return (
    <ol className="flex flex-col gap-3">
      {items.map((it) => (
        <li key={it.question.id}>
          <QuestionReview question={it.question} attempt={it.attempt} number={it.number} />
        </li>
      ))}
    </ol>
  )
}
