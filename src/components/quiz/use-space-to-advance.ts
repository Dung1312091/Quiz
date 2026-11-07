import { useEffect, useRef } from 'react'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  return el.matches('input, textarea, select') || el.closest('[role="dialog"], [role="alertdialog"]') !== null
}

/**
 * Space advances to the next question — only while `enabled` (i.e. the answer is revealed).
 * Handles keydown globally and swallows the matching keyup so a focused button
 * (e.g. "Tiếp tục" or a sheet cell) does not also get clicked.
 */
export function useSpaceToAdvance(enabled: boolean, onAdvance: () => void) {
  const latest = useRef({ enabled, onAdvance })
  useEffect(() => {
    latest.current = { enabled, onAdvance }
  })

  // Registered once: the keyup listener must outlive the `enabled` flip caused by advancing.
  useEffect(() => {
    let swallowKeyUp = false
    const isSpace = (e: KeyboardEvent) => e.code === 'Space' || e.key === ' '

    const onKeyDown = (e: KeyboardEvent) => {
      if (!latest.current.enabled || !isSpace(e) || e.defaultPrevented) return
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      if (e.repeat) return
      swallowKeyUp = true
      latest.current.onAdvance()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (swallowKeyUp && isSpace(e)) {
        e.preventDefault()
        swallowKeyUp = false
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
    }
  }, [])
}
