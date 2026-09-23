import { describe, expect, it } from 'vitest'
import { validateKnitPattern } from '@knit-ui/core'
import { colorGridToPattern, createImagePattern, createTextPattern, getPatternDimensions, MAX_COLUMNS, MAX_FILE_BYTES, MAX_ROWS, textCharacters } from './experiencePattern'

describe('experience pattern inputs', () => {
  it('uses one stitch per ten image pixels, with denser sampling for text', () => {
    expect(getPatternDimensions(600, 400)).toEqual({ columns: 60, rows: 40 })
    expect(getPatternDimensions(200, 100, 4)).toEqual({ columns: 50, rows: 25 })
  })

  it.each([[4000, 3000], [3000, 4000], [1, 10000], [10000, 1], [16, 16]])(
    'bounds a %s × %s image without stretching ordinary aspect ratios', (width, height) => {
      const { columns, rows } = getPatternDimensions(width, height)
      expect(columns).toBeGreaterThanOrEqual(1)
      expect(rows).toBeGreaterThanOrEqual(1)
      expect(columns).toBeLessThanOrEqual(MAX_COLUMNS)
      expect(rows).toBeLessThanOrEqual(MAX_ROWS)
      if (width / height > 0.1 && width / height < 10) {
        expect(columns / rows).toBeCloseTo(width / height, 1)
      }
    },
  )

  it.each([[0, 1], [1, 0], [NaN, 10], [10, Infinity]])('rejects invalid image dimensions', (width, height) => {
    expect(() => getPatternDimensions(width, height)).toThrow()
  })

  it('counts Hangul, joined emoji and combining accents as visible characters', () => {
    expect(textCharacters('한👩‍👩‍👧‍👦e\u0301')).toHaveLength(3)
  })

  it('preserves image colors and orientation in a valid library pattern', () => {
    const colors = [['#ff0000', '#00ff00'], ['#0000ff', '#ffffff']]
    const pattern = colorGridToPattern(colors)
    expect(validateKnitPattern(pattern).valid).toBe(true)
    expect(pattern.castOn).toBe(2)
    expect(pattern.rows.map((row) => row.stitches.map((stitch) => stitch.color))).toEqual(colors)
  })

  it('rejects blank and overlong text before using canvas', async () => {
    await expect(createTextPattern('   ')).rejects.toThrow('입력')
    await expect(createTextPattern('한'.repeat(51))).rejects.toThrow('50자')
  })

  it('rejects unsupported and oversized uploads before decoding', async () => {
    await expect(createImagePattern(new File(['bad'], 'bad.svg', { type: 'image/svg+xml' }))).rejects.toThrow('이미지')
    const file = new File(['large'], 'large.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: MAX_FILE_BYTES + 1 })
    await expect(createImagePattern(file)).rejects.toThrow('10MB')
  })
})
