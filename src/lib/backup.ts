import type { LastResult, Question, Session, Settings, SourceFile } from './types'
import { STORAGE_KEY, STORAGE_VERSION, useQuizStore, type QuizState } from '@/store/quiz-store'

/** Identifies our backup files; anything else is rejected before touching stored data. */
export const BACKUP_APP = 'on-tap-trac-nghiem'
export const BACKUP_VERSION = 1

export interface BackupData {
  bank: Record<string, Question>
  sources: Record<string, SourceFile>
  activeSession: Session | null
  history: Session[]
  lastResults: Record<string, LastResult>
  settings: Settings
}

export interface BackupFile {
  app: typeof BACKUP_APP
  version: number
  exportedAt: number
  data: BackupData
}

export interface BackupSummary {
  exportedAt: number
  questionCount: number
  sourceCount: number
  historyCount: number
  /** 1-based question number the in-progress session is at, and its size. */
  active: { at: number; total: number; retry: boolean } | null
}

export type ReadBackupResult =
  | { ok: true; backup: BackupFile; summary: BackupSummary }
  | { ok: false; error: string }

/* ---------- export ---------- */

export function createBackup(state: QuizState = useQuizStore.getState()): BackupFile {
  const { bank, sources, activeSession, history, lastResults, settings } = state
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    data: { bank, sources, activeSession, history, lastResults, settings },
  }
}

export function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${BACKUP_APP}-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}

export function backupToFile(backup: BackupFile): File {
  return new File([JSON.stringify(backup)], backupFileName(new Date(backup.exportedAt)), { type: 'application/json' })
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** True when the browser can hand a file to the OS share sheet (mostly mobile). */
export function canShareFile(file: File): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
}

/* ---------- import: structural validation ---------- */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isIdxArray = (v: unknown): v is number[] => Array.isArray(v) && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 3)

function isSnapshot(v: unknown): boolean {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.text) &&
    isNum(v.timeLimit) &&
    isIdxArray(v.correct) &&
    (v.correct as number[]).length > 0 &&
    Array.isArray(v.options) &&
    v.options.length >= 2 &&
    v.options.every((o) => isObj(o) && Number.isInteger(o.index) && isStr(o.text))
  )
}

function isQuestion(v: unknown): v is Question {
  return isSnapshot(v) && isObj(v) && Array.isArray(v.sources) && v.sources.every(isStr) && isNum(v.updatedAt)
}

function isAttempt(v: unknown): boolean {
  return isObj(v) && isStr(v.questionId) && isIdxArray(v.selected) && typeof v.correct === 'boolean' && typeof v.overtime === 'boolean' && isNum(v.elapsedMs)
}

function isSession(v: unknown): v is Session {
  return (
    isObj(v) &&
    isStr(v.id) &&
    (v.kind === 'full' || v.kind === 'retry') &&
    isNum(v.startedAt) &&
    Number.isInteger(v.currentIndex) &&
    Array.isArray(v.questions) &&
    v.questions.every(isSnapshot) &&
    isObj(v.attempts) &&
    Object.values(v.attempts).every(isAttempt)
  )
}

/** Copies a JSON record into a prototype-less map, keeping only valid entries. */
function cleanRecord<T>(v: unknown, valid: (x: unknown, key: string) => x is T): Record<string, T> | null {
  if (!isObj(v)) return null
  const out: Record<string, T> = Object.create(null)
  for (const [k, x] of Object.entries(v)) {
    if (!valid(x, k)) return null
    out[k] = x
  }
  return out
}

function validateData(raw: unknown): BackupData | null {
  if (!isObj(raw)) return null
  const bank = cleanRecord(raw.bank, (x, k): x is Question => isQuestion(x) && x.id === k)
  const sources = cleanRecord(
    raw.sources,
    (x, k): x is SourceFile => isObj(x) && x.name === k && Array.isArray(x.questionIds) && x.questionIds.every(isStr) && isNum(x.importedAt),
  )
  const lastResults = cleanRecord(
    raw.lastResults,
    (x): x is LastResult => isObj(x) && typeof x.correct === 'boolean' && isNum(x.at),
  )
  if (!bank || !sources || !lastResults) return null
  if (raw.activeSession !== null && !isSession(raw.activeSession)) return null
  if (!Array.isArray(raw.history) || !raw.history.every(isSession)) return null
  if (!isObj(raw.settings) || typeof raw.settings.showAnswerCountHint !== 'boolean') return null
  return {
    bank: { ...bank },
    sources: { ...sources },
    lastResults: { ...lastResults },
    activeSession: raw.activeSession as Session | null,
    history: raw.history as Session[],
    settings: { showAnswerCountHint: raw.settings.showAnswerCountHint },
  }
}

const MAX_BACKUP_BYTES = 20 * 1024 * 1024

export async function readBackup(file: File): Promise<ReadBackupResult> {
  if (file.size > MAX_BACKUP_BYTES) return { ok: false, error: `File "${file.name}" quá lớn để là file sao lưu của ứng dụng.` }
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    return { ok: false, error: `"${file.name}" không phải file sao lưu. Chọn file .json được tạo bằng nút "Xuất dữ liệu".` }
  }
  if (!isObj(parsed) || parsed.app !== BACKUP_APP) {
    return { ok: false, error: `"${file.name}" không phải file sao lưu của ứng dụng này.` }
  }
  if (!isNum(parsed.version) || parsed.version > BACKUP_VERSION) {
    return { ok: false, error: 'File sao lưu được tạo từ phiên bản mới hơn của ứng dụng. Tải lại trang rồi thử lại.' }
  }
  const data = validateData(parsed.data)
  if (!data || !isNum(parsed.exportedAt)) {
    return { ok: false, error: `File "${file.name}" bị hỏng hoặc thiếu dữ liệu. Xuất lại file từ máy kia rồi thử lại.` }
  }
  const backup: BackupFile = { app: BACKUP_APP, version: parsed.version, exportedAt: parsed.exportedAt, data }
  const s = data.activeSession
  return {
    ok: true,
    backup,
    summary: {
      exportedAt: backup.exportedAt,
      questionCount: Object.keys(data.bank).length,
      sourceCount: Object.keys(data.sources).length,
      historyCount: data.history.length,
      active: s ? { at: Math.min(s.currentIndex + 1, s.questions.length), total: s.questions.length, retry: s.kind === 'retry' } : null,
    },
  }
}

/**
 * Replaces everything on this device with the backup.
 * Writes to localStorage first, so a quota failure leaves the current data untouched.
 */
export function applyBackup(backup: BackupFile): { ok: true } | { ok: false; error: string } {
  const state = { ...backup.data, lastImport: null }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: STORAGE_VERSION }))
  } catch {
    return {
      ok: false,
      error: 'Bộ nhớ trình duyệt trên máy này không đủ chỗ cho file sao lưu. Dữ liệu hiện tại vẫn giữ nguyên.',
    }
  }
  useQuizStore.setState(state)
  return { ok: true }
}
