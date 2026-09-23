import { extractImageColorGrid } from '@knit-ui/core'
import type { KnitPatternData } from '@knit-ui/core'
import { homePalette } from './homeFigmaPattern'

export const laTouretteColorPalette = {
  green1: '#94B04A',
  green2: '#48A900',
  green3: '#5D802F',
  green4: '#215400',
  blue: '#799B99',
  brown1: '#CBC7C0',
  brown2: '#A58E84',
  brown3: '#725E53',
  brown4: '#110F10',
}

const C = laTouretteColorPalette

export const laTourettePattern = [
  [
    C.green4, C.green1, C.green4,
    C.green2, C.green4, C.green4,
    C.green2, C.green2, C.green4,
  ],
  [
    C.green3, C.green2, C.green1,
    C.green3, C.green3, C.green4,
    C.green4, C.green4, C.green3,
  ],
  [
    C.green4, C.green4, C.blue,
    C.blue, C.blue, C.blue,
    C.blue, C.green2, C.green2,
  ],
  [
    C.green2, C.green2, C.blue,
    C.brown2, C.brown3, C.brown3,
    C.blue, C.green2, C.green4,
  ],
  [
    C.green2, C.green4, C.blue,
    C.brown3, C.brown2, C.brown3,
    C.blue, C.green1, C.green2,
  ],
  [
    C.green4, C.green1, C.blue,
    C.brown2, C.brown2, C.brown2,
    C.blue, C.green4, C.green3,
  ],
  [
    C.green3, C.green1, C.blue,
    C.brown3, C.brown2, C.brown2,
    C.blue, C.green1, C.green4,
  ],
  [
    C.green4, C.green4, C.blue,
    C.brown4, C.brown3, C.brown2,
    C.blue, C.green2, C.green3,
  ],
  [
    C.green3, C.green2, C.blue,
    C.brown4, C.brown2, C.brown3,
    C.blue, C.green1, C.green4,
  ],
  [
    C.green2, C.green4, C.blue,
    C.blue, C.blue, C.blue,
    C.blue, C.green1, C.green2,
  ],
  [
    C.green4, C.green4, C.green1,
    C.green2, C.green4, C.green4,
    C.green2, C.green2, C.green1,
  ],
  [
    C.green4, C.green1, C.green3,
    C.green3, C.green2, C.green1,
    C.green3, C.green3, C.green1,
  ],
] as const

export const hourglassColorPalette = {
  black: '#000000',
  darkGrey: '#3F3F3F',
  grey: '#838383',
  lightGrey: '#C0C0C0',
  white: '#FFFFFF'
}

export const hangshaColorPalette = {
  navy: '#4D80E8',
  blue: '#B8D0FF',
  skyBlue: '#ACE8FF',
  lightBlue: '#E2ECFF',
  green: '#B3F0D7',
  lightGreen: '#DBFECE',
  red: '#FF4367'
}

export const fullFalseColorPalette = {
  white: '#FFFFFF',
  red: '#FF000D',
  darkRed: '#E60013',
  ocher: '#DD8E4F',
  grey: '#D3D2CD',
  Brown: '#5D3317',
  blackBrown: '#46202A',
  black: '#2E2751',
  skyBlue: '#00A1E9',
  blue: '#0014E8'
}

export const adreboaColorPalette = {
red: '#FF0306',
orange: '#FD8103',
darkGreen: '#0B4D01',
green: '#6DC80A',
yellowGreen: '#D9E82B',
blue: '#92CABD',
lightGreen: '#B7F1AB',
white: '#FDFDFF',
}

export interface ProjectPlacement {
  id: string
  startColumn: number
  startRow: number
  columns: number
  rows: number
  source?: string
}

// Figma 92:7176: zero-based positions in a 19-column, 52-row fabric.
// Only geometry is taken from Figma, not its colors or text labels.
export const projectPlacements: ProjectPlacement[] = [
  // Figma starts at column 2; move full & false one stitch to the right.
  { id: 'full-false', startColumn: 3, startRow: 2, columns: 4, rows: 7, source: '/trueFalse.jpg' },
  { id: 'soft-copy-deep-copy', startColumn: 12, startRow: 6, columns: 4, rows: 8, source: '/hardCopyDeepCopy.jpg' },
  { id: 'hangsha', startColumn: 2, startRow: 13, columns: 5, rows: 8, source: '/hangsha.png' },
  { id: 'hourglass', startColumn: 2, startRow: 26, columns: 5, rows: 7, source: '/getYourRing.jpg' },
  { id: 'adreboa', startColumn: 12, startRow: 18, columns: 5, rows: 14, source: '/adreboa.jpg' },
  { id: 'la-tourette', startColumn: 2, startRow: 38, columns: 15, rows: 12 },
]

export type ProjectColorGrids = Record<string, readonly (readonly string[])[]>

export function createProjectPattern(colors: ProjectColorGrids = {}): KnitPatternData {
  const colorGrids: ProjectColorGrids = { 'la-tourette': laTourettePattern, ...colors }
  const fullFalse = projectPlacements[0]!

  return {
    castOn: 19,
    rows: Array.from({ length: 52 }, (_, rowIndex) => ({
      stitches: Array.from({ length: 19 }, (_, columnIndex) => {
        const project = projectPlacements.find((placement) =>
          rowIndex >= placement.startRow && rowIndex < placement.startRow + placement.rows &&
          columnIndex >= placement.startColumn && columnIndex < placement.startColumn + placement.columns,
        )
        const grid = project ? colorGrids[project.id] : undefined
        // Keep the saved La Tourette colors, resampling its nine columns to fifteen.
        const sourceRow = project && grid?.length
          ? grid[Math.floor((rowIndex - project.startRow) * grid.length / project.rows)]
          : undefined
        const color = project && sourceRow?.length
          ? sourceRow[Math.floor((columnIndex - project.startColumn) * sourceRow.length / project.columns)]
          : undefined

        return {
          kind: columnIndex % 2 === 0 ? 'knit' as const : 'purl' as const,
          color: color ?? (columnIndex === 0 || columnIndex === 18 ? homePalette.grey : homePalette.darkGrey),
        }
      }),
    })),
    cables: [{
      row: fullFalse.startRow,
      height: fullFalse.rows,
      leftStartStitch: fullFalse.startColumn,
      leftEndStitch: fullFalse.startColumn + 1,
      rightStartStitch: fullFalse.startColumn + 2,
      rightEndStitch: fullFalse.startColumn + 3,
      cross: 'left-over-right',
      // Sample the project image across the visible crossing.
      color: colors[fullFalse.id]?.map((row) => [...row]),
    }],
  }
}

let projectColorGridsPromise: Promise<ProjectColorGrids> | undefined

export function loadProjectColorGrids(): Promise<ProjectColorGrids> {
  // Reuse image sampling across StrictMode effects and returns to the home page.
  projectColorGridsPromise ??= readProjectColorGrids()
  return projectColorGridsPromise
}

async function readProjectColorGrids(): Promise<ProjectColorGrids> {
  const results = await Promise.allSettled(projectPlacements.map(async (project) => [
    project.id,
    project.source
      ? await extractImageColorGrid(project.source, project.columns, project.rows, { maxSampleDimension: 256 })
      : laTourettePattern,
  ] as const))

  // A failed image leaves only that project's background; other positions stay fixed.
  return Object.fromEntries(results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  ))
}
