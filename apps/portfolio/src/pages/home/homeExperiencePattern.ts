import type { KnitPatternData, KnitStitch, KnitStitchPositionTarget } from '@knit-ui/core'
import { homePalette } from './homeFigmaPattern'

// Seven-row lettering. A knit leg or a purl stitch is one horizontal pixel,
// matching the split-color lettering of the original Design Portfolio fabric.
const letters: Record<string, readonly string[]> = {
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  r: ['00', '00', '111', '100', '100', '100', '100'],
  y: ['000', '000', '101', '101', '011', '001', '110'],
  Y: ['101', '101', '101', '010', '010', '010', '010'],
  o: ['000', '000', '010', '101', '101', '101', '010'],
  u: ['000', '000', '101', '101', '101', '101', '011'],
  P: ['110', '101', '101', '110', '100', '100', '100'],
  a: ['000', '000', '110', '001', '111', '101', '111'],
  t: ['10', '10', '11', '10', '10', '10', '01'],
  e: ['000', '000', '010', '101', '111', '100', '011'],
  n: ['000', '000', '110', '101', '101', '101', '101'],
}

export const experienceLettering = [
  { text: 'Pattern', row: 4, pixel: 2 },
  { text: 'Your', row: 13, pixel: 11 },
  { text: 'Try', row: 22, pixel: 6 },
] as const

const pixels = Array.from({ length: 33 }, () => Array<boolean>(29).fill(false))

for (const word of experienceLettering) {
  let column: number = word.pixel
  for (const character of word.text) {
    const glyph = letters[character]!
    glyph.forEach((line, row) => {
      Array.from(line).forEach((pixel, offset) => {
        pixels[word.row + row]![column + offset] = pixel === '1'
      })
    })
    column += glyph[0]!.length + 1
  }
}

export const experienceLinkPositions: KnitStitchPositionTarget[] = []

export const homeExperiencePattern: KnitPatternData = {
  castOn: 19,
  rows: pixels.map((row, rowIndex) => {
    let pixel = 0
    return {
      stitches: Array.from({ length: 19 }, (_, columnIndex): KnitStitch => {
        const knit = columnIndex % 2 === 0
        const left = row[pixel++]
        const right = knit ? row[pixel++] : left
        const background = columnIndex === 0 || columnIndex === 18
          ? homePalette.grey
          : homePalette.darkGrey
        if (left || right) experienceLinkPositions.push({ rowIndex, columnIndex })

        return {
          kind: knit ? 'knit' : 'purl',
          color: left ? homePalette.white : background,
          ...(knit ? {
            leftColor: left ? homePalette.white : background,
            rightColor: right ? homePalette.white : background,
          } : {}),
        }
      }),
    }
  }),
}
