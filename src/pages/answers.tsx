import { useCallback, useMemo } from 'react'
import { useQuizStore } from '@/store/quiz-store'
import { createQuestionSearch, queryTokens } from '@/lib/search'
import { SearchBox } from '@/components/answers/search-box'
import { AnswerFilters } from '@/components/answers/answer-filters'
import { AnswerList } from '@/components/answers/answer-list'
import { EmptyBank, NoResults } from '@/components/answers/answers-empty'
import { ALL_SOURCES, type ResultFilter, useAnswerParams } from '@/components/answers/use-answer-params'

const collator = new Intl.Collator('vi', { sensitivity: 'base', numeric: true })

export default function AnswersPage() {
  const bank = useQuizStore((s) => s.bank)
  const sources = useQuizStore((s) => s.sources)
  const lastResults = useQuizStore((s) => s.lastResults)
  const { query, source: rawSource, result, update, clearAll } = useAnswerParams()

  const questions = useMemo(() => Object.values(bank), [bank])
  const index = useMemo(() => createQuestionSearch(questions), [questions])
  const sourceNames = useMemo(() => Object.keys(sources).sort(collator.compare), [sources])

  // A source that no longer exists (file removed) falls back to "all".
  const source = rawSource !== ALL_SOURCES && sources[rawSource] ? rawSource : ALL_SOURCES

  const searched = useMemo(() => index.search(query), [index, query])
  const hits = useMemo(() => {
    if (source === ALL_SOURCES && result === 'all') return searched
    return searched.filter(({ question: q }) => {
      if (source !== ALL_SOURCES && !q.sources.includes(source)) return false
      if (result === 'all') return true
      const last = lastResults[q.id]
      if (result === 'chua') return !last
      return !!last && last.correct === (result === 'dung')
    })
  }, [searched, source, result, lastResults])

  const onCommitQuery = useCallback((q: string) => update({ query: q }), [update])
  const onSourceChange = useCallback((s: string) => update({ source: s }), [update])
  const onResultChange = useCallback((r: ResultFilter) => update({ result: r }), [update])

  const isSearching = queryTokens(query).length > 0
  const hasFilters = source !== ALL_SOURCES || result !== 'all'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[30px] leading-tight font-semibold text-ink">Đáp án</h1>
        <p className="mt-1.5 text-[15px] text-ink-soft">
          Tra cứu đáp án đúng của mọi câu trong ngân hàng. Gõ không dấu vẫn tìm được.
        </p>
      </header>

      {questions.length === 0 ? (
        <EmptyBank />
      ) : (
        <>
          <div className="space-y-4">
            <SearchBox value={query} onCommit={onCommitQuery} />
            <AnswerFilters
              sourceNames={sourceNames}
              source={source}
              result={result}
              onSourceChange={onSourceChange}
              onResultChange={onResultChange}
            />
          </div>

          <section aria-label="Kết quả tra cứu" className="space-y-3">
            <p aria-live="polite" className="text-[13px] text-ink-soft tabular">
              {hits.length} câu
              {!isSearching && !hasFilters && hits.length > 0 && ' — xếp theo thứ tự chữ cái'}
              {query.trim() !== '' && !isSearching && ' — nhập ít nhất 2 ký tự để tìm'}
            </p>
            {hits.length === 0 ? (
              <NoResults hasFilters={hasFilters} onClear={clearAll} />
            ) : (
              <AnswerList key={`${query}|${source}|${result}`} hits={hits} lastResults={lastResults} />
            )}
          </section>
        </>
      )}
    </div>
  )
}
