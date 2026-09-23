import { validateKnitPattern } from '@knit-ui/core'
import { describe, expect, it } from 'vitest'
import {
  createProjectPattern,
  figmaProjectColorGrids,
  laTourettePattern,
  projectPlacements,
} from './ProjectPattern'
import { homePalette } from './homeFigmaPattern'

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

  it('renders the Figma colors immediately in a stable fabric', () => {
    const pattern = createProjectPattern()

    expect(pattern.castOn).toBe(19)
    expect(pattern.rows).toHaveLength(52)
    expect(pattern.rows.every(({ stitches }) => stitches.length === 19)).toBe(true)
    expect(validateKnitPattern(pattern).valid).toBe(true)
    expect(pattern.rows[0]?.stitches[0]?.color).toBe(homePalette.grey)
    expect(pattern.rows[0]?.stitches[1]?.color).toBe(homePalette.darkGrey)
    expect(pattern.rows[38]?.stitches[2]?.color).toBe(laTourettePattern[0][0])
    expect(pattern.rows[49]?.stitches[16]?.color).toBe(laTourettePattern[11][14])
    expect(pattern.rows[6]?.stitches.slice(12, 16).map(({ color }) => color))
      .toEqual(['#FFFFFF', '#FFFFFF', '#000000', '#000000'])
    expect(pattern.rows[13]?.stitches.slice(2, 7).map(({ color }) => color))
      .toEqual(['#FF4367', '#B8D0FF', '#FF4367', '#B8D0FF', '#FF4367'])
    expect(pattern.rows[20]?.stitches[12]).toMatchObject({
      leftColor: '#6DC80A', rightColor: '#FF0306',
    })
    expect(pattern.rows[42]?.stitches[8]).toMatchObject({
      leftColor: '#A58E84', rightColor: '#725E53',
    })
    expect(pattern.cables?.[0]).toMatchObject({
      row: 2, height: 7, leftStartStitch: 3, rightEndStitch: 6,
    })
    expect(pattern.cables?.[0]?.color).toEqual(figmaProjectColorGrids['full-false'])
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

  it('renders 하지 못한 말 with the Figma hourglass shading and split corner legs', () => {
    const rows = createProjectPattern().rows.slice(26, 33)
      .map(({ stitches }) => stitches.slice(2, 7))

    expect(rows.map((row) => row.map(({ color }) => color))).toEqual([
      ['#000000', '#838383', '#C0C0C0', '#838383', '#3F3F3F'],
      ['#000000', '#838383', '#C0C0C0', '#838383', '#000000'],
      ['#000000', '#3F3F3F', '#838383', '#3F3F3F', '#000000'],
      ['#000000', '#3F3F3F', '#838383', '#3F3F3F', '#000000'],
      ['#000000', '#3F3F3F', '#838383', '#3F3F3F', '#000000'],
      ['#000000', '#838383', '#C0C0C0', '#838383', '#000000'],
      ['#000000', '#838383', '#C0C0C0', '#838383', '#3F3F3F'],
    ])
    for (const row of [rows[0], rows[6]]) {
      expect(row?.[0]).toMatchObject({ leftColor: '#000000', rightColor: '#3F3F3F' })
      expect(row?.[4]).toMatchObject({ leftColor: '#3F3F3F', rightColor: '#000000' })
    }
  })
})
