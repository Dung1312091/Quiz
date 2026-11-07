import { useEffect, useRef, useState, type DragEvent } from 'react'
import { Button } from '@/components/ui/button'
import { ACCEPTED_EXTENSIONS } from '@/lib/parser'
import { cn } from '@/lib/utils'

/** Two stacked answer sheets — the "place your sheets here" mark. */
function SheetStack({ active }: { active: boolean }) {
  return (
    <span aria-hidden className="relative block h-16 w-14 shrink-0">
      <span
        className={cn(
          'absolute inset-0 rounded-sm border border-rule bg-paper transition-transform duration-150',
          active ? 'rotate-[-10deg] -translate-x-1' : '-rotate-6',
        )}
      />
      <span
        className={cn(
          'absolute inset-0 flex flex-col gap-2 rounded-sm border border-sheet-rule bg-paper p-2 transition-transform duration-150',
          active ? 'rotate-3 translate-x-1' : 'rotate-2',
        )}
      >
        {[1, 0, 2].map((filled, row) => (
          <span key={row} className="flex gap-1">
            {[0, 1, 2].map((col) => (
              <span
                key={col}
                className={cn(
                  'size-2 rounded-full',
                  col === filled ? 'bg-lead' : 'border border-sheet-rule bg-paper',
                )}
              />
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}

export function DropZone({ onFiles, disabled }: { onFiles: (files: File[]) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  // dragenter/dragleave fire for every child; count depth to know when we really left.
  const depth = useRef(0)

  // A file dropped just outside the zone would otherwise make the browser open it and leave the app.
  useEffect(() => {
    const block = (e: globalThis.DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault()
    }
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])

  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

  const onDragEnter = (e: DragEvent) => {
    if (!hasFiles(e) || disabled) return
    e.preventDefault()
    depth.current++
    setDragging(true)
  }
  const onDragOver = (e: DragEvent) => {
    if (!hasFiles(e) || disabled) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  const onDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setDragging(false)
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    depth.current = 0
    setDragging(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'flex flex-col gap-4 rounded-md border-2 border-dashed p-5 transition-colors duration-150 sm:flex-row sm:items-center sm:gap-5 sm:p-6',
        dragging ? 'border-sheet bg-sheet-wash' : 'border-sheet-rule bg-desk',
        disabled && 'opacity-60',
      )}
    >
      <SheetStack active={dragging} />
      <div className="grid flex-1 gap-1">
        <p className="text-[17px] font-semibold text-ink">
          {dragging ? (
            'Thả file vào đây'
          ) : (
            <>
              <span className="pointer-coarse:hidden">Kéo file Excel hoặc CSV vào đây</span>
              <span className="hidden pointer-coarse:inline">Chọn file Excel hoặc CSV</span>
            </>
          )}
        </p>
        <p className="text-sm text-ink-soft">
          Có thể thêm nhiều file, nhiều lần. File chỉ được đọc khi bạn bấm Build.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="self-start bg-paper shadow-none sm:self-center"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Chọn file
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          // Reset so picking the same file again still fires onChange.
          e.target.value = ''
          if (files.length) onFiles(files)
        }}
      />
    </div>
  )
}
