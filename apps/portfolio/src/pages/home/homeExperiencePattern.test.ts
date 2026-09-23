import { validateKnitPattern } from '@knit-ui/core'
import { describe, expect, it } from 'vitest'
import {
  experienceLettering,
  experienceLinkPositions,
  homeExperiencePattern,
} from './homeExperiencePattern'
import { homePalette } from './homeFigmaPattern'

describe('Try Your Pattern invitation', () => {
  it('moves only Try’s r one lettering pixel left', () => {
    expect(rowPixels(22).slice(6, 11)).toBe('11111') // T stays put.
    expect(rowPixels(24).slice(11, 15)).toBe('1110') // r's top shifts left.
    expect(rowPixels(25).slice(11, 15)).toBe('1000') // Its stem shifts too.
    expect(rowPixels(24).slice(15, 18)).toBe('101') // y stays put.
    expect(rowPixels(15).slice(23, 26)).toBe('111') // Your's r is unchanged.
  })

  it('extends the lowercase y two rows below T and r without moving the word', () => {
    expect(Array.from({ length: 7 }, (_, index) => rowPixels(24 + index).slice(15, 18)))
      .toEqual(['101', '101', '101', '101', '011', '001', '110'])
    for (const row of [29, 30]) {
      expect(rowPixels(row).slice(0, 15)).not.toContain('1')
      expect(rowPixels(row).slice(18)).not.toContain('1')
    }
    expect(rowPixels(31)).not.toContain('1')
    expect(rowPixels(32)).not.toContain('1')
  })

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

function rowPixels(row: number) {
  return homeExperiencePattern.rows[row]!.stitches.flatMap((stitch) =>
    stitch.kind === 'knit'
      ? [stitch.leftColor, stitch.rightColor]
      : [stitch.color],
  ).map((color) => color === homePalette.white ? '1' : '0').join('')
}
