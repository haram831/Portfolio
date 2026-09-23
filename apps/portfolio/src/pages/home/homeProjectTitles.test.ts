import { describe, expect, it } from 'vitest'
import { getProjectTitleRevealCount, projectTitles } from './homeProjectTitles'
import { createProjectPattern, projectPlacements } from './ProjectPattern'
import { connectHomeProjectPattern } from './homeContinuousPattern'
import { homeExperiencePattern } from './homeExperiencePattern'

describe('project title reveal timing', () => {
  it('waits for every project stitch, in both alternating row directions', () => {
    const pattern = connectHomeProjectPattern(createProjectPattern())
    for (const project of projectPlacements) {
      const indices: number[] = []
      for (let row = project.startRow; row < project.startRow + project.rows; row++) {
        const revealRow = pattern.rows.length - homeExperiencePattern.rows.length - row - 1
        for (let column = project.startColumn; column < project.startColumn + project.columns; column++) {
          indices.push(revealRow * pattern.castOn + (revealRow % 2 ? pattern.castOn - column - 1 : column))
        }
      }
      const count = getProjectTitleRevealCount(
        project, pattern.rows.length, homeExperiencePattern.rows.length, pattern.castOn,
      )
      expect(indices.every((index) => index < count)).toBe(true)
      expect(indices.every((index) => index < count - 1)).toBe(false)
      expect(projectTitles[project.id]?.text).toBeTruthy()
    }
  })
})
