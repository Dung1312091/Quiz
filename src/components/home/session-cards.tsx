import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SessionBar } from '@/components/home/session-bar'
import { formatDateTime, sessionKindLabel } from '@/components/home/format'
import type { Session } from '@/lib/types'
import { sessionStats, useQuizStore } from '@/store/quiz-store'

export function ActiveSessionCard({ session }: { session: Session }) {
  const stats = useMemo(() => sessionStats(session), [session])
  const current = Math.min(session.currentIndex + 1, stats.total)

  return (
    <section aria-labelledby="active-heading" className="grid gap-4 rounded-md border border-rule bg-paper p-5 sm:p-6">
      <div className="grid gap-1">
        <h2 id="active-heading" className="text-[17px] font-semibold text-ink">
          Lượt đang làm dở
        </h2>
        <p className="text-sm text-ink-soft">
          {sessionKindLabel(session.kind)}, bắt đầu lúc <span className="tabular">{formatDateTime(session.startedAt)}</span>
        </p>
      </div>

      <div className="grid gap-2.5">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[15px]">
          <span className="text-ink">
            Câu{' '}
            <span className="font-semibold tabular">
              {current}/{stats.total}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-pass">
            <Check aria-hidden className="size-4" />
            <span className="tabular">{stats.correct}</span> đúng
          </span>
          <span className="inline-flex items-center gap-1 text-fail">
            <X aria-hidden className="size-4" />
            <span className="tabular">{stats.wrong}</span> sai
          </span>
        </div>
        <SessionBar stats={stats} />
      </div>

      <div>
        <Button asChild size="lg">
          <Link to="/lam-bai">Tiếp tục lượt đang làm</Link>
        </Button>
      </div>
    </section>
  )
}

export function StartSessionCard({ questionCount }: { questionCount: number }) {
  const navigate = useNavigate()
  const startFullSession = useQuizStore((s) => s.startFullSession)

  const start = () => {
    if (startFullSession()) void navigate('/lam-bai')
    else toast.error('Ngân hàng chưa có câu hỏi nào. Nạp file trước khi bắt đầu.')
  }

  return (
    <section aria-labelledby="start-heading" className="grid gap-4 rounded-md border border-rule bg-paper p-5 sm:p-6">
      <div className="grid gap-1">
        <h2 id="start-heading" className="text-[17px] font-semibold text-ink">
          Sẵn sàng cho lượt mới
        </h2>
        <p className="max-w-prose text-sm text-ink-soft">
          Lượt mới gồm toàn bộ <span className="tabular">{questionCount}</span> câu, xáo trộn thứ tự. Đúng hay sai được
          báo ngay sau mỗi câu.
        </p>
      </div>
      <div>
        <Button size="lg" onClick={start}>
          Bắt đầu lượt mới
        </Button>
      </div>
    </section>
  )
}
