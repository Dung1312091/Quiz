import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useQuizStore } from '@/store/quiz-store'
import type { Session } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Starts a session and goes to /lam-bai. If another session is in progress,
 * asks to confirm abandoning it first.
 */
export function StartSessionButton({
  start,
  failureMessage,
  children,
  variant = 'default',
  size = 'lg',
  className,
}: {
  /** Store action that replaces the active session; returns null when nothing could be started. */
  start: () => Session | null
  failureMessage: string
  children: ReactNode
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}) {
  const navigate = useNavigate()
  const active = useQuizStore((s) => s.activeSession)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const run = () => {
    if (!start()) {
      toast.error(failureMessage)
      return
    }
    void navigate('/lam-bai')
  }

  const answered = active ? Object.keys(active.attempts).length : 0
  const total = active?.questions.length ?? 0

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => (active ? setConfirmOpen(true) : run())}>
        {children}
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ lượt đang làm dở?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang có một lượt làm dở ({answered}/{total} câu đã trả lời). Bắt đầu lượt mới sẽ bỏ lượt đó, và nó không
              được lưu vào lịch sử.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ lượt đang làm</AlertDialogCancel>
            <AlertDialogAction onClick={run}>Bỏ và bắt đầu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
