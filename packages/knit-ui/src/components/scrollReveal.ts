import { createContext } from 'react'

interface RevealTarget {
  element: SVGSVGElement
  index: number
}

export function createScrollRevealController() {
  const patterns = new Map<HTMLElement, RevealTarget[]>()
  let targets: RevealTarget[] = []
  let visibleCount = 0
  let cursor = 0

  function setVisible(target: RevealTarget, visible: boolean) {
    target.element.classList.toggle('knit-pattern-view__reveal-stitch--visible', visible)
    target.element.classList.toggle('knit-pattern-view__reveal-stitch--hidden', !visible)
    if (target.element.getAttribute('role') === 'button') {
      target.element.setAttribute('tabindex', visible ? '0' : '-1')
    }
  }

  function rebuild() {
    targets = [...patterns.values()].flat().sort((a, b) => a.index - b.index)
    cursor = 0
    for (const target of targets) {
      const visible = target.index < visibleCount
      setVisible(target, visible)
      if (visible) cursor++
    }
  }

  return {
    register(root: HTMLElement) {
      patterns.set(root, [...root.querySelectorAll<SVGSVGElement>('[data-knit-reveal-index]')]
        .map((element) => ({ element, index: Number(element.dataset.knitRevealIndex) })))
      rebuild()
      return () => {
        patterns.delete(root)
        rebuild()
      }
    },
    update(count: number) {
      visibleCount = count
      // Only visit stitches crossing the reveal boundary, in either direction.
      while (cursor < targets.length && targets[cursor]!.index < count) {
        setVisible(targets[cursor++]!, true)
      }
      while (cursor > 0 && targets[cursor - 1]!.index >= count) {
        setVisible(targets[--cursor]!, false)
      }
    },
  }
}

export const ScrollRevealContext = createContext<ReturnType<typeof createScrollRevealController> | null>(null)
