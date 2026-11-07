import { NavLink, Outlet } from 'react-router'
import { useEffect } from 'react'
import { BookOpenCheck, FileUp, History, LayoutGrid, PencilLine, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { onStorageError, useQuizStore } from '@/store/quiz-store'
import { SettingsDialog } from '@/components/settings-dialog'

const NAV: { to: string; label: string; short: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: 'Tổng quan', short: 'Tổng quan', icon: LayoutGrid, end: true },
  { to: '/lam-bai', label: 'Làm bài', short: 'Làm bài', icon: PencilLine },
  { to: '/dap-an', label: 'Đáp án', short: 'Đáp án', icon: BookOpenCheck },
  { to: '/lich-su', label: 'Lịch sử', short: 'Lịch sử', icon: History },
  { to: '/nap-cau-hoi', label: 'Nạp câu hỏi', short: 'Nạp câu', icon: FileUp },
]

function ActiveDot() {
  return <span className="inline-block size-1.5 rounded-full bg-sheet" title="Đang có lượt làm dở" />
}

export function AppShell() {
  const hasActive = useQuizStore((s) => s.activeSession !== null)

  useEffect(
    () =>
      onStorageError((msg) => {
        toast.error(msg, { id: 'storage-error', duration: 8000 })
      }),
    [],
  )

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 py-3 font-semibold text-ink">
            <span aria-hidden className="flex gap-0.5">
              <span className="size-3 rounded-full border-[1.5px] border-sheet-rule" />
              <span className="size-3 rounded-full bg-lead" />
            </span>
            <span>Ôn tập trắc nghiệm</span>
          </NavLink>
          {/* Desktop / tablet: tabs in the header */}
          <nav className="-mb-px hidden flex-1 gap-1 sm:flex" aria-label="Điều hướng chính">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative inline-flex items-center gap-1.5 border-b-2 px-3 py-3.5 text-sm whitespace-nowrap text-ink-soft hover:text-ink',
                    isActive ? 'border-ink font-medium text-ink' : 'border-transparent',
                  )
                }
              >
                {item.label}
                {item.to === '/lam-bai' && hasActive && <ActiveDot />}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto sm:ml-0">
            <SettingsDialog />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-[calc(var(--mobile-nav-h)+env(safe-area-inset-bottom)+2rem)] sm:px-6 sm:py-10">
        <Outlet />
      </main>

      {/* Phone: thumb-reachable tab bar at the bottom */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="grid h-(--mobile-nav-h) grid-cols-5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-full flex-col items-center justify-center gap-1 text-[11px] leading-none',
                    isActive ? 'font-semibold text-ink' : 'text-ink-faint',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span aria-hidden className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-ink" />}
                    <span className="relative">
                      <item.icon aria-hidden className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
                      {item.to === '/lam-bai' && hasActive && (
                        <span className="absolute -top-0.5 -right-1.5">
                          <ActiveDot />
                        </span>
                      )}
                    </span>
                    {item.short}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
