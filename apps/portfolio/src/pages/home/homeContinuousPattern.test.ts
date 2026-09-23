import { validateKnitPattern } from '@knit-ui/core'
import { describe, expect, it } from 'vitest'
import { connectHomeProjectPattern } from './homeContinuousPattern'
import { homePattern } from './homeFigmaPattern'
import { createProjectPattern } from './ProjectPattern'

describe('continuous home fabric', () => {
  it('joins projects directly to the title without a gap or a change of column count', () => {
    const projects = createProjectPattern()
    const pattern = connectHomeProjectPattern(projects)

    expect(pattern.castOn).toBe(19)
    expect(pattern.rows).toHaveLength(52 + 40)
    expect(pattern.rows.every(({ stitches }) => stitches.length === 19)).toBe(true)
    expect(validateKnitPattern(pattern).valid).toBe(true)
    expect(pattern.rows.slice(0, 52)).toEqual(projects.rows)
    expect(pattern.cables).toEqual(projects.cables)
  })

  it('preserves the title stitches and keeps them first in bottom-up reveal order', () => {
    const pattern = connectHomeProjectPattern(createProjectPattern())

    homePattern.rows.forEach(({ stitches }, rowIndex) => {
      const connected = pattern.rows[52 + rowIndex]!.stitches
      expect(connected.slice(0, 16)).toEqual(stitches.slice(0, 16))
      expect(connected[18]).toEqual(stitches[16])
    })
    expect(homePattern.castOn).toBe(17)
    expect(homePattern.rows[0]!.stitches).toHaveLength(17)
  })
})
