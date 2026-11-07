import type { SessionStats } from '@/store/quiz-store'

/** Thin segmented bar: correct / wrong / not yet answered. */
export function SessionBar({ stats }: { stats: SessionStats }) {
  const { total, correct, wrong } = stats
  const pct = (n: number) => (total ? (n / total) * 100 : 0)
  const remaining = total - correct - wrong

  return (
    <div
      role="img"
      aria-label={`${correct} đúng, ${wrong} sai, ${remaining} chưa làm trên tổng ${total} câu`}
      className="flex h-2 w-full overflow-hidden rounded-full bg-desk"
    >
      <span className="h-full bg-pass" style={{ width: `${pct(correct)}%` }} />
      <span className="h-full bg-fail" style={{ width: `${pct(wrong)}%` }} />
    </div>
  )
}
