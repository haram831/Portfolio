import type { CSSProperties, SVGProps } from 'react'
import type { StitchKind } from '../pattern'
import '../styles/knit-ui.css'

const STITCH_VIEW_BOX = '2.6 14 123 92'
const STITCH_ASPECT_RATIO = 123 / 92

export interface KnitStitchUnitProps
  extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  kind: StitchKind
  color?: string
  /** Left leg color for knit stitches; also the preferred color for mistakes. */
  leftColor?: string
  /** Right leg color for knit stitches; defaults to the base color. */
  rightColor?: string
  size?: number | string
  strokeWidth?: number | string
}

export function KnitStitchUnit({
  kind,
  color,
  leftColor,
  rightColor,
  size = 48,
  strokeWidth,
  className,
  style,
  ...props
}: KnitStitchUnitProps) {
  const classes = ['knit-stitch-unit', `knit-stitch-unit--${kind}`, className]
    .filter(Boolean)
    .join(' ')
  const stitchStyle = {
    ...style,
    '--knit-stitch-aspect-ratio': STITCH_ASPECT_RATIO,
    '--knit-stitch-color': kind === 'mistake' ? leftColor ?? color : color,
    ...(leftColor !== undefined ? { '--knit-stitch-left-color': leftColor } : {}),
    ...(rightColor !== undefined ? { '--knit-stitch-right-color': rightColor } : {}),
    '--knit-stitch-size': typeof size === 'number' ? `${size}px` : size,
    ...(strokeWidth
      ? {
          '--knit-stitch-stroke-width':
            typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth,
        }
      : {}),
  } as CSSProperties
  const ariaLabel = props['aria-label']

  return (
    <svg
      aria-hidden={ariaLabel ? undefined : true}
      className={classes}
      focusable="false"
      role={ariaLabel ? 'img' : undefined}
      style={stitchStyle}
      viewBox={STITCH_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {kind === 'knit' ? <KnitShape /> : null}
      {kind === 'purl' ? <PurlShape /> : null}
      {kind === 'mistake' ? <MistakeShape /> : null}
    </svg>
  )
}

function KnitShape() {
  return (
    <>
      <path
        className="knit-stitch-unit__thread knit-stitch-unit__thread--left"
        d="M22.6 28.4C22.6 28.4 36 44.1 40.9 56.1C45.8 68.1 48.6 91.6 48.6 91.6"
      />
      <path
        className="knit-stitch-unit__thread knit-stitch-unit__thread--right"
        d="M105.6 28.4C105.6 28.4 94.8 37.9 89.9 49.9C85 61.9 79.5 91.6 79.5 91.6"
      />
    </>
  )
}

function PurlShape() {
  return (
    <path
      className="knit-stitch-unit__thread"
      d="M20.1 65.8C20.1 65.8 48.1 54.4 66 53.2C83.9 52 112 61.6 112 61.6"
      transform="translate(-2 0)"
    />
  )
}

function MistakeShape() {
  return (
    <path
      className="knit-stitch-unit__thread"
      d="M51.6 103.7C22.6 74.7 12.5 22.2 60.3 22.2C108.1 22.2 99.4 73.8 67.5 103.7"
      transform="translate(4 0)"
    />
  )
}
