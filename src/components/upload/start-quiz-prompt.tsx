import { useNavigate } from 'react-router'
import { toast } from 'sonner'
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
import { useQuizStore } from '@/store/quiz-store'

/**
 * Asked right after a successful build: go straight to the quiz?
 * - No session in progress → starts a new full session over the whole bank, then opens /lam-bai.
 * - A session in progress → just opens /lam-bai to continue it (new questions join from the next lượt).
 */
export function StartQuizPrompt({
  open,
  onOpenChange,
  added,
  updated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  added: number
  updated: number
}) {
  const navigate = useNavigate()
  const bankSize = useQuizStore((s) => Object.keys(s.bank).length)
  const activeProgress = useQuizStore((s) =>
    s.activeSession ? `${s.activeSession.currentIndex + 1}/${s.activeSession.questions.length}` : null,
  )

  const changes = [added > 0 && `${added} câu mới`, updated > 0 && `${updated} câu cập nhật`].filter(Boolean).join(', ')

  const go = () => {
    if (!activeProgress) {
      const session = useQuizStore.getState().startFullSession()
      if (!session) {
        toast.error('Ngân hàng câu hỏi đang trống. Nạp câu hỏi trước khi bắt đầu.')
        return
      }
    }
    void navigate('/lam-bai')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="shadow-none">
        <AlertDialogHeader>
          <AlertDialogTitle>Build xong. Bắt đầu làm bài luôn?</AlertDialogTitle>
          <AlertDialogDescription>
            Ngân hàng hiện có {bankSize} câu{changes ? ` (${changes})` : ''}.{' '}
            {activeProgress
              ? `Bạn đang có một lượt làm dở ở câu ${activeProgress}; câu mới sẽ có từ lượt sau.`
              : 'Lượt mới gồm toàn bộ câu trong ngân hàng, thứ tự được trộn ngẫu nhiên.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Để sau</AlertDialogCancel>
          <AlertDialogAction onClick={go}>
            {activeProgress ? 'Tiếp tục lượt đang làm' : 'Bắt đầu làm bài'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
