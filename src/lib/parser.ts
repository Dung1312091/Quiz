import type { WorkBook, WorkSheet } from 'xlsx'
import type { ParsedFile, RowError } from './types'
import { cleanText, questionKey } from './text'

/** The demo row shipped in the Kahoot-style template; skipped wherever it appears. */
const SAMPLE_QUESTION_KEYS = new Set([
  questionKey('Which spreadsheet tools can read this sheet and export to xlsx format?'),
])

const DEFAULT_TIME_LIMIT = 60
/** How many top rows to scan for the header row (the Kahoot template puts it on row 8). */
const HEADER_SCAN_ROWS = 30
export const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

async function readWorkbook(file: File): Promise<WorkBook> {
  const XLSX = await import('xlsx')
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text()
    return XLSX.read(text, { type: 'string' })
  }
  const buf = await file.arrayBuffer()
  return XLSX.read(buf, { type: 'array' })
}

/** Parses "1,2,3" / "2" / 2 / "1; 3" into sorted unique 0-based indices, or null if invalid. */
function parseCorrect(raw: unknown): number[] | null {
  const text = cleanText(raw)
  if (!text) return null
  const parts = text.split(/[,;\s/]+/).filter(Boolean)
  const nums: number[] = []
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null
    const n = Number(p)
    if (n < 1 || n > 4) return null
    nums.push(n - 1)
  }
  return [...new Set(nums)].sort((a, b) => a - b)
}

/**
 * Index of the header row (column B = "Question…"/"Câu hỏi…", column H = "Correct…"/"Đáp án…"),
 * or -1 when there is none in the first rows.
 */
function findHeaderRow(rows: unknown[][]): number {
  const limit = Math.min(rows.length, HEADER_SCAN_ROWS)
  for (let i = 0; i < limit; i++) {
    const b = cleanText(rows[i]?.[1]).toLowerCase()
    const h = cleanText(rows[i]?.[7]).toLowerCase()
    if (/^(question|câu hỏi)/.test(b) && /^(correct|đáp án)/.test(h)) return i
  }
  return -1
}

type SheetResult = Pick<ParsedFile, 'questions' | 'errors' | 'rowCount'>

function parseSheet(fileName: string, sheetName: string | undefined, ws: WorkSheet, utils: typeof import('xlsx').utils): SheetResult {
  const errors: RowError[] = []
  const questions: ParsedFile['questions'] = []
  let rowCount = 0
  const rows = utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: '', blankrows: true })

  const header = findHeaderRow(rows)
  // No recognizable header → assume the documented layout: row 1 is the header.
  const start = header >= 0 ? header + 1 : 1

  for (let i = start; i < rows.length; i++) {
    const excelRow = i + 1
    const r = rows[i] ?? []
    const cells = Array.from({ length: 8 }, (_, c) => cleanText(r[c]))
    // Blank rows — and template placeholder rows that only carry an STT in column A — are ignored.
    if (cells.slice(1).every((c) => c === '')) continue

    const fail = (reason: string) => errors.push({ file: fileName, sheet: sheetName, row: excelRow, reason })
    const text = cells[1]
    const answerCells = cells.slice(2, 6)
    if (!text) {
      rowCount++
      fail('Thiếu nội dung câu hỏi (cột B).')
      continue
    }
    if (SAMPLE_QUESTION_KEYS.has(questionKey(text))) continue
    rowCount++

    const options = answerCells.map((t, index) => ({ index, text: t })).filter((o) => o.text !== '')
    if (options.length < 2) {
      fail(`Cần ít nhất 2 đáp án (cột C–F), đang có ${options.length}.`)
      continue
    }

    const correct = parseCorrect(r[7])
    if (!correct || correct.length === 0) {
      fail(
        cells[7]
          ? `Đáp án đúng "${cells[7]}" không hợp lệ (cột H). Dùng số 1–4, cách nhau bằng dấu phẩy.`
          : 'Thiếu đáp án đúng (cột H).',
      )
      continue
    }
    const emptyTargets = correct.filter((idx) => answerCells[idx] === '')
    if (emptyTargets.length) {
      fail(`Đáp án đúng trỏ tới ô trống: ${emptyTargets.map((i) => i + 1).join(', ')} (cột H).`)
      continue
    }

    const t = Number(cells[6])
    const timeLimit = Number.isFinite(t) && t > 0 ? Math.round(t) : DEFAULT_TIME_LIMIT
    questions.push({ text, options, correct, timeLimit })
  }

  return { questions, errors, rowCount }
}

/**
 * Reads every sheet of the workbook. Sheets that hold only instructions or the template's sample
 * question produce no questions and no errors, so a Kahoot template with an "Example" sheet works.
 */
export async function parseQuizFile(file: File): Promise<ParsedFile> {
  const name = file.name
  const fileError = (reason: string): ParsedFile => ({ name, questions: [], rowCount: 0, errors: [{ file: name, row: 0, reason }] })

  let wb: WorkBook
  try {
    wb = await readWorkbook(file)
  } catch {
    return fileError('Không đọc được file. Kiểm tra lại định dạng .xlsx, .xls hoặc .csv.')
  }
  if (wb.SheetNames.length === 0) return fileError('File không có sheet nào.')

  const { utils } = await import('xlsx')
  const multiSheet = wb.SheetNames.length > 1
  const result: ParsedFile = { name, questions: [], errors: [], rowCount: 0 }
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    if (!ws) continue
    const sheet = parseSheet(name, multiSheet ? sheetName : undefined, ws, utils)
    result.questions.push(...sheet.questions)
    result.errors.push(...sheet.errors)
    result.rowCount += sheet.rowCount
  }
  if (result.questions.length === 0 && result.errors.length === 0) {
    return fileError('Không tìm thấy câu hỏi nào. Kiểm tra lại các cột B (câu hỏi), C–F (đáp án) và H (đáp án đúng).')
  }
  return result
}
