import { useMemo } from 'react'
import { Link } from 'react-router'
import { formatPercent, formatShortDateTime, sessionKindLabel } from '@/components/home/format'
import type { Session } from '@/lib/types'
import { sessionStats } from '@/store/quiz-store'

const RECENT_COUNT = 5

export function RecentHistory({ history }: { history: Session[] }) {
  const rows = useMemo(
    () => history.slice(0, RECENT_COUNT).map((s) => ({ session: s, stats: sessionStats(s) })),
    [history],
  )

  return (
    <section aria-labelledby="recent-heading" className="grid gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="recent-heading" className="text-[15px] font-semibold text-ink">
          Lịch sử gần đây
        </h2>
        {history.length > 0 && (
          <Link to="/lich-su" className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
            Xem tất cả
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-soft">Chưa có lượt nào hoàn thành. Kết quả mỗi lượt sẽ hiện ở đây.</p>
      ) : (
        <ul className="divide-y rounded-md border bg-paper">
          {rows.map(({ session, stats }) => (
            <li key={session.id}>
              <Link
                to={`/ket-qua/${session.id}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-desk focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="text-sm text-ink tabular">{formatShortDateTime(session.finishedAt ?? session.startedAt)}</span>
                  <span className="truncate text-[13px] text-ink-soft">
                    {sessionKindLabel(session.kind)}, {stats.total} câu
                  </span>
                </span>
                <span className="flex w-24 shrink-0 flex-col items-end gap-1">
                  <span className="text-[15px] font-semibold text-ink tabular">{formatPercent(stats.percent)}</span>
                  <span aria-hidden className="h-1 w-full overflow-hidden rounded-full bg-desk">
                    <span className="block h-full bg-pass" style={{ width: `${stats.percent}%` }} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
