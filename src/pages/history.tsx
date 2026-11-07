import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { HISTORY_LIMIT, selectQuestionCount, useQuizStore } from '@/store/quiz-store'
import { ActiveSessionNotice } from '@/components/history/active-session-notice'
import { SessionRow } from '@/components/history/session-row'

export default function HistoryPage() {
  const history = useQuizStore((s) => s.history)
  const activeSession = useQuizStore((s) => s.activeSession)
  const questionCount = useQuizStore(selectQuestionCount)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[30px] leading-tight font-semibold text-ink">Lịch sử</h1>
        <p className="mt-1.5 text-[15px] text-ink-soft">Các lượt đã hoàn thành, mới nhất ở trên. Chọn một lượt để xem lại từng câu.</p>
      </header>

      {activeSession && <ActiveSessionNotice session={activeSession} />}

      {history.length === 0 ? (
        <EmptyHistory hasQuestions={questionCount > 0} hasActive={!!activeSession} />
      ) : (
        <section aria-label="Các lượt đã hoàn thành" className="space-y-3">
          <ol className="divide-y divide-rule rounded-md border border-rule bg-paper">
            {history.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </ol>
          <p className="text-[13px] text-ink-faint">
            Chỉ lưu {HISTORY_LIMIT} lượt gần nhất; lượt cũ hơn tự động bị xóa.
          </p>
        </section>
      )}
    </div>
  )
}

function EmptyHistory({ hasQuestions, hasActive }: { hasQuestions: boolean; hasActive: boolean }) {
  return (
    <div className="rounded-md border border-rule bg-paper px-5 py-8 sm:px-8">
      <p className="text-[17px] font-medium text-ink">Chưa có lượt nào hoàn thành.</p>
      <p className="mt-1.5 max-w-[60ch] text-[15px] text-ink-soft">
        {hasQuestions
          ? 'Làm xong một lượt, kết quả sẽ được lưu ở đây để xem lại và làm lại các câu sai.'
          : 'Nạp câu hỏi trước, rồi làm một lượt — kết quả sẽ được lưu ở đây.'}
      </p>
      {hasQuestions ? (
        !hasActive && (
          <Button asChild className="mt-5">
            <Link to="/lam-bai">Bắt đầu làm bài</Link>
          </Button>
        )
      ) : (
        <Button asChild className="mt-5">
          <Link to="/nap-cau-hoi">Nạp câu hỏi</Link>
        </Button>
      )}
    </div>
  )
}
