/** Canonical display form: NFC, trimmed, inner whitespace collapsed. */
export function cleanText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).normalize('NFC').replace(/\s+/g, ' ').trim()
}

/**
 * Lowercase + strip Vietnamese diacritics (đ → d).
 * Length-preserving for NFC input, so match indices map 1:1 back to the original string.
 */
export function foldText(value: string): string {
  return value
    .normalize('NFC')
    .split('')
    .map((ch) =>
      ch === 'đ' || ch === 'Đ' ? 'd' : ch.normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0) || ch,
    )
    .join('')
    .toLowerCase()
}

/** Key used to decide whether two questions are "the same question". */
export function questionKey(text: string): string {
  return cleanText(text).toLowerCase()
}

/** cyrb53 — small, stable string hash. */
export function hashString(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

export function questionId(text: string): string {
  return 'q_' + hashString(questionKey(text))
}

export function uid(prefix = 's'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Letter label for an original option index: 0 → A. */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index)
}
