import { useId } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useQuizStore } from '@/store/quiz-store'

export function SettingsDialog() {
  const showHint = useQuizStore((s) => s.settings.showAnswerCountHint)
  const setSettings = useQuizStore((s) => s.setSettings)
  const switchId = useId()
  const descId = useId()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Cài đặt" className="shrink-0 text-ink-soft hover:text-ink">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="bg-paper shadow-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
          <DialogDescription>Thay đổi được áp dụng ngay và lưu trên trình duyệt này.</DialogDescription>
        </DialogHeader>

        <div className="flex items-start justify-between gap-4 border-t border-rule pt-4">
          <div className="grid gap-1.5">
            <Label htmlFor={switchId} className="text-[15px] leading-snug">
              Gợi ý số đáp án cần chọn
            </Label>
            <p id={descId} className="text-sm text-ink-soft">
              Hiện "Chọn n đáp án" dưới câu có nhiều đáp án đúng.
            </p>
          </div>
          <Switch
            id={switchId}
            aria-describedby={descId}
            checked={showHint}
            onCheckedChange={(checked) => setSettings({ showAnswerCountHint: checked })}
            className="mt-0.5"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="shadow-none">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
