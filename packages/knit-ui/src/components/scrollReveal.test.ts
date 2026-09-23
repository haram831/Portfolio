import { describe, expect, it, vi } from 'vitest'
import { createScrollRevealController } from './scrollReveal'

function makePattern(indices: number[]) {
  const root = document.createElement('div')
  for (const index of indices) {
    const stitch = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    stitch.dataset.knitRevealIndex = String(index)
    stitch.setAttribute('role', 'button')
    root.append(stitch)
  }
  return root
}

const visible = (root: HTMLElement) => root.querySelectorAll('.knit-pattern-view__reveal-stitch--visible')

describe('incremental scroll reveal', () => {
  it('handles reversed DOM order and overlapping cable indices in both directions', () => {
    const controller = createScrollRevealController()
    const root = makePattern([4, 2, 2, 0])
    controller.register(root)
    controller.update(3)
    expect(visible(root)).toHaveLength(3)
    expect(root.children[0]).toHaveAttribute('tabindex', '-1')
    expect(root.children[1]).toHaveAttribute('tabindex', '0')
    controller.update(1)
    expect(visible(root)).toHaveLength(1)
    controller.update(0)
    expect(visible(root)).toHaveLength(0)
  })

  it('does not rewrite stitches that stay on the same side of the boundary', () => {
    const controller = createScrollRevealController()
    const root = makePattern([0, 1, 2])
    controller.register(root)
    controller.update(1)
    const first = vi.spyOn(root.children[0]!.classList, 'toggle')
    const last = vi.spyOn(root.children[2]!.classList, 'toggle')
    controller.update(1)
    controller.update(2)
    expect(first).not.toHaveBeenCalled()
    expect(last).not.toHaveBeenCalled()
  })

  it('restores the current boundary when patterns change and unregisters removed nodes', () => {
    const controller = createScrollRevealController()
    controller.update(3)
    const root = makePattern([0, 1, 2, 3])
    const unregister = controller.register(root)
    expect(visible(root)).toHaveLength(3)
    unregister()
    controller.update(0)
    expect(visible(root)).toHaveLength(3)
    controller.register(root)
    expect(visible(root)).toHaveLength(0)
  })
})
