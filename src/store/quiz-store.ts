import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type {
  Attempt,
  FileImportSummary,
  ImportReport,
  LastResult,
  ParsedFile,
  Question,
  QuestionSnapshot,
  Session,
  Settings,
  SourceFile,
} from '@/lib/types'
import { questionId, shuffle, uid } from '@/lib/text'

export const HISTORY_LIMIT = 50
const STORAGE_KEY = 'on-tap-trac-nghiem:v1'

/* ---------- storage with quota handling ---------- */

type StorageErrorListener = (message: string) => void
const storageErrorListeners = new Set<StorageErrorListener>()
/** Subscribe to localStorage write failures (e.g. quota exceeded). Returns unsubscribe. */
export function onStorageError(fn: StorageErrorListener) {
  storageErrorListeners.add(fn)
  return () => {
    storageErrorListeners.delete(fn)
  }
}

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch (err) {
      const quota =
        err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)
      const msg = quota
        ? 'Bộ nhớ trình duyệt đã đầy, thay đổi mới nhất chưa được lưu. Xóa bớt lịch sử hoặc file nguồn rồi thử lại.'
        : 'Không lưu được dữ liệu vào trình duyệt.'
      storageErrorListeners.forEach((fn) => fn(msg))
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}

/* ---------- pure helpers ---------- */

export function snapshot(q: Question): QuestionSnapshot {
  return { id: q.id, text: q.text, options: q.options, correct: q.correct, timeLimit: q.timeLimit }
}

export function isMultiAnswer(q: Pick<Question, 'correct'>): boolean {
  return q.correct.length > 1
}

/** Exact match: every correct option selected and nothing else. */
export function grade(correct: number[], selected: number[]): boolean {
  if (correct.length !== selected.length) return false
  const s = new Set(selected)
  return correct.every((c) => s.has(c))
}

function sameQuestionContent(a: Omit<Question, 'id' | 'sources' | 'updatedAt'>, b: Question): boolean {
  return (
    a.text === b.text &&
    a.timeLimit === b.timeLimit &&
    JSON.stringify(a.options) === JSON.stringify(b.options) &&
    JSON.stringify(a.correct) === JSON.stringify(b.correct)
  )
}

export interface SessionStats {
  total: number
  answered: number
  correct: number
  wrong: number
  overtime: number
  /** 0–100, correct / total, rounded to 1 decimal. */
  percent: number
}

export function sessionStats(s: Session): SessionStats {
  const attempts = Object.values(s.attempts)
  const correct = attempts.filter((a) => a.correct).length
  const total = s.questions.length
  return {
    total,
    answered: attempts.length,
    correct,
    wrong: attempts.length - correct,
    overtime: attempts.filter((a) => a.overtime).length,
    percent: total ? Math.round((correct / total) * 1000) / 10 : 0,
  }
}

export function wrongQuestionIds(s: Session): string[] {
  return s.questions.filter((q) => s.attempts[q.id] && !s.attempts[q.id].correct).map((q) => q.id)
}

/* ---------- store ---------- */

interface QuizState {
  bank: Record<string, Question>
  sources: Record<string, SourceFile>
  activeSession: Session | null
  /** Finished sessions, newest first, max HISTORY_LIMIT. */
  history: Session[]
  /** Latest result per question id (any session). Cleared when a question's correct answer changes. */
  lastResults: Record<string, LastResult>
  settings: Settings
  lastImport: ImportReport | null
}

interface QuizActions {
  /** Merge parsed files into the bank. Same-named files replace their previous version. */
  importFiles: (files: ParsedFile[]) => ImportReport
  /** Remove a source file; questions not contained in any other file are deleted. */
  removeSource: (name: string) => void
  /** Start a full session over the whole bank. Replaces any active session. */
  startFullSession: () => Session | null
  /** Start a retry session with the wrong answers of a finished session. */
  startRetrySession: (fromSessionId: string) => Session | null
  /** Grade & record the answer for the current question of the active session. */
  submitAnswer: (selected: number[], elapsedMs: number) => Attempt | null
  /** Move to the next question. When past the last one, finishes the session and returns its id. */
  advance: () => { finishedSessionId: string | null }
  abandonSession: () => void
  setSettings: (patch: Partial<Settings>) => void
  clearHistory: () => void
  resetAll: () => void
}

const initialState: QuizState = {
  bank: {},
  sources: {},
  activeSession: null,
  history: [],
  lastResults: {},
  settings: { showAnswerCountHint: false },
  lastImport: null,
}

export const useQuizStore = create<QuizState & QuizActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      importFiles: (files) => {
        const now = Date.now()
        const bank = { ...get().bank }
        const sources = { ...get().sources }
        const lastResults = { ...get().lastResults }
        const summaries: FileImportSummary[] = []

        for (const file of files) {
          const summary: FileImportSummary = {
            name: file.name,
            added: 0,
            updated: 0,
            unchanged: 0,
            removed: 0,
            errors: file.errors,
          }
          const previousIds = new Set(sources[file.name]?.questionIds ?? [])
          const ids: string[] = []

          for (const pq of file.questions) {
            const id = questionId(pq.text)
            if (ids.includes(id)) continue // duplicate inside the same file: first occurrence wins
            ids.push(id)
            const existing = bank[id]
            if (!existing) {
              bank[id] = { ...pq, id, sources: [file.name], updatedAt: now }
              summary.added++
            } else {
              const srcs = existing.sources.includes(file.name) ? existing.sources : [...existing.sources, file.name]
              if (sameQuestionContent(pq, existing)) {
                bank[id] = { ...existing, sources: srcs }
                summary.unchanged++
              } else {
                if (JSON.stringify(pq.correct) !== JSON.stringify(existing.correct)) delete lastResults[id]
                bank[id] = { ...pq, id, sources: srcs, updatedAt: now }
                summary.updated++
              }
            }
          }

          // A file with no valid rows never wipes its previous version.
          if (ids.length === 0) {
            summaries.push(summary)
            continue
          }

          // Questions that were in the previous version of this file but not anymore.
          for (const oldId of previousIds) {
            if (ids.includes(oldId)) continue
            const q = bank[oldId]
            if (!q) continue
            const remaining = q.sources.filter((s) => s !== file.name)
            if (remaining.length === 0) {
              delete bank[oldId]
              delete lastResults[oldId]
              summary.removed++
            } else {
              bank[oldId] = { ...q, sources: remaining }
            }
          }

          sources[file.name] = { name: file.name, questionIds: ids, importedAt: now }
          summaries.push(summary)
        }

        const report: ImportReport = {
          files: summaries,
          added: summaries.reduce((n, f) => n + f.added, 0),
          updated: summaries.reduce((n, f) => n + f.updated, 0),
          unchanged: summaries.reduce((n, f) => n + f.unchanged, 0),
          removed: summaries.reduce((n, f) => n + f.removed, 0),
          errorCount: summaries.reduce((n, f) => n + f.errors.length, 0),
          at: now,
        }
        set({ bank, sources, lastResults, lastImport: report })
        return report
      },

      removeSource: (name) => {
        const bank = { ...get().bank }
        const sources = { ...get().sources }
        const lastResults = { ...get().lastResults }
        const src = sources[name]
        if (!src) return
        for (const id of src.questionIds) {
          const q = bank[id]
          if (!q) continue
          const remaining = q.sources.filter((s) => s !== name)
          if (remaining.length === 0) {
            delete bank[id]
            delete lastResults[id]
          } else bank[id] = { ...q, sources: remaining }
        }
        delete sources[name]
        set({ bank, sources, lastResults })
      },

      startFullSession: () => {
        const questions = Object.values(get().bank)
        if (questions.length === 0) return null
        const session: Session = {
          id: uid('s'),
          kind: 'full',
          startedAt: Date.now(),
          questions: shuffle(questions).map(snapshot),
          attempts: {},
          currentIndex: 0,
        }
        set({ activeSession: session })
        return session
      },

      startRetrySession: (fromSessionId) => {
        const from = get().history.find((s) => s.id === fromSessionId)
        if (!from) return null
        const wrong = new Set(wrongQuestionIds(from))
        const qs = from.questions.filter((q) => wrong.has(q.id))
        if (qs.length === 0) return null
        // Prefer the latest bank version of each question if it still exists.
        const bank = get().bank
        const session: Session = {
          id: uid('s'),
          kind: 'retry',
          parentId: from.id,
          startedAt: Date.now(),
          questions: shuffle(qs).map((q) => (bank[q.id] ? snapshot(bank[q.id]) : q)),
          attempts: {},
          currentIndex: 0,
        }
        set({ activeSession: session })
        return session
      },

      submitAnswer: (selected, elapsedMs) => {
        const s = get().activeSession
        if (!s) return null
        const q = s.questions[s.currentIndex]
        if (!q || s.attempts[q.id]) return null
        const sorted = [...new Set(selected)].sort((a, b) => a - b)
        const attempt: Attempt = {
          questionId: q.id,
          selected: sorted,
          correct: grade(q.correct, sorted),
          overtime: elapsedMs > q.timeLimit * 1000,
          elapsedMs,
          answeredAt: Date.now(),
        }
        set({
          activeSession: { ...s, attempts: { ...s.attempts, [q.id]: attempt } },
          lastResults: { ...get().lastResults, [q.id]: { correct: attempt.correct, at: attempt.answeredAt } },
        })
        return attempt
      },

      advance: () => {
        const s = get().activeSession
        if (!s) return { finishedSessionId: null }
        const q = s.questions[s.currentIndex]
        if (q && !s.attempts[q.id]) return { finishedSessionId: null }
        const next = s.currentIndex + 1
        if (next < s.questions.length) {
          set({ activeSession: { ...s, currentIndex: next } })
          return { finishedSessionId: null }
        }
        const finished: Session = { ...s, currentIndex: s.questions.length, finishedAt: Date.now() }
        set({ activeSession: null, history: [finished, ...get().history].slice(0, HISTORY_LIMIT) })
        return { finishedSessionId: finished.id }
      },

      abandonSession: () => set({ activeSession: null }),
      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      clearHistory: () => set({ history: [] }),
      resetAll: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: ({ bank, sources, activeSession, history, lastResults, settings, lastImport }) => ({
        bank,
        sources,
        activeSession,
        history,
        lastResults,
        settings,
        lastImport,
      }),
    },
  ),
)

/* ---------- selectors ---------- */

export const selectQuestionCount = (s: QuizState) => Object.keys(s.bank).length
export const selectSourceList = (s: QuizState) =>
  Object.values(s.sources).sort((a, b) => b.importedAt - a.importedAt)
