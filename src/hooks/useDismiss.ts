import { useEffect, type RefObject } from 'react'

/** Close on Escape and on pointer-down outside any of the given elements. */
export function useDismiss(open: boolean, onClose: () => void, refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // a popover inside a drawer closes first; the drawer ignores the handled key
        e.preventDefault()
        onClose()
      }
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (refs.every((r) => !r.current || !r.current.contains(t))) onClose()
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onDown)
    }
    // refs are stable objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose])
}
