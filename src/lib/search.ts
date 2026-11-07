import Fuse, { type Expression, type FuseResultMatch } from 'fuse.js'
import type { Question } from '@/lib/types'
import { cleanText, foldText } from '@/lib/text'

/** Inclusive [start, end] character range, as returned by Fuse. */
export type Range = readonly [number, number]

export interface SearchHit {
  question: Question
  /** Matched ranges in `question.text`. */
  textRanges: Range[]
  /** Matched ranges per option, aligned with `question.options` positions. */
  optionRanges: Range[][]
}

export interface QuestionSearch {
  /** Empty / too-short query → every question, sorted by text (vi). */
  search: (query: string) => SearchHit[]
}

/** Shortest query (after folding) that triggers a fuzzy search. */
export const MIN_QUERY_LENGTH = 2
const MAX_TOKENS = 8

interface SearchDoc {
  text: string
  opts: string[]
}

/** Leaf of a Fuse logical query: fuzzy-match `token` in `key`. */
const field = (key: keyof SearchDoc, token: string): Expression => ({ [key]: token })

const collator = new Intl.Collator('vi', { sensitivity: 'base', numeric: true })

/** Folded, de-duplicated query tokens (≥ 2 chars each). */
export function queryTokens(query: string): string[] {
  const folded = foldText(cleanText(query))
  const tokens = folded.split(' ').filter((t) => t.length >= MIN_QUERY_LENGTH)
  return [...new Set(tokens)].slice(0, MAX_TOKENS)
}

/** Sort + merge overlapping/adjacent ranges. */
export function mergeRanges(ranges: readonly Range[]): Range[] {
  if (ranges.length < 2) return ranges.slice()
  const sorted = ranges.slice().sort((a, b) => a[0] - b[0])
  const out: [number, number][] = [[sorted[0][0], sorted[0][1]]]
  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i]
    const last = out[out.length - 1]
    if (start <= last[1] + 1) last[1] = Math.max(last[1], end)
    else out.push([start, end])
  }
  return out
}

function emptyHit(question: Question): SearchHit {
  return { question, textRanges: [], optionRanges: question.options.map(() => []) }
}

function collectRanges(question: Question, matches: readonly FuseResultMatch[] | undefined): SearchHit {
  const hit = emptyHit(question)
  for (const m of matches ?? []) {
    if (m.key === 'text') hit.textRanges.push(...m.indices)
    else if (m.key === 'opts' && m.refIndex !== undefined && hit.optionRanges[m.refIndex]) {
      hit.optionRanges[m.refIndex].push(...m.indices)
    }
  }
  hit.textRanges = mergeRanges(hit.textRanges)
  hit.optionRanges = hit.optionRanges.map(mergeRanges)
  return hit
}

/**
 * Builds a diacritic-insensitive fuzzy index over the bank.
 * Fields are pre-folded with `foldText` (length-preserving on NFC text), so
 * match indices point straight into the original strings.
 * Multi-word queries are AND-ed per word, each word may match the question or any option.
 */
export function createQuestionSearch(questions: readonly Question[]): QuestionSearch {
  const docs: SearchDoc[] = questions.map((q) => ({
    text: foldText(q.text),
    opts: q.options.map((o) => foldText(o.text)),
  }))

  const fuse = new Fuse(docs, {
    keys: [
      { name: 'text', weight: 2 },
      { name: 'opts', weight: 1 },
    ],
    includeMatches: true,
    ignoreLocation: true,
    threshold: 0.35,
    minMatchCharLength: 2,
  })

  let sortedAll: SearchHit[] | null = null
  const all = () =>
    (sortedAll ??= questions
      .slice()
      .sort((a, b) => collator.compare(a.text, b.text))
      .map(emptyHit))

  return {
    search(query) {
      const tokens = queryTokens(query)
      if (tokens.length === 0) return all()
      const expression: Expression = {
        $and: tokens.map((t) => ({ $or: [field('text', t), field('opts', t)] })),
      }
      return fuse.search(expression).map((r) => collectRanges(questions[r.refIndex], r.matches))
    },
  }
}
