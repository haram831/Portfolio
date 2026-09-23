import type { KnitPatternData } from '@knit-ui/core'
import { homePalette, homePattern } from './homeFigmaPattern'
import { homeExperiencePattern } from './homeExperiencePattern'

export function connectHomeProjectPattern(projectPattern: KnitPatternData): KnitPatternData {
  // Bottom-to-top: title first, then projects, then the experience invitation.
  // Add one knit/purl pair before the title's right edge to match all 19 columns.
  const titleRows = homePattern.rows.map(({ stitches }) => ({
    stitches: [
      ...stitches.slice(0, -1),
      { kind: 'knit' as const, color: homePalette.darkGrey },
      { kind: 'purl' as const, color: homePalette.darkGrey },
      ...stitches.slice(-1),
    ],
  }))

  return {
    ...projectPattern,
    rows: [...homeExperiencePattern.rows, ...projectPattern.rows, ...titleRows],
    cables: projectPattern.cables?.map((cable) => ({
      ...cable,
      row: cable.row + homeExperiencePattern.rows.length,
    })),
    accidents: projectPattern.accidents?.map((accident) => ({
      ...accident,
      row: accident.row + homeExperiencePattern.rows.length,
    })),
  }
}
