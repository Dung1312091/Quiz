import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { sessionStats, useQuizStore } from '@/store/quiz-store'
import type { Session } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { QuizEmptyState } from '@/components/quiz/quiz-empty-state'
import { QuestionPaper } from '@/components/quiz/question-paper'
import { QuestionReview } from '@/components/quiz/question-review'
import { AnswerSheet } from '@/components/quiz/answer-sheet'
import { useSpaceToAdvance } from '@/components/quiz/use-space-to-advance'

export default function QuizPage() {
  const session = useQuizStore((s) => s.activeSession)
  if (!session) return <QuizEmptyState />
  // Keyed by session so review state etc. reset when a new session starts.
  return <ActiveQuiz key={session.id} session={session} />
}

function ActiveQuiz({ session }: { session: Session }) {
  const navigate = useNavigate()
  const submitAnswer = useQuizStore((s) => s.submitAnswer)
  const advance = useQuizStore((s) => s.advance)
  const showAnswerCountHint = useQuizStore((s) => s.settings.showAnswerCountHint)

  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  // Only move focus to the question after the user advanced — not on first load.
  const [hasAdvanced, setHasAdvanced] = useState(false)

  const stats = useMemo(() => sessionStats(session), [session])
  const total = session.questions.length
  const index = session.currentIndex
  const current = session.questions[index]
  const currentAttempt = current ? session.attempts[current.id] : undefined
  const isLast = index >= total - 1

  const reviewIndex = reviewingId ? session.questions.findIndex((q) => q.id === reviewingId) : -1
  const reviewing = reviewIndex >= 0 ? session.questions[reviewIndex] : null

  const handleAdvance = useCallback(() => {
    const { finishedSessionId } = advance()
    if (finishedSessionId) {
      void navigate(`/ket-qua/${finishedSessionId}`, { state: { justFinished: true } })
      return
    }
    setReviewingId(null)
    setHasAdvanced(true)
  }, [advance, navigate])

  useSpaceToAdvance(currentAttempt !== undefined && reviewing === null, handleAdvance)

  const selectFromSheet = (id: string | null) => {
    setReviewingId(id)
    setSheetOpen(false)
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
      <h1 className="sr-only">Làm bài</h1>

      <MobileSheetBar
        correct={stats.correct}
        wrong={stats.wrong}
        remaining={stats.total - stats.answered}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      >
        <AnswerSheet session={session} stats={stats} reviewingId={reviewingId} onSelect={selectFromSheet} showTitle={false} />
      </MobileSheetBar>

      <div className="min-w-0">
        {reviewing && (
          <QuestionReview
            question={reviewing}
            attempt={session.attempts[reviewing.id]}
            number={reviewIndex + 1}
            className="sm:p-8"
          >
            <div className="mt-6 border-t border-rule pt-5">
              <Button size="lg" variant="outline" autoFocus onClick={() => setReviewingId(null)}>
                <ArrowLeft aria-hidden />
                Quay lại câu đang làm
              </Button>
            </div>
          </QuestionReview>
        )}
        {/* Kept mounted (just hidden) while reviewing so the selection and the timer survive. */}
        <div hidden={reviewing !== null}>
          {current ? (
            <QuestionPaper
              key={current.id}
              question={current}
              number={index + 1}
              total={total}
              attempt={currentAttempt}
              isRetry={session.kind === 'retry'}
              showAnswerCountHint={showAnswerCountHint}
              isLast={isLast}
              focusOnMount={hasAdvanced}
              onSubmit={(selected, elapsedMs) => submitAnswer(selected, elapsedMs)}
              onContinue={handleAdvance}
            />
          ) : (
            // Defensive: index past the end (should not happen) — let the user close out the session.
            <div className="rounded-md border border-rule bg-paper p-6">
              <p className="text-[15px] text-ink-soft">Lượt này đã hết câu hỏi.</p>
              <Button className="mt-4" onClick={handleAdvance}>
                Xem kết quả
              </Button>
            </div>
          )}
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-6 lg:block">
        <AnswerSheet session={session} stats={stats} reviewingId={reviewingId} onSelect={setReviewingId} />
      </aside>
    </div>
  )
}

/** Mobile/tablet: compact counters + button opening the answer sheet in a Sheet. */
function MobileSheetBar({
  correct,
  wrong,
  remaining,
  open,
  onOpenChange,
  children,
}: {
  correct: number
  wrong: number
  remaining: number
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-rule bg-desk px-4 py-2 sm:-mx-6 sm:px-6 lg:hidden">
      <dl className="flex items-center gap-4 text-[13px]">
        <Counter label="Đúng" value={correct} tone="text-pass" />
        <Counter label="Sai" value={wrong} tone="text-fail" />
        <Counter label="Còn lại" value={remaining} tone="text-ink" />
      </dl>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="bg-paper">
            <ClipboardList aria-hidden />
            Phiếu trả lời
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[88vw] gap-0 overflow-y-auto bg-desk p-3 sm:max-w-sm">
          <SheetHeader className="px-1 pt-1 pb-3">
            <SheetTitle className="text-sheet">Phiếu trả lời</SheetTitle>
            <SheetDescription className="sr-only">Tình trạng các câu trong lượt đang làm</SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Counter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={`font-semibold tabular ${tone}`}>{value}</dd>
    </div>
  )
}
