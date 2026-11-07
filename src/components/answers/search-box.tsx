import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

const DEBOUNCE_MS = 150

/**
 * Search input with a local draft, committed (debounced) via `onCommit`.
 * External changes to `value` (e.g. "Xóa bộ lọc") are synced back into the draft.
 */
export function SearchBox({ value, onCommit }: { value: string; onCommit: (query: string) => void }) {
  const [draft, setDraft] = useState(value)
  const lastCommitted = useRef(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync when the URL changes from outside this box.
  useEffect(() => {
    if (value !== lastCommitted.current) {
      lastCommitted.current = value
      setDraft(value)
    }
  }, [value])

  useEffect(() => {
    if (draft === lastCommitted.current) return
    const t = window.setTimeout(() => {
      lastCommitted.current = draft
      onCommit(draft)
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [draft, onCommit])

  const clear = () => {
    setDraft('')
    lastCommitted.current = ''
    onCommit('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <label htmlFor="answer-search" className="sr-only">
        Tìm câu hỏi
      </label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
      <Input
        ref={inputRef}
        id="answer-search"
        type="search"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && draft) {
            e.preventDefault()
            clear()
          }
        }}
        placeholder="Tìm theo câu hỏi hoặc đáp án…"
        className="h-11 bg-paper pr-10 pl-9 text-[15px] shadow-none md:text-[15px] [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={clear}
          aria-label="Xóa từ khóa"
          className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint hover:bg-desk hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
