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
  pureWhite: '#FFFFFF',
}

export const softCopyDeepCopyColorPalette = {
  white: '#FFFFFF',
  black: '#000000',
}

const C = laTouretteColorPalette
const H = hangshaColorPalette
const A = adreboaColorPalette
const F = fullFalseColorPalette
const S = softCopyDeepCopyColorPalette
const U = hourglassColorPalette

// 하지 못한 말 — Figma 92:7176, columns 2–6 and rows 26–32 (zero-based).
export const hourglassPattern = [
  [[U.black, U.darkGrey], U.grey, U.lightGrey, U.grey, [U.darkGrey, U.black]],
  [U.black, U.grey, U.lightGrey, U.grey, U.black],
  [U.black, U.darkGrey, U.grey, U.darkGrey, U.black],
  [U.black, U.darkGrey, U.grey, U.darkGrey, U.black],
  [U.black, U.darkGrey, U.grey, U.darkGrey, U.black],
  [U.black, U.grey, U.lightGrey, U.grey, U.black],
  [[U.black, U.darkGrey], U.grey, U.lightGrey, U.grey, [U.darkGrey, U.black]],
] as const

// Figma 92:7176, read row-by-row. Pairs preserve different left/right knit legs.
export const laTourettePattern = [
  [C.green3, C.green1, C.green4, C.green4, C.green1, C.green2, C.green3, C.green4, C.green3, C.green4, C.green1, C.green2, C.green2, C.green2, C.green2],
  [C.green4, C.green2, C.green1, C.green1, C.green2, C.green3, C.green4, C.green3, C.green3, C.green4, C.green1, C.green4, C.green1, C.green4, C.green4],
  [C.green3, C.green4, C.green2, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.green3, C.green2, C.green3],
  [C.green4, C.green2, C.blue, C.blue, C.brown2, C.brown2, C.brown2, C.brown3, C.brown2, C.brown3, C.brown3, C.blue, C.green2, C.green2, C.green2],
  [C.green2, C.green4, C.blue, C.blue, C.brown2, C.brown3, [C.brown2, C.brown3], C.brown2, [C.brown2, C.brown3], C.brown3, C.brown2, C.blue, C.green3, C.green1, C.green4],
  [C.green2, C.green1, C.blue, C.blue, C.brown2, C.brown2, C.brown2, C.brown2, C.brown2, C.brown2, C.brown2, C.blue, C.green1, C.green4, C.green2],
  [C.green4, C.green1, C.blue, C.blue, C.brown3, C.brown3, [C.brown3, C.brown2], C.brown2, [C.brown3, C.brown2], C.brown2, C.brown3, C.blue, C.green3, C.green1, C.green3],
  [C.green3, C.green4, C.green2, C.blue, C.brown2, C.brown4, C.brown4, C.brown3, C.brown2, C.brown2, C.brown3, C.blue, C.green3, C.green2, C.green4],
  [C.green4, C.green2, C.green1, C.blue, C.brown4, C.brown4, C.brown4, C.brown2, C.brown3, C.brown3, C.brown2, C.blue, C.green2, C.green1, C.green3],
  [C.green3, C.green4, C.green2, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.blue, C.green1, C.green1, C.green4],
  [C.green2, C.green4, C.green1, C.green1, C.green1, C.green2, C.green3, C.green4, C.green4, C.green4, C.green1, C.green2, C.green3, C.green2, C.green2],
  [C.green4, C.green1, C.green4, C.green3, C.green2, C.green3, C.green4, C.green2, C.green3, C.green1, C.green2, C.green3, C.green4, C.green3, C.green1],
] as const

export const hangshaPattern = [
  [H.red, H.blue, H.red, H.blue, H.red],
  [H.red, H.blue, H.red, H.blue, H.red],
  [H.red, H.red, H.red, H.red, H.red],
  [H.lightBlue, H.lightBlue, H.lightBlue, H.lightBlue, H.lightBlue],
  [H.lightBlue, H.lightBlue, H.navy, H.lightBlue, H.lightBlue],
  [H.lightBlue, H.navy, H.lightBlue, H.navy, H.lightBlue],
  [H.lightBlue, H.lightBlue, H.navy, H.lightBlue, H.lightBlue],
  [H.lightBlue, H.lightBlue, H.lightBlue, H.lightBlue, H.lightBlue],
] as const

export const adreboaPattern = [
  [A.blue, A.yellowGreen, A.blue, A.lightGreen, A.darkGreen],
  [A.darkGreen, A.green, A.green, A.blue, A.green],
  [[A.green, A.red], A.lightGreen, A.darkGreen, A.red, A.lightGreen],
  [A.yellowGreen, A.orange, A.lightGreen, A.green, A.darkGreen],
  [A.blue, A.yellowGreen, A.blue, A.green, A.blue],
  [A.pureWhite, A.blue, A.lightGreen, A.blue, A.yellowGreen],
  [A.pureWhite, A.green, A.green, A.darkGreen, A.white],
  [A.blue, A.yellowGreen, A.darkGreen, A.lightGreen, A.red],
  [A.green, A.lightGreen, A.lightGreen, A.blue, A.darkGreen],
  [A.yellowGreen, A.blue, A.yellowGreen, A.darkGreen, A.green],
  [A.green, A.yellowGreen, A.green, A.lightGreen, A.blue],
  [A.darkGreen, A.red, A.orange, A.green, A.green],
  [A.yellowGreen, A.lightGreen, A.lightGreen, A.blue, A.white],
  [A.pureWhite, A.green, A.yellowGreen, A.lightGreen, A.green],
] as const

export const softCopyDeepCopyPattern = [
  [S.white, S.white, S.black, S.black],
  [S.white, S.white, S.black, S.black],
  [S.black, S.black, S.white, S.white],
  [S.black, S.black, S.white, S.white],
  [S.white, S.white, S.black, S.black],
  [S.white, S.white, S.black, S.black],
  [S.black, S.black, S.white, S.white],
  [S.black, S.black, S.white, S.white],
] as const

// Figma 94:2477: colors across the visible cable, from left to right.
export const fullFalsePattern = [
  [F.Brown, F.red, F.white, F.skyBlue],
  [F.red, F.red, F.skyBlue, F.blue],
  [F.white, F.darkRed, F.black, F.ocher],
  [F.blue, F.grey, F.blackBrown, F.grey],
  [F.skyBlue, F.black, F.white, F.darkRed],
  [F.grey, F.skyBlue, F.darkRed, F.red],
  [F.ocher, F.blue, F.red, F.Brown],
] as const

export interface ProjectPlacement {
  id: string
  startColumn: number
  startRow: number
  columns: number
  rows: number
}

// Keep the existing 19-column, 52-row layout and full & false's one-stitch shift.
export const projectPlacements: ProjectPlacement[] = [
  { id: 'full-false', startColumn: 3, startRow: 2, columns: 4, rows: 7 },
  { id: 'soft-copy-deep-copy', startColumn: 12, startRow: 6, columns: 4, rows: 8 },
  { id: 'hangsha', startColumn: 2, startRow: 13, columns: 5, rows: 8 },
  { id: 'hourglass', startColumn: 2, startRow: 26, columns: 5, rows: 7 },
  { id: 'adreboa', startColumn: 12, startRow: 18, columns: 5, rows: 14 },
  { id: 'la-tourette', startColumn: 2, startRow: 38, columns: 15, rows: 12 },
]

type ProjectStitchColor = string | readonly [left: string, right: string]
export type ProjectColorGrids = Record<string, readonly (readonly ProjectStitchColor[])[]>

export const figmaProjectColorGrids: ProjectColorGrids = {
  'full-false': fullFalsePattern,
  'soft-copy-deep-copy': softCopyDeepCopyPattern,
  hangsha: hangshaPattern,
  hourglass: hourglassPattern,
  adreboa: adreboaPattern,
  'la-tourette': laTourettePattern,
}

export function createProjectPattern(colors: ProjectColorGrids = {}): KnitPatternData {
  const colorGrids = { ...figmaProjectColorGrids, ...colors }
  const fullFalse = projectPlacements[0]!

  return {
    castOn: 19,
    rows: Array.from({ length: 52 }, (_, rowIndex) => ({
      stitches: Array.from({ length: 19 }, (_, columnIndex) => {
        const project = projectPlacements.find((placement) =>
          rowIndex >= placement.startRow && rowIndex < placement.startRow + placement.rows &&
          columnIndex >= placement.startColumn && columnIndex < placement.startColumn + placement.columns,
        )
        const cell = project
          ? colorGrids[project.id]?.[rowIndex - project.startRow]?.[columnIndex - project.startColumn]
          : undefined
        const color = typeof cell === 'string' ? cell : cell?.[0]

        return {
          kind: columnIndex % 2 === 0 ? 'knit' as const : 'purl' as const,
          color: color ?? (columnIndex === 0 || columnIndex === 18 ? homePalette.grey : homePalette.darkGrey),
          ...(cell && typeof cell !== 'string' ? { leftColor: cell[0], rightColor: cell[1] } : {}),
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
      color: colorGrids[fullFalse.id]?.map((row) =>
        row.map((cell) => typeof cell === 'string' ? cell : cell[0]),
      ),
    }],
  }
}
