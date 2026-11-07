import { memo } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import type { Session } from '@/lib/types'
import { sessionStats } from '@/store/quiz-store'
import { AnswerStrip } from './answer-strip'
import { formatDateTime, formatDuration, formatPercent } from './format'

const KIND_LABEL: Record<Session['kind'], string> = {
  full: 'Lượt đầy đủ',
  retry: 'Lượt làm lại',
}

export const SessionRow = memo(function SessionRow({ session }: { session: Session }) {
  const stats = sessionStats(session)
  const duration = session.finishedAt ? formatDuration(session.finishedAt - session.startedAt) : null

  return (
    <li>
      <Link
        to={`/ket-qua/${session.id}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-4 px-4 py-4 hover:bg-desk/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:px-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="font-medium text-ink tabular">{formatDateTime(session.startedAt)}</span>
            <span className="text-[13px] text-ink-soft">{KIND_LABEL[session.kind]}</span>
          </div>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-ink-faint">
            <span className="tabular sm:hidden">
              {stats.correct}/{stats.total} câu đúng
            </span>
            {duration && <span>Làm trong {duration}</span>}
            {stats.overtime > 0 && (
              <span className="text-late tabular">{stats.overtime} câu quá giờ</span>
            )}
          </div>

          <AnswerStrip session={session} className="mt-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[22px] leading-tight font-semibold text-ink tabular">
              {formatPercent(stats.percent)}
            </div>
            <div className="hidden text-[13px] text-ink-soft tabular sm:block">
              {stats.correct}/{stats.total} câu đúng
            </div>
          </div>
          <ChevronRight aria-hidden className="size-4 text-ink-faint group-hover:text-ink" />
        </div>
      </Link>
    </li>
  )
})
