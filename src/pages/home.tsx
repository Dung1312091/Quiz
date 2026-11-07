import { Link } from 'react-router'
import { EmptyBank } from '@/components/home/empty-bank'
import { LatestResult } from '@/components/home/latest-result'
import { RecentHistory } from '@/components/home/recent-history'
import { ActiveSessionCard, StartSessionCard } from '@/components/home/session-cards'
import { selectQuestionCount, useQuizStore } from '@/store/quiz-store'

export default function HomePage() {
  const questionCount = useQuizStore(selectQuestionCount)
  const fileCount = useQuizStore((s) => Object.keys(s.sources).length)
  const activeSession = useQuizStore((s) => s.activeSession)
  const history = useQuizStore((s) => s.history)
  const latest = history[0]
  const bankEmpty = questionCount === 0

  return (
    <div className="grid max-w-5xl gap-8">
      <header className="grid gap-1.5">
        <h1 className="text-[30px] leading-tight font-semibold text-ink">Tổng quan</h1>
        {!bankEmpty && (
          <p className="text-[15px] text-ink-soft">
            Ngân hàng có <span className="font-semibold text-ink tabular">{questionCount}</span> câu hỏi từ{' '}
            <span className="tabular">{fileCount}</span> file.{' '}
            <Link to="/nap-cau-hoi" className="text-ink underline underline-offset-4 hover:no-underline">
              Nạp thêm hoặc quản lý file
            </Link>
          </p>
        )}
      </header>

      {bankEmpty && <EmptyBank />}

      {(!bankEmpty || activeSession || latest) && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          <div className="grid gap-5">
            {activeSession ? (
              <ActiveSessionCard session={activeSession} />
            ) : (
              !bankEmpty && <StartSessionCard questionCount={questionCount} />
            )}
            {latest && <LatestResult session={latest} />}
          </div>
          {(!bankEmpty || history.length > 0) && <RecentHistory history={history} />}
        </div>
      )}
    </div>
  )
}
