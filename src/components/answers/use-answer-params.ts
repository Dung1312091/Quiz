import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export type ResultFilter = 'all' | 'dung' | 'sai' | 'chua'
export const ALL_SOURCES = '__all__'

const RESULT_VALUES: ReadonlySet<string> = new Set<ResultFilter>(['all', 'dung', 'sai', 'chua'])

export interface AnswerParams {
  query: string
  /** Source file name, or ALL_SOURCES. */
  source: string
  result: ResultFilter
}

/** Search query + filters of /dap-an, kept in the URL (?q=&nguon=&ket-qua=) so they survive reload. */
export function useAnswerParams() {
  const [params, setParams] = useSearchParams()

  const rawResult = params.get('ket-qua') as ResultFilter | null
  const value: AnswerParams = {
    query: params.get('q') ?? '',
    source: params.get('nguon') || ALL_SOURCES,
    result: rawResult && RESULT_VALUES.has(rawResult) ? rawResult : 'all',
  }

  const update = useCallback(
    (patch: Partial<AnswerParams>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const set = (key: string, v: string | undefined, empty: string) => {
            if (v === undefined) return
            if (v === empty || v === '') next.delete(key)
            else next.set(key, v)
          }
          set('q', patch.query, '')
          set('nguon', patch.source, ALL_SOURCES)
          set('ket-qua', patch.result, 'all')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clearAll = useCallback(
    () => update({ query: '', source: ALL_SOURCES, result: 'all' }),
    [update],
  )

  return { ...value, update, clearAll }
}
