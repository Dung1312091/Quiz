import { NavLink, Outlet } from 'react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { onStorageError, useQuizStore } from '@/store/quiz-store'
import { SettingsDialog } from '@/components/settings-dialog'

const NAV = [
  { to: '/', label: 'Tổng quan', end: true },
  { to: '/lam-bai', label: 'Làm bài' },
  { to: '/dap-an', label: 'Đáp án' },
  { to: '/lich-su', label: 'Lịch sử' },
  { to: '/nap-cau-hoi', label: 'Nạp câu hỏi' },
]

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
            <span className="hidden sm:inline">Ôn tập trắc nghiệm</span>
          </NavLink>
          <nav className="-mb-px flex flex-1 gap-1 overflow-x-auto" aria-label="Điều hướng chính">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative whitespace-nowrap border-b-2 px-3 py-3.5 text-sm text-ink-soft hover:text-ink',
                    isActive ? 'border-ink font-medium text-ink' : 'border-transparent',
                  )
                }
              >
                {item.label}
                {item.to === '/lam-bai' && hasActive && (
                  <span className="ml-1.5 inline-block size-1.5 -translate-y-0.5 rounded-full bg-sheet" title="Đang có lượt làm dở" />
                )}
              </NavLink>
            ))}
          </nav>
          <SettingsDialog />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
