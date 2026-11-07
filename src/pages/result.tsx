import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { RotateCcw } from 'lucide-react'
import { HISTORY_LIMIT, sessionStats, useQuizStore, wrongQuestionIds } from '@/store/quiz-store'
import type { Session } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScoreSummary } from '@/components/quiz/score-summary'
import { SessionReviewList } from '@/components/quiz/session-review-list'
import { StartSessionButton } from '@/components/quiz/start-session-button'
import { Celebration } from '@/components/quiz/celebration'

export default function ResultPage() {
  const { sessionId = '' } = useParams()
  const history = useQuizStore((s) => s.history)
  const activeId = useQuizStore((s) => s.activeSession?.id ?? null)
  const session = useMemo(() => history.find((s) => s.id === sessionId), [history, sessionId])

  if (!session) return <SessionNotFound inProgress={activeId === sessionId} />
  return (
    <SessionResult
      key={session.id}
      session={session}
      parentExists={!!session.parentId && history.some((s) => s.id === session.parentId)}
    />
  )
}

function SessionResult({ session, parentExists }: { session: Session; parentExists: boolean }) {
  const startRetrySession = useQuizStore((s) => s.startRetrySession)
  const startFullSession = useQuizStore((s) => s.startFullSession)
  const stats = useMemo(() => sessionStats(session), [session])
  const wrongCount = useMemo(() => wrongQuestionIds(session).length, [session])

  // Celebrate only when arriving straight from the last question — not from history or a reload.
  const location = useLocation()
  const navigate = useNavigate()
  const [celebrating, setCelebrating] = useState(
    () => (location.state as { justFinished?: boolean } | null)?.justFinished === true,
  )
  const endCelebration = useCallback(() => {
    setCelebrating(false)
    void navigate(location.pathname, { replace: true, state: null })
  }, [navigate, location.pathname])

  const actions = (
    <>
      {wrongCount > 0 && (
        <StartSessionButton
          start={() => startRetrySession(session.id)}
          failureMessage="Không tạo được lượt làm lại cho lượt này."
        >
          <RotateCcw aria-hidden />
          Làm lại {wrongCount} câu sai
        </StartSessionButton>
      )}
      <StartSessionButton
        start={startFullSession}
        variant={wrongCount > 0 ? 'outline' : 'default'}
        failureMessage="Ngân hàng câu hỏi đang trống. Nạp câu hỏi trước khi bắt đầu lượt mới."
      >
        Bắt đầu lượt mới
      </StartSessionButton>
      <Button asChild variant="ghost" size="lg">
        <Link to="/lich-su">Xem lịch sử</Link>
      </Button>
    </>
  )

  return (
    <div className="max-w-4xl">
      {celebrating && <Celebration onDone={endCelebration} />}
      <ScoreSummary session={session} stats={stats} parentExists={parentExists} actions={actions} />
      <SessionReviewList session={session} />
    </div>
  )
}

function SessionNotFound({ inProgress }: { inProgress: boolean }) {
  return (
    <section className="max-w-2xl rounded-md border border-rule bg-paper px-5 py-8 sm:px-10 sm:py-10">
      {inProgress ? (
        <>
          <h1 className="text-[22px] font-semibold text-ink">Lượt này chưa làm xong</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            Kết quả chỉ có khi bạn trả lời hết các câu trong lượt. Tiếp tục làm bài để xem kết quả.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/lam-bai">Tiếp tục làm bài</Link>
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-[22px] font-semibold text-ink">Không tìm thấy kết quả này</h1>
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">
            Lượt này không còn trong lịch sử — có thể lịch sử đã bị xóa, hoặc lượt đã cũ hơn {HISTORY_LIMIT} lượt gần nhất được lưu. Mở
            Lịch sử để xem các lượt còn lưu.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/lich-su">Mở lịch sử</Link>
          </Button>
        </>
      )}
    </section>
  )
}
