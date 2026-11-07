import { Link } from 'react-router'
import { Bubble } from '@/components/bubble'
import { Button } from '@/components/ui/button'
import { selectQuestionCount, useQuizStore } from '@/store/quiz-store'
import { StartSessionButton } from './start-session-button'

/** /lam-bai when no session is in progress. */
export function QuizEmptyState() {
  const bankSize = useQuizStore(selectQuestionCount)
  const startFullSession = useQuizStore((s) => s.startFullSession)
  const lastSessionId = useQuizStore((s) => s.history[0]?.id ?? null)

  return (
    <section className="max-w-2xl rounded-md border border-rule bg-paper px-5 py-8 sm:px-10 sm:py-12">
      <div aria-hidden className="mb-6 flex gap-2">
        <Bubble index={0} />
        <Bubble index={1} state="filled" />
        <Bubble index={2} />
        <Bubble index={3} />
      </div>

      {bankSize === 0 ? (
        <>
          <h1 className="text-[22px] font-semibold text-ink">Chưa có câu hỏi để làm bài</h1>
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">
            Ngân hàng câu hỏi đang trống. Nạp một hoặc nhiều file Excel câu hỏi, sau đó quay lại đây để bắt đầu một lượt.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/nap-cau-hoi">Nạp câu hỏi</Link>
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-[22px] font-semibold text-ink">Sẵn sàng làm bài</h1>
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">
            Ngân hàng có <span className="font-semibold text-ink tabular">{bankSize}</span> câu hỏi. Mỗi lượt gồm toàn bộ
            câu hỏi theo thứ tự xáo trộn; chấm điểm ngay sau mỗi câu.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StartSessionButton start={startFullSession} failureMessage="Ngân hàng câu hỏi đang trống. Nạp câu hỏi trước khi làm bài.">
              Bắt đầu lượt mới
            </StartSessionButton>
            {lastSessionId && (
              <Button asChild variant="ghost" size="lg">
                <Link to={`/ket-qua/${lastSessionId}`}>Xem kết quả lượt trước</Link>
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
