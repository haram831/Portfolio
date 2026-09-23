import type { KnitPatternData } from '@knit-ui/core'
import { homePalette, homePattern } from './homeFigmaPattern'

export function connectHomeProjectPattern(projectPattern: KnitPatternData): KnitPatternData {
  // Knitting progresses bottom-to-top: the title is made first, then projects.
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
    rows: [...projectPattern.rows, ...titleRows],
  }
}
