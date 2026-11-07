import { useQuizStore } from '@/store/quiz-store'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

/** Quiet "Bỏ lượt này" action with confirmation. */
export function AbandonSessionButton({ answered, total }: { answered: number; total: number }) {
  const abandonSession = useQuizStore((s) => s.abandonSession)
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-ink-soft hover:text-fail">
          Bỏ lượt này
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bỏ lượt đang làm?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn đã trả lời {answered}/{total} câu. Lượt này sẽ không được lưu vào lịch sử và không thể tiếp tục lại.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Làm tiếp</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={abandonSession}>
            Bỏ lượt
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
