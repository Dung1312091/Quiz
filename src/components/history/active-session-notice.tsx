import { Link } from 'react-router'
import type { Session } from '@/lib/types'

/** One-line pointer back to the unfinished session. */
export function ActiveSessionNotice({ session }: { session: Session }) {
  const total = session.questions.length
  const current = Math.min(session.currentIndex + 1, total)

  return (
    <Link
      to="/lam-bai"
      className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md border border-rule bg-paper px-4 py-3 hover:bg-desk/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-6"
    >
      <span className="flex items-center gap-2.5 text-[15px] text-ink">
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-sheet" />
        <span>
          Đang có lượt làm dở — câu <span className="tabular">{current}/{total}</span>
        </span>
      </span>
      <span className="text-sm font-medium text-ink underline-offset-4 group-hover:underline">Làm tiếp</span>
    </Link>
  )
}
