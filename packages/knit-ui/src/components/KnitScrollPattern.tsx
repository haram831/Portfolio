import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import type {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefObject,
} from 'react'
import {
  KnitPattern,
  type KnitPatternProps,
  type KnitPatternRevealOrder,
} from './KnitPattern'
import type { KnitPatternGroupDirection } from './KnitPatternGroup'
import { createScrollRevealController, ScrollRevealContext } from './scrollReveal'
import '../styles/knit-ui.css'

export type KnitScrollStitchOrder = KnitPatternRevealOrder

export interface KnitScrollNeedleOptions {
  visible?: boolean
  color?: string
  highlightColor?: string
  thickness?: number | string
  angle?: number
  /** Scroll sensitivity: at 1, one cycle per 420 CSS pixels, independent of viewport width. */
  speed?: number
  /** Maximum cycles per second. Defaults to 3; 0 freezes the needles. */
  maxSpeed?: number
}

export interface KnitScrollPatternProps extends HTMLAttributes<HTMLDivElement> {
  fabricSpeed?: number
  needle?: KnitScrollNeedleOptions
  /** Sticky scroll distance; cannot be shorter than the fabric reveal distance. */
  scrollLength?: number | string
  stitchOrder?: KnitScrollStitchOrder
}

export function KnitScrollPattern({
  children,
  className,
  fabricSpeed,
  needle,
  scrollLength,
  stitchOrder = 'alternating',
  style,
  ...props
}: KnitScrollPatternProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fabricScrollSpeed = normalizeFabricScrollSpeed(fabricSpeed)
  const needleMotionSpeed = normalizeNeedleMotionSpeed(needle?.speed)
  const needleMaxSpeed = typeof needle?.maxSpeed === 'number' && Number.isFinite(needle.maxSpeed)
    ? Math.max(0, needle.maxSpeed)
    : 3
  const needleAngle = needle?.angle ?? 13.63
  const revealController = useMemo(() => createScrollRevealController(), [])
  const totalFabricHeight = useMemo(() => getScrollableFabricHeight(children), [children])
  useKnitScrollMotion(
    rootRef,
    children,
    totalFabricHeight,
    fabricScrollSpeed,
    needleMotionSpeed,
    needleMaxSpeed,
    needleAngle,
    revealController,
  )
  const revealScrollLength =
    fabricScrollSpeed > 0 ? totalFabricHeight / fabricScrollSpeed : 0
  const scrollLengthCss = getScrollLengthCss(
    revealScrollLength,
    scrollLength,
  )
  const revealedChildren = useMemo(
    () => revealScrollPatterns(children, 0, stitchOrder),
    [children, stitchOrder],
  )
  const classes = ['knit-scroll-pattern', className].filter(Boolean).join(' ')
  const scrollStyle = {
    ...style,
    '--knit-scroll-length': scrollLengthCss,
    '--knit-scroll-reveal-length': `${revealScrollLength}px`,
    '--knit-scroll-needle-angle': `${needleAngle}deg`,
    '--knit-scroll-needle-color': needle?.color,
    '--knit-scroll-needle-highlight': needle?.highlightColor,
    '--knit-scroll-needle-thickness': needle?.thickness
      ? toCssSize(needle.thickness)
      : undefined,
  } as CSSProperties

  return (
    <div className={classes} ref={rootRef} style={scrollStyle} {...props}>
      <div className="knit-scroll-pattern__stage">
        {needle?.visible ? <KnitScrollNeedles /> : null}
        <div
          className="knit-scroll-pattern__fabric"
          style={{ '--knit-scroll-fabric-y': `${-totalFabricHeight}px` } as CSSProperties}
        >
          <ScrollRevealContext.Provider value={revealController}>
            {revealedChildren}
          </ScrollRevealContext.Provider>
        </div>
      </div>
      <div aria-hidden="true" className="knit-scroll-pattern__spacer" />
    </div>
  )
}

function KnitScrollNeedles() {
  return (
    <div aria-hidden="true" className="knit-scroll-pattern__needles">
      <span className="knit-scroll-pattern__needle knit-scroll-pattern__needle--left" />
      <span className="knit-scroll-pattern__needle knit-scroll-pattern__needle--right" />
    </div>
  )
}

const NEEDLE_SCROLL_PIXELS_PER_LOOP = 420
const DEFAULT_FABRIC_SCROLL_SPEED = 0.2

function useKnitScrollMotion(
  rootRef: RefObject<HTMLDivElement | null>,
  children: ReactNode,
  totalFabricHeight: number,
  fabricScrollSpeed: number,
  needleMotionSpeed: number,
  needleMaxSpeed: number,
  needleAngle: number,
  revealController: ReturnType<typeof createScrollRevealController>,
) {
  const needleMotionOffsetRef = useRef(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    let frame = 0
    let previousScrollTop: number | undefined
    let previousTime: number | undefined

    const updateProgress = (time: number) => {
      frame = 0
      const root = rootRef.current

      if (!root) {
        return
      }

      const rect = root.getBoundingClientRect()
      const scrollDistance = Math.max(1, root.offsetHeight - window.innerHeight)
      const scrollTop = clampNumber(-rect.top, 0, scrollDistance)
      const reduced = prefersReducedMotion.matches

      if (previousScrollTop !== undefined && previousTime !== undefined && !reduced) {
        // Do not bank idle/background time for a large jump on the next scroll.
        const elapsed = Math.min(Math.max(0, time - previousTime), 1000 / 30) / 1000
        const requestedMotion = ((scrollTop - previousScrollTop) * needleMotionSpeed) /
          NEEDLE_SCROLL_PIXELS_PER_LOOP
        const maximumMotion = needleMaxSpeed * elapsed
        needleMotionOffsetRef.current += clampNumber(requestedMotion, -maximumMotion, maximumMotion)
      }

      previousScrollTop = scrollTop
      previousTime = time

      const revealOffset = getFabricRevealOffset(
        totalFabricHeight,
        reduced ? Number.POSITIVE_INFINITY : scrollTop,
        fabricScrollSpeed,
      )
      const fabric = root.querySelector<HTMLElement>('.knit-scroll-pattern__fabric')
      const needles = root.querySelector<HTMLElement>('.knit-scroll-pattern__needles')
      setCssProperty(root, '--knit-scroll-progress', String(reduced ? 1 : scrollTop / scrollDistance))
      if (fabric) {
        setCssProperty(fabric, '--knit-scroll-fabric-y', `${revealOffset - totalFabricHeight}px`)
      }
      if (needles) {
        const motion = reduced ? 0 : getLoopProgress(needleMotionOffsetRef.current)
        const pierce = Math.sin(motion * Math.PI)
        const lift = Math.sin(motion * Math.PI * 2)
        // Scope needle variables to their small subtree, not every stitch.
        setCssProperty(needles, '--knit-scroll-needle-left-angle', `${-(needleAngle + lift * 3)}deg`)
        setCssProperty(needles, '--knit-scroll-needle-left-x', `${pierce * -12}px`)
        setCssProperty(needles, '--knit-scroll-needle-left-y', `${lift * -7}px`)
        setCssProperty(needles, '--knit-scroll-needle-right-angle', `${needleAngle - pierce * 7}deg`)
        setCssProperty(needles, '--knit-scroll-needle-right-x', `${pierce * -34}px`)
        setCssProperty(needles, '--knit-scroll-needle-right-y', `${lift * 12}px`)
      }
      revealController.update(getVisibleStitchCountAtOffset(children, revealOffset))
    }
    const requestUpdate = () => {
      if (frame === 0) frame = window.requestAnimationFrame(updateProgress)
    }
    const resetMeasurements = () => {
      previousScrollTop = undefined
      previousTime = undefined
      requestUpdate()
    }

    requestUpdate()
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(resetMeasurements)

    if (rootRef.current) {
      resizeObserver?.observe(rootRef.current)
    }

    window.addEventListener('resize', resetMeasurements)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    prefersReducedMotion.addEventListener('change', resetMeasurements)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resetMeasurements)
      window.removeEventListener('scroll', requestUpdate)
      prefersReducedMotion.removeEventListener('change', resetMeasurements)
    }
  }, [children, fabricScrollSpeed, needleAngle, needleMotionSpeed, needleMaxSpeed, revealController, rootRef, totalFabricHeight])
}

function setCssProperty(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value)
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

function getScrollableStitchCount(children: ReactNode): number {
  return Children.toArray(children).reduce<number>(
    (count, child) => count + getNodeStitchCount(child),
    0,
  )
}

function getNodeStitchCount(node: ReactNode): number {
  if (!isElement(node)) {
    return 0
  }

  if (isKnitPatternElement(node)) {
    return getPatternStitchCount(node.props.pattern)
  }

  return getScrollableStitchCount(node.props.children)
}

function getPatternStitchCount(pattern: KnitPatternProps['pattern']): number {
  return pattern.castOn * pattern.rows.length
}

function getScrollableFabricHeight(children: ReactNode): number {
  return getChildNodesFabricHeight(children)
}

function getNodeFabricHeight(node: ReactNode): number {
  if (!isElement(node)) {
    return 0
  }

  if (isKnitPatternElement(node)) {
    return getPatternHeight(node.props)
  }

  if (!node.props.children) {
    return 0
  }

  return getChildNodesFabricHeight(
    node.props.children,
    getVerticalGroupGap(node),
  )
}

function getChildNodesFabricHeight(children: ReactNode, gap = 0): number {
  const childNodes = Children.toArray(children)
  const stitchBearingNodes = childNodes.filter(
    (child) => getNodeStitchCount(child) > 0,
  )
  const childHeight = stitchBearingNodes.reduce<number>(
    (height, child) => height + getNodeFabricHeight(child),
    0,
  )
  const gapCount = Math.max(0, stitchBearingNodes.length - 1)

  return childHeight + gap * gapCount
}

function getFabricRevealOffset(
  totalFabricHeight: number,
  scrollTop: number,
  fabricSpeed: number,
): number {
  if (!Number.isFinite(scrollTop)) {
    return totalFabricHeight
  }

  return clampNumber(scrollTop * fabricSpeed, 0, totalFabricHeight)
}

function getScrollLengthCss(
  revealScrollLength: number,
  scrollLength: number | string | undefined,
): string {
  if (scrollLength !== undefined && scrollLength !== 'auto') {
    return toCssSize(scrollLength)
  }

  return `${revealScrollLength}px`
}

function getVisibleStitchCountAtOffset(
  children: ReactNode,
  visibleOffset: number,
): number {
  return getChildNodesVisibleStitchCount(children, visibleOffset)
}

function getNodeVisibleStitchCount(
  node: ReactNode,
  visibleOffset: number,
): number {
  if (!isElement(node)) {
    return 0
  }

  if (isKnitPatternElement(node)) {
    return getPatternVisibleStitchCount(node.props, visibleOffset)
  }

  if (!node.props.children) {
    return 0
  }

  return getChildNodesVisibleStitchCount(
    node.props.children,
    visibleOffset,
    getVerticalGroupGap(node),
  )
}

function getChildNodesVisibleStitchCount(
  children: ReactNode,
  visibleOffset: number,
  gap = 0,
): number {
  let remainingOffset = visibleOffset
  const childNodes = Children.toArray(children)
  let visibleStitchCount = 0

  for (
    let index = childNodes.length - 1;
    index >= 0 && remainingOffset > 0;
    index -= 1
  ) {
    const child = childNodes[index]
    const childHeight = getNodeFabricHeight(child)

    if (childHeight > 0) {
      const childOffset = Math.min(remainingOffset, childHeight)

      visibleStitchCount += getNodeVisibleStitchCount(child, childOffset)
      remainingOffset -= childOffset
    }

    if (
      index > 0 &&
      remainingOffset > 0 &&
      getPreviousSiblingStitchCount(childNodes, index) > 0
    ) {
      remainingOffset -= gap
    }
  }

  return visibleStitchCount
}

function getPatternVisibleStitchCount(
  props: KnitPatternProps,
  visibleOffset: number,
): number {
  const patternStitchCount = getPatternStitchCount(props.pattern)

  if (visibleOffset >= getPatternHeight(props)) {
    return patternStitchCount
  }

  return clampNumber(
    Math.ceil((visibleOffset / getPatternRowStep(props)) * props.pattern.castOn),
    0,
    patternStitchCount,
  )
}

function getPreviousSiblingStitchCount(
  childNodes: ReactNode[],
  endIndex: number,
): number {
  return childNodes
    .slice(0, endIndex)
    .reduce<number>((count, child) => count + getNodeStitchCount(child), 0)
}

function getVerticalGroupGap(node: ReactElement<KnitScrollElementProps>): number {
  if (node.props.direction === 'horizontal') {
    return 0
  }

  return getNumericSize(node.props.gap, 24)
}

function getPatternRowStep(props: KnitPatternProps): number {
  return Math.max(
    1,
    getNumericSize(props.stitchSize, 48) -
      getNumericSize(props.stitchOverlap, 6) +
      getNumericSize(props.rowGap ?? props.gap, getDensityGap(props.density)),
  )
}

function getPatternHeight(props: KnitPatternProps): number {
  const rowCount = props.pattern.rows.length

  if (rowCount <= 0) {
    return 0
  }

  return (
    (rowCount - 1) * getPatternRowStep(props) +
    getNumericSize(props.stitchSize, 48)
  )
}

function getNumericSize(
  value: number | string | undefined,
  fallback: number,
): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number.parseFloat(value)

    return Number.isFinite(parsedValue) ? parsedValue : fallback
  }

  return fallback
}

function getDensityGap(density: KnitPatternProps['density']): number {
  if (density === 'compact') {
    return 2
  }

  if (density === 'loose') {
    return 8
  }

  return 4
}

function normalizeFabricScrollSpeed(speed: number | undefined): number {
  if (speed === undefined || !Number.isFinite(speed)) {
    return DEFAULT_FABRIC_SCROLL_SPEED
  }

  return Math.max(0, speed)
}

function normalizeNeedleMotionSpeed(speed: number | undefined): number {
  if (speed === undefined || !Number.isFinite(speed)) {
    return 1
  }

  return Math.max(0, speed)
}

function revealScrollPatterns(
  children: ReactNode,
  visibleStitchCount: number,
  stitchOrder: KnitScrollStitchOrder,
): ReactNode {
  let revealContext: KnitScrollRevealContext = {
    rowOffset: 0,
    stitchOffset: 0,
    visibleStitchCount,
  }
  const childNodes = Children.toArray(children)
  const revealedChildren: ReactNode[] = [...childNodes]

  for (let index = childNodes.length - 1; index >= 0; index -= 1) {
    const [revealedChild, nextRevealContext] = revealScrollPatternNode(
      childNodes[index],
      revealContext,
      stitchOrder,
    )

    revealContext = nextRevealContext
    revealedChildren[index] = revealedChild
  }

  return revealedChildren
}

interface KnitScrollRevealContext {
  rowOffset: number
  stitchOffset: number
  visibleStitchCount: number
}

function revealScrollPatternNode(
  node: ReactNode,
  revealContext: KnitScrollRevealContext,
  stitchOrder: KnitScrollStitchOrder,
): [ReactNode, KnitScrollRevealContext] {
  if (!isElement(node)) {
    return [node, revealContext]
  }

  if (isKnitPatternElement(node)) {
    return [
      cloneElement(node, {
        reveal: {
          ...node.props.reveal,
          direction: node.props.reveal?.direction ?? 'bottom-to-top',
          order: node.props.reveal?.order ?? stitchOrder,
          rowOffset: revealContext.rowOffset,
          stitchOffset: revealContext.stitchOffset,
          visibleStitchCount: revealContext.visibleStitchCount,
        },
      }),
      {
        rowOffset: revealContext.rowOffset + node.props.pattern.rows.length,
        stitchOffset:
          revealContext.stitchOffset + getPatternStitchCount(node.props.pattern),
        visibleStitchCount: revealContext.visibleStitchCount,
      },
    ]
  }

  if (!node.props.children) {
    return [node, revealContext]
  }

  const [revealedChildren, nextRevealContext] = revealChildNodes(
    node.props.children,
    revealContext,
    stitchOrder,
  )

  return [
    cloneElement(node, undefined, revealedChildren),
    nextRevealContext,
  ]
}

function revealChildNodes(
  children: ReactNode,
  revealContext: KnitScrollRevealContext,
  stitchOrder: KnitScrollStitchOrder,
): [ReactNode, KnitScrollRevealContext] {
  let nextRevealContext = revealContext
  const childNodes = Children.toArray(children)
  const revealedChildren: ReactNode[] = [...childNodes]

  for (let index = childNodes.length - 1; index >= 0; index -= 1) {
    const [revealedChild, childRevealContext] = revealScrollPatternNode(
      childNodes[index],
      nextRevealContext,
      stitchOrder,
    )

    nextRevealContext = childRevealContext
    revealedChildren[index] = revealedChild
  }

  return [revealedChildren, nextRevealContext]
}

interface KnitScrollElementProps extends Partial<KnitPatternProps> {
  children?: ReactNode
  direction?: KnitPatternGroupDirection
}

function isElement(node: ReactNode): node is ReactElement<KnitScrollElementProps> {
  return typeof node === 'object' && node !== null && 'type' in node
}

function isKnitPatternElement(
  node: ReactElement<KnitScrollElementProps>,
): node is ReactElement<KnitPatternProps> {
  return node.type === KnitPattern && !!node.props.pattern
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getLoopProgress(value: number): number {
  return value - Math.floor(value)
}
