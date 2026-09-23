import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnitPattern } from './KnitPattern'
import { KnitScrollPattern } from './KnitScrollPattern'
import type { KnitPatternData } from '../pattern'
import { Profiler } from 'react'
import { KnitPatternGroup } from './KnitPatternGroup'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const scrollPattern = makeScrollPattern(2)

describe('KnitScrollPattern needle motion', () => {
  it('uses the same scroll sensitivity and speed limit at mobile and desktop widths', () => {
    for (const width of [375, 1440]) {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width)
      const motion = renderNeedleMotion()
      motion.scroll(4.2, 20)
      motion.expectCycles(0.01)
      motion.scroll(12.6, 40)
      motion.expectCycles(0.03)
      // A fast flick is limited to 3 cycles/second × 20ms.
      motion.scroll(1012.6, 60)
      motion.expectCycles(0.09)
      motion.scroll(12.6, 80)
      motion.expectCycles(0.03)
      motion.scroll(12.6, 100)
      motion.expectCycles(0.03)
      motion.unmount()
    }
  })

  it('honors a custom maximum without accumulating motion during idle time', () => {
    const motion = renderNeedleMotion(1)
    motion.scroll(1000, 20)
    motion.expectCycles(0.02)
    motion.scroll(2000, 10020)
    motion.expectCycles(0.02 + 1 / 30)
    motion.unmount()
  })

  it('allows freezing needles while fabric continues scrolling', () => {
    const motion = renderNeedleMotion(0)
    motion.scroll(100, 20)
    motion.expectCycles(0)
    expect(getFabricStyle(motion.root).getPropertyValue('--knit-scroll-fabric-y')).toBe('0px')
    motion.unmount()
  })

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

function renderNeedleMotion(maxSpeed?: number) {
  let callback: FrameRequestCallback | undefined
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((next) => {
    callback = next
    return 1
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  const { unmount } = render(
    <KnitScrollPattern aria-label="needle test" fabricSpeed={1} needle={{ visible: true, maxSpeed }}>
      <KnitPattern pattern={scrollPattern} />
    </KnitScrollPattern>,
  )
  const root = screen.getByLabelText('needle test')
  const scroll = (scrollTop: number, time: number) => {
    setScrollMetrics(root, { scrollableHeight: 11000, scrollTop })
    fireEvent.scroll(window)
    act(() => {
      const next = callback
      callback = undefined
      next?.(time)
    })
  }
  scroll(0, 0)
  return {
    root,
    scroll,
    unmount,
    expectCycles(cycles: number) {
      const style = root.querySelector<HTMLElement>('.knit-scroll-pattern__needles')!.style
      expect(Number.parseFloat(style.getPropertyValue('--knit-scroll-needle-left-y')))
        .toBeCloseTo(Math.sin(cycles * Math.PI * 2) * -7, 8)
    },
  }
}

describe('KnitScrollPattern fabric motion', () => {
  it('preserves bottom-up group order and the space between patterns', async () => {
    render(
      <KnitScrollPattern aria-label="scroll pattern" fabricSpeed={1}>
        <KnitPatternGroup gap={10}>
          <KnitPattern aria-label="upper" pattern={makeScrollPattern(2)} stitchSize={50} stitchOverlap={0} gap={0} />
          <KnitPattern aria-label="lower" pattern={makeScrollPattern(2)} stitchSize={50} stitchOverlap={0} gap={0} />
        </KnitPatternGroup>
      </KnitScrollPattern>,
    )
    const root = screen.getByLabelText('scroll pattern')
    for (const [scrollTop, upperCount] of [[100, 0], [105, 0], [135, 1], [210, 4], [105, 0]]) {
      setScrollMetrics(root, { scrollableHeight: 2000, scrollTop })
      fireEvent.scroll(window)
      await nextAnimationFrame()
      expect(screen.getByLabelText('lower').querySelectorAll('.knit-pattern-view__reveal-stitch--visible')).toHaveLength(4)
      expect(screen.getByLabelText('upper').querySelectorAll('.knit-pattern-view__reveal-stitch--visible')).toHaveLength(upperCount!)
    }
  })

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
      expect(getFabricStyle(scrollRoot).getPropertyValue('--knit-scroll-fabric-y')).toBe(
        '0px',
      )
    }

    await scrollTo(950)
    expect(visibleCount()).toBe(76)
    expect(getFabricStyle(scrollRoot).getPropertyValue('--knit-scroll-fabric-y')).toBe(
      '-100px',
    )

    await scrollTo(0)
    expect(visibleCount()).toBe(0)
  })

  it('reveals and unravels stitches without committing React renders on scroll', async () => {
    const onRender = vi.fn()
    render(
      <Profiler id="scroll" onRender={onRender}>
        <KnitScrollPattern aria-label="scroll pattern" fabricSpeed={1}>
          <KnitPattern pattern={makeScrollPattern(40)} />
        </KnitScrollPattern>
      </Profiler>,
    )
    const root = screen.getByLabelText('scroll pattern')
    setScrollMetrics(root, { scrollableHeight: 5000, scrollTop: 0 })
    await nextAnimationFrame()
    onRender.mockClear()

    for (const scrollTop of [100, 200, 400, 200, 0]) {
      setScrollMetrics(root, { scrollableHeight: 5000, scrollTop })
      fireEvent.scroll(window)
      await nextAnimationFrame()
      const count = root.querySelectorAll('.knit-pattern-view__reveal-stitch--visible').length
      expect(count).toBe(scrollTop === 0 ? 0 : Math.ceil(scrollTop / 46 * 2))
    }
    expect(onRender).not.toHaveBeenCalled()
  })

  it('keeps scroll visibility when resolving a mistake rerenders its pattern', async () => {
    render(
      <KnitScrollPattern aria-label="scroll pattern" fabricSpeed={1}>
        <KnitPattern pattern={makeScrollPattern(4)} mistakeFrequency={1} />
      </KnitScrollPattern>,
    )
    const root = screen.getByLabelText('scroll pattern')
    setScrollMetrics(root, { scrollableHeight: 2000, scrollTop: 100 })
    await nextAnimationFrame()
    const visible = root.querySelectorAll('.knit-pattern-view__reveal-stitch--visible')
    fireEvent.click(visible[0]!)
    expect(root.querySelectorAll('.knit-pattern-view__reveal-stitch--visible')).toHaveLength(visible.length)
    expect(root.querySelectorAll('.knit-stitch-unit--resolved-mistake')).toHaveLength(1)
    expect(root.querySelector('.knit-pattern-view__reveal-stitch--hidden[role="button"]')).toHaveAttribute('tabindex', '-1')
  })
})

function getFabricStyle(root: HTMLElement) {
  return root.querySelector<HTMLElement>('.knit-scroll-pattern__fabric')!.style
}

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
      needle={{ visible: true, maxSpeed: 1000 }}
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
    getFabricStyle(scrollRoot).getPropertyValue('--knit-scroll-fabric-y'),
  )

  setScrollMetrics(scrollRoot, metrics)
  fireEvent.scroll(window)
  await nextAnimationFrame()

  const state = {
    needleLeftX: scrollRoot.querySelector<HTMLElement>('.knit-scroll-pattern__needles')!.style.getPropertyValue(
      '--knit-scroll-needle-left-x',
    ),
    needleLeftY: scrollRoot.querySelector<HTMLElement>('.knit-scroll-pattern__needles')!.style.getPropertyValue(
      '--knit-scroll-needle-left-y',
    ),
    progress: scrollRoot.style.getPropertyValue('--knit-scroll-progress'),
  }
  const fabricY = getPixelValue(
    getFabricStyle(scrollRoot).getPropertyValue('--knit-scroll-fabric-y'),
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
