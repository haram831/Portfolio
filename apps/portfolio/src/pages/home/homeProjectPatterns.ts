import { extractImageColorGrid } from '@knit-ui/core'
import type { KnitPatternData, StitchKind } from '@knit-ui/core'
import { homePalette } from './homeFigmaPattern'

// Preserved for future use. Home deliberately does not import or load this module.
const HOME_PROJECT_PATTERN_GAP_ROWS = 2

const homeColumnSpecs = Array.from({ length: 22 }, (_, columnIndex) => ({
  kind: columnIndex % 2 === 0 ? 'knit' : 'purl',
  span: 1,
})) satisfies { kind: StitchKind; span: number }[]

const HOME_PATTERN_COLUMN_COUNT = homeColumnSpecs.reduce(
  (columnCount, column) => columnCount + column.span,
  0,
)

interface HomeProjectPatternDefinition {
  columns: number
  rows: number
  source: string
  startColumn: number
}

interface HomeProjectColorGrid {
  colors: string[][]
  project: HomeProjectPatternDefinition
}

export const homeProjectPatterns: HomeProjectPatternDefinition[] = [
  {
    columns: 12,
    rows: 9,
    source: '/laTourette.png',
    startColumn: 2,
  },
  {
    columns: 7,
    rows: 12,
    source: '/hardCopyDeepCopy.jpg',
    startColumn: 13,
  },
  {
    columns: 9,
    rows: 9,
    source: '/getYourRing.jpg',
    startColumn: 2,
  },
  {
    columns: 10,
    rows: 10,
    source: '/hangsha.png',
    startColumn: 11,
  },
  {
    columns: 14,
    rows: 7,
    source: '/adreboa.jpg',
    startColumn: 5,
  },
]

export function appendProjectColorGrids(
  pattern: KnitPatternData,
  projectColorGrids: HomeProjectColorGrid[],
): KnitPatternData {
  if (projectColorGrids.length === 0) {
    return pattern
  }

  return {
    ...pattern,
    rows: [
      ...projectColorGrids.flatMap(({ colors, project }, projectIndex) => [
        ...colors.map((row) => makeProjectPatternRow(row, project.startColumn)),
        ...(projectIndex < projectColorGrids.length - 1
          ? Array.from(
              { length: HOME_PROJECT_PATTERN_GAP_ROWS },
              makeHomeExtensionRow,
            )
          : []),
      ]),
      ...pattern.rows,
    ],
  }
}

function makeProjectPatternRow(colors: string[], startColumn: number) {
  return {
    stitches: homeColumnSpecs.map(({ kind, span }, columnIndex) => ({
      color:
        colors[columnIndex - startColumn] ?? getHomeExtensionColor(columnIndex),
      kind,
      span,
    })),
  }
}

function makeHomeExtensionRow() {
  return {
    stitches: homeColumnSpecs.map(({ kind, span }, columnIndex) => ({
      color: getHomeExtensionColor(columnIndex),
      kind,
      span,
    })),
  }
}

function getHomeExtensionColor(columnIndex: number): string {
  return columnIndex === 0 || columnIndex === HOME_PATTERN_COLUMN_COUNT - 1
    ? homePalette.grey
    : homePalette.darkGrey
}

export async function loadHomeProjectColorGrids(): Promise<HomeProjectColorGrid[]> {
  const results = await Promise.allSettled(
    homeProjectPatterns.map(async (project) => ({
      colors: await extractImageColorGrid(
        project.source,
        project.columns,
        project.rows,
      ),
      project,
    })),
  )

  return results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  )
}
