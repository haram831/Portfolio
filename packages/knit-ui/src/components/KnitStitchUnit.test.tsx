import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnitStitchUnit } from './KnitStitchUnit'

describe('KnitStitchUnit', () => {
  it('prefers the left color for mistakes and restores the base color for knit stitches', () => {
    const { container, rerender } = render(
      <KnitStitchUnit kind="mistake" color="#123456" leftColor="#abcdef" rightColor="#fedcba" />,
    )
    expect(container.querySelector('svg')?.style.getPropertyValue('--knit-stitch-color')).toBe('#abcdef')

    rerender(<KnitStitchUnit kind="knit" color="#123456" leftColor="#abcdef" rightColor="#fedcba" />)
    expect(container.querySelector('svg')?.style.getPropertyValue('--knit-stitch-color')).toBe('#123456')
    expect(container.querySelector('svg')?.style.getPropertyValue('--knit-stitch-left-color')).toBe('#abcdef')
    expect(container.querySelector('svg')?.style.getPropertyValue('--knit-stitch-right-color')).toBe('#fedcba')
  })

  it('falls back to the base color when a mistake has no left color', () => {
    const { container } = render(<KnitStitchUnit kind="mistake" color="#123456" rightColor="#fedcba" />)
    expect(container.querySelector('svg')?.style.getPropertyValue('--knit-stitch-color')).toBe('#123456')
  })

  it('renders decorative stitches as hidden svg elements by default', () => {
    const { container } = render(<KnitStitchUnit kind="knit" />)

    const stitch = container.querySelector('svg')

    expect(stitch).toHaveAttribute('aria-hidden', 'true')
    expect(stitch).toHaveClass('knit-stitch-unit')
    expect(stitch).toHaveClass('knit-stitch-unit--knit')
  })

  it('exposes an accessible image when labelled', () => {
    render(<KnitStitchUnit aria-label="Knit stitch" kind="purl" />)

    const stitch = screen.getByRole('img', { name: 'Knit stitch' })

    expect(stitch).toHaveClass('knit-stitch-unit--purl')
  })
})
