import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnitPattern } from './KnitPattern'
import type { KnitPatternData } from '../pattern'

afterEach(() => {
  cleanup()
})

const basicPattern: KnitPatternData = {
  castOn: 3,
  rows: [
    {
      stitches: [{ kind: 'knit' }, { kind: 'purl' }, { kind: 'knit' }],
    },
    {
      stitches: [{ kind: 'purl' }, { kind: 'knit' }, { kind: 'knit' }],
    },
  ],
}

const cablePattern: KnitPatternData = {
  castOn: 4,
  rows: [
    {
      stitches: [
        { kind: 'knit' },
        { kind: 'purl' },
        { kind: 'knit' },
        { kind: 'purl' },
      ],
    },
    {
      stitches: [
        { kind: 'knit' },
        { kind: 'knit' },
        { kind: 'purl' },
        { kind: 'purl' },
      ],
    },
    {
      stitches: [
        { kind: 'purl' },
        { kind: 'knit' },
        { kind: 'purl' },
        { kind: 'knit' },
      ],
    },
  ],
  cables: [
    {
      row: 0,
      height: 2,
      leftStartStitch: 0,
      leftEndStitch: 1,
      rightStartStitch: 2,
      rightEndStitch: 3,
      cross: 'left-over-right',
    },
  ],
}

describe('KnitPattern stitch interaction', () => {
  it.each([false, true])('uses left colors for generated mistakes, including cables (%s)', (withCable) => {
    const pattern: KnitPatternData = {
      castOn: 2,
      rows: [{ stitches: [
        { kind: 'knit', color: '#123456', leftColor: '#abcdef', rightColor: '#fedcba' },
        { kind: 'purl', color: '#654321' },
      ] }],
      cables: withCable ? [{
        row: 0, height: 1,
        leftStartStitch: 0, leftEndStitch: 0,
        rightStartStitch: 1, rightEndStitch: 1,
        cross: 'left-over-right',
      }] : undefined,
    }
    const { container } = render(<KnitPattern pattern={pattern} mistakeFrequency={1} />)
    const mistake = container.querySelector<SVGSVGElement>('svg[style*="--knit-stitch-left-color"]')!
    expect(mistake).toHaveClass('knit-stitch-unit--mistake')
    expect(mistake.style.getPropertyValue('--knit-stitch-color')).toBe('#abcdef')
    fireEvent.click(mistake)
    expect(mistake).toHaveClass('knit-stitch-unit--knit')
    expect(mistake.style.getPropertyValue('--knit-stitch-color')).toBe('#123456')
    expect(mistake.style.getPropertyValue('--knit-stitch-left-color')).toBe('#abcdef')
    expect(mistake.style.getPropertyValue('--knit-stitch-right-color')).toBe('#fedcba')
  })

  it('keeps every stitch clickable when no target positions are provided', () => {
    const onStitchClick = vi.fn()

    render(<KnitPattern onStitchClick={onStitchClick} pattern={basicPattern} />)

    const buttons = screen.getAllByRole('button')

    expect(buttons).toHaveLength(6)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'knit stitch row 1, column 1',
      }),
    )

    expect(onStitchClick).toHaveBeenCalledWith(
      expect.objectContaining({
        columnIndex: 0,
        renderedKind: 'knit',
        rowIndex: 0,
        source: 'row',
        stitch: basicPattern.rows[0]?.stitches[0],
        stitchIndex: 0,
      }),
    )
  })

  it('only makes targeted row stitches clickable when target positions are provided', () => {
    const onStitchClick = vi.fn()

    render(
      <KnitPattern
        interactiveStitchPositions={[{ rowIndex: 1, columnIndex: 2 }]}
        onStitchClick={onStitchClick}
        pattern={basicPattern}
      />,
    )

    const button = screen.getByRole('button', {
      name: 'knit stitch row 2, column 3',
    })

    expect(screen.getAllByRole('button')).toHaveLength(1)

    fireEvent.click(button)

    expect(onStitchClick).toHaveBeenCalledWith(
      expect.objectContaining({
        columnIndex: 2,
        renderedKind: 'knit',
        rowIndex: 1,
        source: 'row',
        stitch: basicPattern.rows[1]?.stitches[2],
        stitchIndex: 2,
      }),
    )
  })

  it('activates targeted stitches with Enter and Space', () => {
    const onStitchClick = vi.fn()

    render(
      <KnitPattern
        interactiveStitchPositions={[{ rowIndex: 0, columnIndex: 1 }]}
        onStitchClick={onStitchClick}
        pattern={basicPattern}
      />,
    )

    const button = screen.getByRole('button', {
      name: 'purl stitch row 1, column 2',
    })

    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(onStitchClick).toHaveBeenCalledTimes(2)
    expect(onStitchClick).toHaveBeenLastCalledWith(
      expect.objectContaining({
        columnIndex: 1,
        rowIndex: 0,
        source: 'row',
      }),
    )
  })

  it('resolves generated mistakes before calling the supplied stitch click handler', () => {
    const onStitchClick = vi.fn()

    render(
      <KnitPattern
        mistakeFrequency={1}
        onStitchClick={onStitchClick}
        pattern={basicPattern}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', {
      name: 'Resolve mistake stitch',
    })[0])

    expect(onStitchClick).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', {
      name: 'knit stitch row 1, column 1',
    }))

    expect(onStitchClick).toHaveBeenCalledWith(
      expect.objectContaining({
        columnIndex: 0,
        renderedKind: 'knit',
        rowIndex: 0,
        source: 'row',
        stitch: basicPattern.rows[0]?.stitches[0],
        stitchIndex: 0,
      }),
    )
  })

  it('applies target positions to cable stitches by source row and column', () => {
    const onStitchClick = vi.fn()

    render(
      <KnitPattern
        interactiveStitchPositions={[{ rowIndex: 0, columnIndex: 2 }]}
        onStitchClick={onStitchClick}
        pattern={cablePattern}
      />,
    )

    const button = screen.getByRole('button', {
      name: 'knit cable stitch row 1, column 3',
    })

    expect(screen.getAllByRole('button')).toHaveLength(1)

    fireEvent.click(button)

    expect(onStitchClick).toHaveBeenCalledWith(
      expect.objectContaining({
        columnIndex: 2,
        renderedKind: 'knit',
        rowIndex: 0,
        source: 'cable',
        stitch: cablePattern.rows[0]?.stitches[2],
        stitchIndex: 2,
      }),
    )
  })
})
