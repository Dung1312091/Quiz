import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Session } from '@/lib/types'
import type { SessionStats } from '@/store/quiz-store'
import { formatDateTime, formatDuration, formatPercent } from './format'

/** The % written on the sheet like a teacher's grade: pink ink, loosely circled, slightly tilted. */
export function GradeMark({ percent }: { percent: number }) {
  const [whole, fraction] = formatPercent(percent).replace('%', '').split(',')
  return (
    <figure className="shrink-0 self-start" aria-label={`Điểm ${formatPercent(percent)}`}>
      <figcaption className="mb-1 text-[13px] font-medium text-sheet">Điểm</figcaption>
      <div
        aria-hidden
        className="inline-flex -rotate-6 items-baseline border-2 border-sheet px-5 py-3 text-sheet"
        style={{ borderRadius: '56% 44% 52% 48% / 48% 56% 44% 52%' }}
      >
        <span className="text-[44px] leading-none font-semibold tabular">{whole}</span>
        {fraction && <span className="text-[30px] leading-none font-semibold tabular">,{fraction}</span>}
        <span className="ml-0.5 text-[22px] leading-none font-medium">%</span>
      </div>
    </figure>
  )
}

const KIND_LABEL: Record<Session['kind'], string> = {
  full: 'Lượt đầy đủ',
  retry: 'Lượt làm lại câu sai',
}

/** Header of the result page: correct/total headline, details and the grade mark. */
export function ScoreSummary({
  session,
  stats,
  parentExists,
  actions,
}: {
  session: Session
  stats: SessionStats
  /** Whether the retried (parent) session is still in history, to link back to it. */
  parentExists: boolean
  actions: ReactNode
}) {
  const finishedAt = session.finishedAt ?? session.startedAt
  const details: { label: string; value: ReactNode; tone?: string }[] = [
    { label: 'Câu sai', value: stats.wrong, tone: stats.wrong ? 'text-fail' : undefined },
    { label: 'Quá giờ', value: stats.overtime, tone: stats.overtime ? 'text-late' : undefined },
    { label: 'Thời gian làm', value: formatDuration(finishedAt - session.startedAt) },
    { label: 'Hoàn thành lúc', value: formatDateTime(finishedAt) },
  ]
  if (stats.answered < stats.total) {
    details.splice(2, 0, { label: 'Chưa trả lời', value: stats.total - stats.answered })
  }

  return (
    <section className="rounded-md border border-rule bg-paper px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[15px] text-ink-soft">
            {KIND_LABEL[session.kind]}
            {session.kind === 'retry' && session.parentId && parentExists && (
              <>
                {' '}
                (từ{' '}
                <Link to={`/ket-qua/${session.parentId}`} className="underline underline-offset-2 hover:text-ink">
                  lượt trước
                </Link>
                )
              </>
            )}
          </p>
          <h1 className="mt-1 text-[30px] leading-tight font-semibold text-ink tabular">
            {stats.correct}/{stats.total} câu đúng
          </h1>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-[13px] text-ink-soft">{d.label}</dt>
                <dd className={`mt-0.5 text-[17px] font-semibold tabular ${d.tone ?? 'text-ink'}`}>{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <GradeMark percent={stats.percent} />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-rule pt-6">{actions}</div>
    </section>
  )
}
