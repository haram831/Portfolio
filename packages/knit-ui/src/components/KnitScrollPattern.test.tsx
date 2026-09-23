import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnitPattern } from './KnitPattern'
import { KnitScrollPattern } from './KnitScrollPattern'
import type { KnitPatternData } from '../pattern'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const scrollPattern = makeScrollPattern(2)

describe('KnitScrollPattern needle motion', () => {
  it('moves needles by scroll distance instead of scroll progress', async () => {
    const shortScroll = await getScrollStateAfterDistance({
      scrollableHeight: 2000,
      scrollTop: 100,
    })
    const longScroll = await getScrollStateAfterDistance({
      scrollableHeight: 11000,
      scrollTop: 100,
    })

    expect(shortScroll.progress).toBe('0.1')
    expect(longScroll.progress).toBe('0.01')
    expect(shortScroll.needleLeftX).toBe(longScroll.needleLeftX)
    expect(shortScroll.needleLeftY).toBe(longScroll.needleLeftY)
  })
})

describe('KnitScrollPattern fabric motion', () => {
  it('sizes the automatic scroll area to the fabric reveal distance', () => {
    render(
      <KnitScrollPattern
        aria-label="scroll pattern"
        fabricSpeed={2}
        needle={{ visible: true }}
      >
        <KnitPattern
          gap={0}
          pattern={makeScrollPattern(3)}
          stitchOverlap={0}
          stitchSize={50}
        />
      </KnitScrollPattern>,
    )

    const scrollRoot = screen.getByLabelText('scroll pattern')

    expect(scrollRoot.style.getPropertyValue('--knit-scroll-length')).toBe(
      '75px',
    )
  })

  it('moves fabric by scroll distance instead of total pattern length', async () => {
    const shortPatternScroll = await getScrollStateAfterDistance({
      pattern: makeScrollPattern(2),
      scrollableHeight: 2000,
      scrollTop: 40,
    })
    const longPatternScroll = await getScrollStateAfterDistance({
      pattern: makeScrollPattern(6),
      scrollableHeight: 2000,
      scrollTop: 40,
    })

    expect(shortPatternScroll.fabricYDelta).toBe(40)
    expect(longPatternScroll.fabricYDelta).toBe(40)
    expect(shortPatternScroll.visibleStitchCount).toBe(
      longPatternScroll.visibleStitchCount,
    )
  })

  it('keeps the completed fabric intact until upward scrolling reaches the reveal interval', async () => {
    render(
      <KnitScrollPattern aria-label="scroll pattern" fabricSpeed={2}>
        <KnitPattern
          gap={0}
          pattern={makeScrollPattern(40)}
          stitchOverlap={0}
          stitchSize={50}
        />
      </KnitScrollPattern>,
    )
    const scrollRoot = screen.getByLabelText('scroll pattern')
    // 2000px fabric + 274px padding + 1000px knitting distance.
    // With a 1000px viewport, browsing occupies scroll offsets 1000–2274.
    const scrollTo = async (scrollTop: number) => {
      setScrollMetrics(scrollRoot, { scrollableHeight: 3274, scrollTop })
      fireEvent.scroll(window)
      await nextAnimationFrame()
    }
    const visibleCount = () =>
      scrollRoot.querySelectorAll(
        '.knit-pattern-view__reveal-stitch--visible',
      ).length

    await scrollTo(0)
    expect(visibleCount()).toBe(0)

    for (const offset of [1000, 2274, 1600, 1000]) {
      await scrollTo(offset)
      expect(visibleCount()).toBe(80)
      expect(scrollRoot.style.getPropertyValue('--knit-scroll-fabric-y')).toBe(
        '0px',
      )
    }

    await scrollTo(950)
    expect(visibleCount()).toBe(76)
    expect(scrollRoot.style.getPropertyValue('--knit-scroll-fabric-y')).toBe(
      '-100px',
    )

    await scrollTo(0)
    expect(visibleCount()).toBe(0)
  })
})

interface ScrollMetrics {
  pattern?: KnitPatternData
  scrollableHeight: number
  scrollTop: number
}

async function getScrollStateAfterDistance(metrics: ScrollMetrics) {
  const { unmount } = render(
    <KnitScrollPattern
      aria-label="scroll pattern"
      fabricSpeed={1}
      needle={{ visible: true }}
    >
      <KnitPattern pattern={metrics.pattern ?? scrollPattern} />
    </KnitScrollPattern>,
  )
  const scrollRoot = screen.getByLabelText('scroll pattern')

  setScrollMetrics(scrollRoot, {
    scrollableHeight: metrics.scrollableHeight,
    scrollTop: 0,
  })
  await nextAnimationFrame()
  const initialFabricY = getPixelValue(
    scrollRoot.style.getPropertyValue('--knit-scroll-fabric-y'),
  )

  setScrollMetrics(scrollRoot, metrics)
  fireEvent.scroll(window)
  await nextAnimationFrame()

  const state = {
    needleLeftX: scrollRoot.style.getPropertyValue(
      '--knit-scroll-needle-left-x',
    ),
    needleLeftY: scrollRoot.style.getPropertyValue(
      '--knit-scroll-needle-left-y',
    ),
    progress: scrollRoot.style.getPropertyValue('--knit-scroll-progress'),
  }
  const fabricY = getPixelValue(
    scrollRoot.style.getPropertyValue('--knit-scroll-fabric-y'),
  )
  const visibleStitchCount = scrollRoot.querySelectorAll(
    '.knit-pattern-view__reveal-stitch--visible',
  ).length

  unmount()

  return {
    ...state,
    fabricY,
    fabricYDelta: fabricY - initialFabricY,
    visibleStitchCount,
  }
}

function makeScrollPattern(rowCount: number): KnitPatternData {
  return {
    castOn: 2,
    rows: Array.from({ length: rowCount }, (_, rowIndex) => ({
      stitches:
        rowIndex % 2 === 0
          ? [{ kind: 'knit' }, { kind: 'purl' }]
          : [{ kind: 'purl' }, { kind: 'knit' }],
    })),
  }
}

function getPixelValue(value: string): number {
  return Number.parseFloat(value)
}

function setScrollMetrics(element: HTMLElement, metrics: ScrollMetrics) {
  const viewportHeight = 1000

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: viewportHeight,
  })
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    value: metrics.scrollableHeight,
  })

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    bottom: metrics.scrollableHeight - metrics.scrollTop,
    height: metrics.scrollableHeight,
    left: 0,
    right: 0,
    top: metrics.scrollTop * -1,
    width: 0,
    x: 0,
    y: metrics.scrollTop * -1,
    toJSON: () => {},
  })
}

async function nextAnimationFrame() {
  await act(async () => {
    await new Promise((resolve) => window.requestAnimationFrame(resolve))
  })
}
