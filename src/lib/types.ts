/** One answer option. `index` is the original column position (0 = cột C … 3 = cột F). */
export interface AnswerOption {
  index: number
  text: string
}

/** A question in the bank. Identity = normalized question text (see `questionKey`). */
export interface Question {
  id: string
  text: string
  /** Only non-empty options, in original order. 2–4 items. */
  options: AnswerOption[]
  /** Original indices (0-based) of the correct options. Sorted, unique, ≥ 1 item. */
  correct: number[]
  /** Seconds (cột G). */
  timeLimit: number
  /** File names that currently contain this question. */
  sources: string[]
  updatedAt: number
}

export type QuestionSnapshot = Omit<Question, 'sources' | 'updatedAt'>

export interface SourceFile {
  name: string
  questionIds: string[]
  importedAt: number
}

export interface RowError {
  file: string
  /** Sheet name, when the workbook has more than one sheet. */
  sheet?: string
  /** 1-based Excel row number. */
  row: number
  reason: string
}

/** Output of parsing one file (before merging into the bank). */
export interface ParsedFile {
  name: string
  questions: Omit<Question, 'id' | 'sources' | 'updatedAt'>[]
  errors: RowError[]
  /** Rows that looked like data (non-empty), excluding header/sample. */
  rowCount: number
}

export interface FileImportSummary {
  name: string
  added: number
  updated: number
  unchanged: number
  /** Questions that were only in the previous version of this file and got removed from the bank. */
  removed: number
  errors: RowError[]
}

export interface ImportReport {
  files: FileImportSummary[]
  added: number
  updated: number
  unchanged: number
  removed: number
  errorCount: number
  at: number
}

export interface Attempt {
  questionId: string
  /** Original option indices the user selected. Sorted. */
  selected: number[]
  correct: boolean
  overtime: boolean
  elapsedMs: number
  answeredAt: number
}

export type SessionKind = 'full' | 'retry'

export interface Session {
  id: string
  kind: SessionKind
  /** For retry sessions: the session whose wrong answers were retried. */
  parentId?: string
  startedAt: number
  finishedAt?: number
  /** Shuffled order, snapshotted at start — later imports don't affect it. */
  questions: QuestionSnapshot[]
  attempts: Record<string, Attempt>
  /** Index of the question currently being answered (== number answered while in progress). */
  currentIndex: number
}

export interface LastResult {
  correct: boolean
  at: number
}

export interface Settings {
  /** Show "Chọn n đáp án" under multi-answer questions. Default false. */
  showAnswerCountHint: boolean
}
