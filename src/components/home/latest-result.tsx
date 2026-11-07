import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmAction } from '@/components/upload/confirm-action'
import { formatDateTime, formatPercent, sessionKindLabel } from '@/components/home/format'
import type { Session } from '@/lib/types'
import { sessionStats, useQuizStore, wrongQuestionIds } from '@/store/quiz-store'

function RetryWrongButton({ sessionId, wrongCount }: { sessionId: string; wrongCount: number }) {
  const navigate = useNavigate()
  const active = useQuizStore((s) => s.activeSession)
  const startRetrySession = useQuizStore((s) => s.startRetrySession)
  const label = `Làm lại ${wrongCount} câu sai`

  const retry = () => {
    if (startRetrySession(sessionId)) void navigate('/lam-bai')
    else toast.error('Không tạo được lượt làm lại: lượt này không còn câu sai nào trong lịch sử.')
  }

  if (!active) {
    return (
      <Button variant="outline" className="bg-paper shadow-none" onClick={retry}>
        {label}
      </Button>
    )
  }

  const answered = Object.keys(active.attempts).length
  return (
    <ConfirmAction
      trigger={
        <Button variant="outline" className="bg-paper shadow-none">
          {label}
        </Button>
      }
      title="Bỏ lượt đang làm dở?"
      description={
        <p>
          Bạn đang làm dở một lượt ({answered}/{active.questions.length} câu). Bắt đầu làm lại câu sai sẽ hủy lượt đó,
          lượt bị hủy không được lưu vào lịch sử.
        </p>
      }
      actionLabel={`Bỏ lượt cũ, ${label.toLowerCase()}`}
      onConfirm={retry}
    />
  )
}

export function LatestResult({ session }: { session: Session }) {
  const stats = useMemo(() => sessionStats(session), [session])
  const wrongCount = useMemo(() => wrongQuestionIds(session).length, [session])

  return (
    <section aria-labelledby="latest-heading" className="grid gap-4 rounded-md border border-rule bg-paper p-5 sm:p-6">
      <div className="grid gap-1">
        <h2 id="latest-heading" className="text-[17px] font-semibold text-ink">
          Lượt gần nhất
        </h2>
        <p className="text-sm text-ink-soft">
          {sessionKindLabel(session.kind)}, xong lúc{' '}
          <span className="tabular">{formatDateTime(session.finishedAt ?? session.startedAt)}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-[30px] leading-none font-semibold text-ink tabular">{formatPercent(stats.percent)}</span>
        <span className="text-[15px] text-ink-soft">
          <span className="tabular">
            {stats.correct}/{stats.total}
          </span>{' '}
          câu đúng
        </span>
        {stats.overtime > 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-late">
            <Timer aria-hidden className="size-4" />
            <span className="tabular">{stats.overtime}</span> câu quá giờ
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="bg-paper shadow-none">
          <Link to={`/ket-qua/${session.id}`}>Xem chi tiết</Link>
        </Button>
        {wrongCount > 0 && <RetryWrongButton sessionId={session.id} wrongCount={wrongCount} />}
      </div>
    </section>
  )
}
