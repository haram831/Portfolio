import { validateKnitPattern } from '@knit-ui/core'
import { describe, expect, it } from 'vitest'
import {
  experienceLettering,
  experienceLinkPositions,
  homeExperiencePattern,
} from './homeExperiencePattern'
import { homePalette } from './homeFigmaPattern'

describe('Try Your Pattern invitation', () => {
  it('uses three staggered lines and the existing 19-column fabric', () => {
    expect(experienceLettering).toEqual([
      { text: 'Pattern', row: 4, pixel: 2 },
      { text: 'Your', row: 13, pixel: 11 },
      { text: 'Try', row: 22, pixel: 6 },
    ])
    expect(homeExperiencePattern.castOn).toBe(19)
    expect(homeExperiencePattern.rows).toHaveLength(33)
    expect(validateKnitPattern(homeExperiencePattern).valid).toBe(true)
  })

  it('uses the title palette, keeps the edges intact, and links every white letter stitch', () => {
    const linked = new Set(experienceLinkPositions.map(({ rowIndex, columnIndex }) =>
      `${rowIndex}:${columnIndex}`,
    ))
    expect(linked.size).toBe(experienceLinkPositions.length)
    expect(linked.size).toBeGreaterThan(0)

    homeExperiencePattern.rows.forEach(({ stitches }, rowIndex) => {
      expect(stitches[0]?.color).toBe(homePalette.grey)
      expect(stitches[18]?.color).toBe(homePalette.grey)
      stitches.forEach((stitch, columnIndex) => {
        const colors = [stitch.color, stitch.leftColor, stitch.rightColor].filter(Boolean)
        expect(colors.every((color) => Object.values(homePalette).includes(color!))).toBe(true)
        expect(linked.has(`${rowIndex}:${columnIndex}`)).toBe(colors.includes(homePalette.white))
      })
    })
  })
})
