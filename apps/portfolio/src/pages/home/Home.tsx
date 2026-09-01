import {
  extractImageColorGrid,
  KnitPattern,
  KnitScrollPattern,
} from '@knit-ui/core'
import { useEffect, useRef, useState } from 'react'
import type {
  KnitPatternData,
  KnitStitchPositionTarget,
  StitchKind,
} from '@knit-ui/core'
import './Home.css'

const homePalette = {
  background: '#101010',
  white: '#E7E7E7',
  grey: '#595959',
  darkGrey: '#383838',
}

const homeHighlightPattern = [
  ',....................,',
  ',....................,',
  ',....................,',
  ',....................,',
  ',.......#.....#......,',
  ',......#......#.#....,',
  ',.....###..#..#.#..#.,',
  ',......#..#.#.#.#.#.#,',
  ',......#..#.#.#.#.#.#,',
  ',......#...#..#.#..#.,',
  ',....................,',
  ',............#.......,',
  ',...........###......,',
  ',##...#...#..#.......,',
  ',#.#.#.#.###.#.......,',
  ',#.#.#.#.#...#.......,',
  ',##..#.#.#...#.......,',
  ',#....#..#...#.......,',
  ',#...................,',
  ',#...................,',
  ',....................,',
  ',....................,',
  ',.........#..##..#..#,',
  ',...........#..#.##.#,',
  ',.........#.#....#.##,',
  ',.........#.#....#.##,',
  ',.........#.#.##.#.##,',
  ',.........#.#..#.#.##,',
  ',.........#.###..#..#,',
  ',....................,',
  ',##..###..##.........,',
  ',#.#.#...#...........,',
  ',#.#.#...#...........,',
  ',#.#.###.##..........,',
  ',#.#.#.....#.........,',
  ',#.#.#.....#.........,',
  ',##..###.###.........,',
  ',....................,',
  ',....................,',
] as const

const homeColumnSpecs = Array.from({ length: 22 }, (_, columnIndex) => ({
  kind: columnIndex % 2 === 0 ? 'knit' : 'purl',
  span: 1,
})) satisfies { kind: StitchKind; span: number }[]

const HOME_PATTERN_COLUMN_COUNT = homeColumnSpecs.reduce(
  (columnCount, column) => columnCount + column.span,
  0,
)
const HOME_TEST_LINK_VISUAL_COLUMN = 1
const HOME_TEST_LINK_ROW_START = 6
const HOME_TEST_LINK_ROW_END = 12
const HOME_STITCH_SIZE = 'clamp(34px, 3.47vw, 50px)'
const HOME_STITCH_OVERLAP = 0
const HOME_PATTERN_GAP = 0
const HOME_PATTERN_ROW_GAP = 0
const HOME_NEEDLE_ANGLE = 15
const HOME_NEEDLE_SPEED = 1
const HOME_NEEDLE_THICKNESS = 18
const HOME_PATTERN_ARIA_LABEL =
  'Figma matched grey and white knit purl portfolio pattern'
const HOME_SCROLL_ARIA_LABEL = 'portfolio knitting stage'
const HOME_STITCH_DENSITY = 'compact'
const HOME_MISTAKE_FREQUENCY = 0.01
const HOME_SCROLL_INDICATOR_FADE_VIEWPORT_RATIO = 0.5
const HOME_PROJECT_PATTERN_GAP_ROWS = 2

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

const homeProjectPatterns: HomeProjectPatternDefinition[] = [
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
    columns: 8,
    rows: 11,
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

const homeNeedleOptions = {
  angle: HOME_NEEDLE_ANGLE,
  color: homePalette.grey,
  highlightColor: homePalette.white,
  speed: HOME_NEEDLE_SPEED,
  thickness: HOME_NEEDLE_THICKNESS,
  visible: true,
}

const homePattern: KnitPatternData = {
  castOn: HOME_PATTERN_COLUMN_COUNT,
  palette: {
    colors: [homePalette.darkGrey, homePalette.grey, homePalette.white],
  },
  rows: homeHighlightPattern.map((_, rowIndex) => ({
    stitches: makeHomePatternRow(rowIndex),
  })),
}

const homeTestLinkPositions = getVisualColumnInteractivePositions(
  HOME_TEST_LINK_VISUAL_COLUMN,
  HOME_TEST_LINK_ROW_START,
  HOME_TEST_LINK_ROW_END,
)

interface HomeProps {
  onNavigateToTest?: () => void
}

function makeHomePatternRow(rowIndex: number) {
  const highlightRow = homeHighlightPattern[rowIndex] ?? ''

  return homeColumnSpecs.map(({ kind, span }, visualColumnIndex) => ({
    color: getUnitColor(highlightRow[visualColumnIndex]),
    kind,
    span,
  }))
}

function getUnitColor(unit: string) {
  switch (unit) {
    case '#':
      return homePalette.white
    case '.':
      return homePalette.darkGrey
    case ',':
      return homePalette.grey
    default:
      return undefined
  }
}

function getVisualColumnInteractivePositions(
  visualColumnIndex: number,
  startRow: number,
  endRow: number,
): KnitStitchPositionTarget[] {
  const columnIndex = getVisualColumnStartIndex(visualColumnIndex)

  return Array.from({ length: endRow - startRow + 1 }, (_, rowOffset) => ({
    columnIndex,
    rowIndex: startRow + rowOffset,
  }))
}

function getVisualColumnStartIndex(visualColumnIndex: number): number {
  return homeColumnSpecs
    .slice(0, visualColumnIndex)
    .reduce(
      (columnIndex, columnSpec) => columnIndex + columnSpec.span,
      0,
    )
}

function appendProjectColorGrids(
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

function Home({ onNavigateToTest }: HomeProps) {
  const enableTestNavigation = Boolean(onNavigateToTest)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1)
  const [projectColorGrids, setProjectColorGrids] = useState<
    HomeProjectColorGrid[]
  >([])

  useEffect(() => {
    let frame = 0

    const updateScrollIndicatorOpacity = () => {
      frame = 0
      const scrollIndicator = scrollIndicatorRef.current

      if (!scrollIndicator) {
        return
      }

      const fadeDistance = Math.max(
        1,
        window.innerHeight * HOME_SCROLL_INDICATOR_FADE_VIEWPORT_RATIO,
      )
      const scrollIndicatorRect = scrollIndicator.getBoundingClientRect()
      const progress = clampNumber(scrollIndicatorRect.top / fadeDistance, 0, 1)

      setScrollIndicatorOpacity(progress**2)
    }

    const requestScrollIndicatorUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateScrollIndicatorOpacity)
      }
    }

    requestScrollIndicatorUpdate()
    window.addEventListener('scroll', requestScrollIndicatorUpdate, {
      passive: true,
    })
    window.addEventListener('resize', requestScrollIndicatorUpdate)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestScrollIndicatorUpdate)
      window.removeEventListener('resize', requestScrollIndicatorUpdate)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void Promise.allSettled(
      homeProjectPatterns.map(async (project) => ({
        colors: await extractImageColorGrid(
          project.source,
          project.columns,
          project.rows,
        ),
        project,
      })),
    ).then((results) => {
      if (cancelled) {
        return
      }

      const loadedProjectColorGrids: HomeProjectColorGrid[] = results.flatMap(
        (result) =>
          result.status === 'fulfilled' ? [result.value] : [],
      )
      setProjectColorGrids(loadedProjectColorGrids)
    })

    return () => {
      cancelled = true
    }
  }, [])

  function handleHomeStitchClick() {
    onNavigateToTest?.()
  }

  const renderedHomePattern = appendProjectColorGrids(
    homePattern,
    projectColorGrids,
  )

  return (
    <main className="home-page">
      <KnitScrollPattern
        aria-label={HOME_SCROLL_ARIA_LABEL}
        className="home-knit-scroll"
        needle={homeNeedleOptions}
      >
        <KnitPattern
          aria-label={HOME_PATTERN_ARIA_LABEL}
          density={HOME_STITCH_DENSITY}
          mistakeFrequency={HOME_MISTAKE_FREQUENCY}
          gap={HOME_PATTERN_GAP}
          interactiveStitchPositions={
            enableTestNavigation ? homeTestLinkPositions : undefined
          }
          onStitchClick={
            enableTestNavigation ? handleHomeStitchClick : undefined
          }
          pattern={renderedHomePattern}
          rowAlign="start"
          rowGap={HOME_PATTERN_ROW_GAP}
          stitchOverlap={HOME_STITCH_OVERLAP}
          stitchSize={HOME_STITCH_SIZE}
        />
      </KnitScrollPattern>
      <div
        className="home-scroll-indicator"
        ref={scrollIndicatorRef}
        style={{ opacity: scrollIndicatorOpacity }}
      >
        Scroll down
      </div>
    </main>
  )
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export default Home
