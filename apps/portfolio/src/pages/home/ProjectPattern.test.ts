import { extractImageColorGrid, validateKnitPattern } from '@knit-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createProjectPattern,
  laTourettePattern,
  loadProjectColorGrids,
  projectPlacements,
} from './ProjectPattern'
import { homePalette } from './homeFigmaPattern'

vi.mock('@knit-ui/core', async (importOriginal) => ({
  ...await importOriginal<typeof import('@knit-ui/core')>(),
  extractImageColorGrid: vi.fn(),
}))

afterEach(() => vi.resetAllMocks())

describe('ProjectPattern', () => {
  it('matches the six Figma footprints with full & false shifted right once', () => {
    expect(projectPlacements.map(({ id, startColumn, startRow, columns, rows }) =>
      [id, startColumn, startRow, columns, rows],
    )).toEqual([
      ['full-false', 3, 2, 4, 7],
      ['soft-copy-deep-copy', 12, 6, 4, 8],
      ['hangsha', 2, 13, 5, 8],
      ['hourglass', 2, 26, 5, 7],
      ['adreboa', 12, 18, 5, 14],
      ['la-tourette', 2, 38, 15, 12],
    ])

    const occupied = new Set<string>()
    for (const project of projectPlacements) {
      for (let row = project.startRow; row < project.startRow + project.rows; row++) {
        for (let column = project.startColumn; column < project.startColumn + project.columns; column++) {
          expect(row).toBeLessThan(52)
          expect(column).toBeLessThan(19)
          expect(occupied.has(`${row}:${column}`)).toBe(false)
          occupied.add(`${row}:${column}`)
        }
      }
    }
  })

  it('keeps a stable fabric and existing colors before images load', () => {
    const pattern = createProjectPattern()

    expect(pattern.castOn).toBe(19)
    expect(pattern.rows).toHaveLength(52)
    expect(pattern.rows.every(({ stitches }) => stitches.length === 19)).toBe(true)
    expect(validateKnitPattern(pattern).valid).toBe(true)
    expect(pattern.rows[0]?.stitches[0]?.color).toBe(homePalette.grey)
    expect(pattern.rows[0]?.stitches[1]?.color).toBe(homePalette.darkGrey)
    expect(pattern.rows[38]?.stitches[2]?.color).toBe(laTourettePattern[0][0])
    expect(pattern.rows[49]?.stitches[16]?.color).toBe(laTourettePattern[11][8])
    expect(pattern.cables?.[0]).toMatchObject({
      row: 2, height: 7, leftStartStitch: 3, rightEndStitch: 6,
    })
  })

  it('paints precisely each project footprint without moving its neighbors', () => {
    const grids = Object.fromEntries(projectPlacements.map((project) => [
      project.id,
      Array.from({ length: project.rows }, () => Array<string>(project.columns).fill('#123456')),
    ]))
    const pattern = createProjectPattern(grids)
    const colored = pattern.rows.flatMap(({ stitches }) => stitches)
      .filter(({ color }) => color === '#123456')

    expect(colored).toHaveLength(projectPlacements.reduce((sum, project) =>
      sum + project.columns * project.rows, 0,
    ))
    expect(validateKnitPattern(pattern).valid).toBe(true)
    expect(pattern.rows[2]?.stitches[2]?.color).toBe(homePalette.darkGrey)
  })

  it('retains the other projects if an image fails', async () => {
    vi.mocked(extractImageColorGrid).mockImplementation(async (source, columns, rows) => {
      if (source === '/trueFalse.jpg') throw new Error('Image unavailable')
      return Array.from({ length: rows }, () => Array<string>(columns).fill('#abcdef'))
    })

    const colors = await loadProjectColorGrids()
    expect(colors['full-false']).toBeUndefined()
    expect(colors['la-tourette']).toEqual(laTourettePattern)
    expect(colors.hangsha).toHaveLength(8)
    expect(colors.adreboa?.[0]).toHaveLength(5)
    expect(createProjectPattern(colors).rows[13]?.stitches[2]?.color).toBe('#abcdef')
  })
})
