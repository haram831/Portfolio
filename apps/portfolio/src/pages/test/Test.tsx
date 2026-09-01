import { useEffect, useState } from 'react'
import {
  extractImageColorGrid,
  KnitPattern,
  KnitScrollPattern,
  KnitStitchUnit,
} from '@knit-ui/core'
import type {
  KnitPatternData,
  KnitStitchClickDetails,
  KnitStitchPositionTarget,
  StitchKind,
} from '@knit-ui/core'
import { StitchInspectorModal } from './StitchInspectorModal'
import type { SelectedStitch } from './StitchInspectorModal'
import styles from './Test.module.css'

const testPalette = {
  canvas: '#FBF4F0',
  surface: '#ECE6E3',
  primary100: '#ADCCE8',
  primary200: '#B4C9DA',
  primary600: '#1C67B0',
  primary700: '#22609B',
  accentGreen: '#397C43',
  accentRed: '#E23117',
  accentOrange: '#DF591E',
  accentYellow: '#E6BD41',
  accentRust: '#9B301C',
}

const imagePatternColumns = 14
const imagePatternRows = 8

const stockinettePattern: KnitPatternData = {
  ...makePattern(
    [
      makeRowKinds('knit', 8),
      makeRowKinds('purl', 8),
    ],
    1,
    5,
  ),
  palette: {
    colors: [testPalette.primary700],
  },
}

const cablePattern: KnitPatternData = {
  ...makePattern(
    [
      makeRowKinds('purl', 2).concat(
        makeRowKinds('knit', 6),
      ),
    ],
    1,
    10,
  ),
  palette: {
    colors: [testPalette.accentRust],
  },
  cables: [
    {
      row: 1,
      height: 4,
      leftStartStitch: 2,
      leftEndStitch: 4,
      rightStartStitch: 5,
      rightEndStitch: 7,
      count: 2,
      cross: 'left-over-right',
      color: [
        testPalette.accentYellow,
        testPalette.accentGreen,
        testPalette.primary600,
        testPalette.accentRed,
        testPalette.primary700,
        testPalette.primary600,
      ],
    },
  ],
}

const colorworkPattern: KnitPatternData = {
  castOn: 10,
  palette: {
    colors: [
      testPalette.canvas,
      testPalette.surface,
      testPalette.primary100,
      testPalette.primary600,
      testPalette.primary700,
    ],
  },
  rows: Array.from({ length: 10 }, (_, rowIndex) => ({
    stitches: makeColorworkRow(rowIndex),
  })),
}

const clickablePattern: KnitPatternData = {
  castOn: 5,
  palette: {
    colors: [testPalette.primary700, testPalette.accentRed],
  },
  rows: [
    {
      stitches: makeColorRow('knit', [
        testPalette.primary700,
        testPalette.primary700,
        testPalette.primary700,
        testPalette.primary700,
        testPalette.primary700,
      ]),
    },
    {
      stitches: makeColorRow('knit', [
        testPalette.primary700,
        testPalette.primary700,
        testPalette.accentRed,
        testPalette.primary700,
        testPalette.primary700,
      ]),
    },
    {
      stitches: makeColorRow('knit', [
        testPalette.primary700,
        testPalette.primary700,
        testPalette.primary700,
        testPalette.primary700,
        testPalette.primary700,
      ]),
    },
  ],
}

const clickableStitchPositions: KnitStitchPositionTarget[] = [
  { rowIndex: 1, columnIndex: 2 },
]

const scrollCablePattern: KnitPatternData = {
  castOn: 15,
  palette: {
    colors: [
      testPalette.primary700,
      testPalette.primary600,
      testPalette.accentOrange,
    ],
  },
  rows: Array.from({ length: 18 }, (_, rowIndex) => ({
    stitches: makeScrollCableRow(rowIndex),
  })),
  cables: [
    {
      row: 1,
      height: 4,
      leftStartStitch: 3,
      leftEndStitch: 5,
      rightStartStitch: 6,
      rightEndStitch: 8,
      count: 3,
      cross: 'left-over-right',
      color: [
        testPalette.primary100,
        testPalette.primary100,
        testPalette.primary100,
        testPalette.primary600,
        testPalette.primary600,
        testPalette.primary600,
      ],
    },
    {
      row: 3,
      height: 3,
      leftStartStitch: 10,
      leftEndStitch: 11,
      rightStartStitch: 12,
      rightEndStitch: 13,
      count: 3,
      cross: 'right-over-left',
      color: [
        testPalette.accentYellow,
        testPalette.accentYellow,
        testPalette.accentRust,
        testPalette.accentRust,
      ],
    },
  ],
}

const stitchPrinciples: {
  description: string
  kind: StitchKind
  title: string
}[] = [
  {
    description: 'Purl turns the surface back toward texture. It changes density, shadow, and rhythm inside the same repeat.',
    kind: 'purl',
    title: 'purl',
  },
  {
    description: 'Knit builds the front-facing structure. As it repeats, it becomes direction, flow, and the frame of the pattern.',
    kind: 'knit',
    title: 'knit',
  },
  {
    description: 'Mistake is not just an error. It marks where touch enters the system and turns deviation into interaction.',
    kind: 'mistake',
    title: 'mistake',
  },
]

function makeRowKinds(kind: StitchKind, count: number) {
  return Array.from({ length: count }, () => kind)
}

function makeColorRow(kind: StitchKind, colors: string[]) {
  return colors.map((color) => ({ kind, color }))
}

function makeColorworkRow(rowIndex: number) {
  const rowKind: StitchKind = rowIndex % 2 === 0 ? 'knit' : 'purl'
  const colorRows = [
    [
      testPalette.canvas,
      testPalette.surface,
      testPalette.primary100,
      testPalette.primary600,
      testPalette.primary700,
      testPalette.accentRust,
      testPalette.primary700,
      testPalette.primary100,
      testPalette.surface,
      testPalette.canvas,
    ],
    [
      testPalette.accentRust,
      testPalette.primary700,
      testPalette.primary200,
      testPalette.surface,
      testPalette.canvas,
      testPalette.canvas,
      testPalette.surface,
      testPalette.primary100,
      testPalette.primary600,
      testPalette.primary700,
    ],
    [
      testPalette.surface,
      testPalette.primary100,
      testPalette.primary600,
      testPalette.primary700,
      testPalette.primary700,
      testPalette.primary700,
      testPalette.accentRust,
      testPalette.accentGreen,
      testPalette.primary100,
      testPalette.surface,
    ],
  ]

  return makeColorRow(rowKind, colorRows[rowIndex % colorRows.length])
}

function makePattern(
  rows: StitchKind[][],
  r_count: number,
  c_count = 1,
): KnitPatternData {
  const repeatedRows = rows.map((row) => repeatRow(row, r_count))

  return {
    castOn: repeatedRows[0].length,
    rows: Array.from({ length: c_count }, () => repeatedRows)
      .flat()
      .map((row) => ({
        stitches: makeRowFromKinds(row),
      })),
  }
}

function makeRowFromKinds(kinds: StitchKind[]) {
  return kinds.map((kind) => ({ kind }))
}

function makeScrollCableRow(rowIndex: number) {
  const centerColor =
    rowIndex % 2 === 0 ? testPalette.primary600 : testPalette.primary700
  const sideColor =
    rowIndex % 3 === 0 ? testPalette.accentOrange : testPalette.accentRust

  return [
    ...makeColorRow('purl', [
      testPalette.surface,
      testPalette.primary200,
      testPalette.surface,
    ]),
    ...makeColorRow('knit', [
      centerColor,
      centerColor,
      centerColor,
      testPalette.primary700,
      testPalette.primary700,
      testPalette.primary700,
    ]),
    ...makeColorRow('purl', [testPalette.primary200]),
    ...makeColorRow('knit', [
      sideColor,
      sideColor,
      testPalette.accentGreen,
      testPalette.accentGreen,
    ]),
    ...makeColorRow('purl', [testPalette.surface]),
  ]
}

function repeatRow(row: StitchKind[], count: number): StitchKind[] {
  return Array.from({ length: count }, () => row).flat()
}

function getSelectedStitch(details: KnitStitchClickDetails): SelectedStitch {
  return {
    color: details.stitch.color,
    columnIndex: details.columnIndex,
    renderedKind: details.renderedKind,
    rowIndex: details.rowIndex,
    source: details.source,
  }
}

function makeImageColorworkPattern(colors: string[][]): KnitPatternData {
  return {
    castOn: imagePatternColumns,
    rows: colors.map((row) => ({
      stitches: row.map((color) => ({ kind: 'knit', color })),
    })),
  }
}

function Test() {
  const [selectedStitch, setSelectedStitch] = useState<SelectedStitch | null>(
    null,
  )
  const [imageColorGrids, setImageColorGrids] = useState<[
    string[][],
    string[][],
  ] | null>(null)
  const [imagePatternError, setImagePatternError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      extractImageColorGrid(
        '/adreboa.jpg',
        imagePatternColumns,
        imagePatternRows,
      ),
      extractImageColorGrid(
        '/laTourette.png',
        imagePatternColumns,
        imagePatternRows,
      ),
    ])
      .then((colors) => {
        if (!cancelled) {
          setImageColorGrids(colors)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImagePatternError('Unable to extract the adreboa image colors.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className={styles.testPage}>
      <section className={styles.testHero}>
        <div className={styles.testHeroIntro}>
          <p className={styles.eyebrow}>Design portfolio</p>
          <h1>Knit UI System</h1>
        </div>

        <div className={styles.stitchPrinciplesBlock}>
          <h2>Basic Units</h2>
          <div className={styles.stitchPrinciples} aria-label="basic stitch units">
            {stitchPrinciples.map(({ description, kind, title }) => (
              <article className={styles.stitchPrinciple} key={kind}>
                <div className={styles.stitchPrincipleSample}>
                  <KnitStitchUnit
                    aria-label={`${title} stitch unit`}
                    kind={kind}
                    size={96}
                  />
                </div>
                <div className={styles.stitchPrincipleCopy}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testGrid}>
        <article className={styles.sample}>
          <div className={styles.sampleCopy}>
            <h2>Basic rows</h2>
            <p>Alternating knit and purl rows rendered from `KnitPatternData.rows`.</p>
          </div>
          <KnitPattern
            aria-label="basic knit and purl pattern"
            mistakeFrequency={0.18}
            pattern={stockinettePattern}
            stitchSize={40}
          />
        </article>

        <article className={`${styles.sample} ${styles.sampleFeature}`}>
          <div className={styles.sampleCopy}>
            <h2>Cable overlay</h2>
            <p>`KnitPatternData.cables` spans four stitches across three rows.</p>
          </div>
          <KnitPattern
            aria-label="left cable pattern"
            gap={2}
            pattern={cablePattern}
            rowGap={1}
            stitchSize={44}
          />
        </article>

        <article className={styles.sample}>
          <div className={styles.sampleCopy}>
            <h2>Manual colorwork</h2>
            <p>Per-stitch colors override the pattern palette for quick visual checks.</p>
          </div>
          <KnitPattern
            aria-label="manual grayscale colorwork pattern"
            density="compact"
            pattern={colorworkPattern}
            stitchSize={44}
          />
        </article>

        <article className={`${styles.sample} ${styles.imagePatternSample}`}>
          <div className={styles.sampleCopy}>
            <p className={styles.clickInspectorEyebrow}>extractImageColorGrid</p>
            <h2>Adreboa colorwork</h2>
            <p>
              The source image is divided into {imagePatternColumns} columns and{' '}
              {imagePatternRows} rows. Each stitch uses its cell&apos;s average color.
            </p>
          </div>
          <div className={styles.imagePatternPreview}>
            <img alt="Adreboa source" src="/adreboa.jpg" />
            {imageColorGrids ? (
              <KnitPattern
                aria-label="adreboa average-color knit pattern"
                density="compact"
                pattern={makeImageColorworkPattern(imageColorGrids[0])}
                stitchSize={24}
              />
            ) : (
              <p aria-live="polite" className={styles.imagePatternStatus}>
                {imagePatternError ?? 'Loading adreboa image pattern.'}
              </p>
            )}
          </div>
        </article>

        <article className={`${styles.sample} ${styles.imagePatternSample}`}>
          <div className={styles.sampleCopy}>
            <p className={styles.clickInspectorEyebrow}>extractImageColorGrid</p>
            <h2>La Tourette colorwork</h2>
            <p>
              The source image is divided into {imagePatternColumns} columns and{' '}
              {imagePatternRows} rows. Each stitch uses its cell&apos;s average color.
            </p>
          </div>
          <div className={styles.imagePatternPreview}>
            <img alt="La Tourette source" src="/laTourette.png" />
            {imageColorGrids ? (
              <KnitPattern
                aria-label="la tourette average-color knit pattern"
                density="compact"
                pattern={makeImageColorworkPattern(imageColorGrids[1])}
                stitchSize={24}
              />
            ) : (
              <p aria-live="polite" className={styles.imagePatternStatus}>
                {imagePatternError ?? 'Loading la Tourette image pattern.'}
              </p>
            )}
          </div>
        </article>

        <article className={`${styles.sample} ${styles.sampleInteractive}`}>
          <div className={styles.sampleCopy}>
            <p className={styles.clickInspectorEyebrow}>onStitchClick</p>
            <h2>Stitch inspector</h2>
            <p>A highlighted stitch turns pattern data into inspectable UI state.</p>
          </div>
          <KnitPattern
            aria-label="clickable knit pattern"
            interactiveStitchPositions={clickableStitchPositions}
            onStitchClick={(details) =>
              setSelectedStitch(getSelectedStitch(details))
            }
            pattern={clickablePattern}
            stitchSize={44}
          />
          <div className={styles.clickInspectorSummary} aria-live="polite">
            <span>target</span>
            <strong>
              {selectedStitch
                ? `row ${selectedStitch.rowIndex + 1} / column ${selectedStitch.columnIndex + 1}`
                : 'row 2 / column 3'}
            </strong>
          </div>
        </article>
      </section>

      <section className={styles.scrollDemo}>
        <div className={styles.sampleCopy}>
          <h2>Scroll knitting</h2>
          <p>Scroll through the stage to knit and unravel stitch units.</p>
        </div>
        <KnitScrollPattern
          aria-label="scroll knitted cable pattern"
          needle={{ visible: true }}
        >
          <KnitPattern
            aria-label="15 stitch scroll cable pattern"
            gap={2}
            mistakeFrequency={0.06}
            pattern={scrollCablePattern}
            rowGap={1}
            stitchSize={34}
          />
        </KnitScrollPattern>
      </section>

      {selectedStitch ? (
        <StitchInspectorModal
          onClose={() => setSelectedStitch(null)}
          stitch={selectedStitch}
        />
      ) : null}
    </main>
  )
}

export default Test
