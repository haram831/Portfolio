import type { KnitPatternData, KnitStitch } from '@knit-ui/core'

export const homePalette = {
  background: '#1b1b1b',
  white: '#e7e7e7',
  grey: '#595959',
  darkGrey: '#383838',
}

// Based on Figma 1:2 → fabric 92:2540: 17 columns, 40 rows, 50px row pitch.
// Each token is one stitch; two digits encode a knit stitch's left/right legs.
// 0 = edge grey, 1 = dark grey, 2 = white. folio precedes port on the home page.
const figmaColorRows = [
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  // folio
  '00 1 11 1 11 1 22 1 11 1 12 1 21 1 11 1 00',
  '00 1 11 1 11 2 11 1 11 1 12 1 11 1 11 1 00',
  '00 1 11 1 11 2 11 1 22 1 12 1 21 1 22 1 00',
  '00 1 11 1 12 2 21 2 11 2 12 1 21 2 11 2 00',
  '00 1 11 1 11 2 11 2 11 2 12 1 21 2 11 2 00',
  '00 1 11 1 11 2 11 2 11 2 12 1 21 2 11 2 00',
  '00 1 11 1 11 2 11 1 22 1 12 1 21 1 22 1 00',
  // Blank row separating folio and port.
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  // port
  '00 1 11 1 11 1 11 1 11 1 11 2 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 12 2 21 1 11 1 00',
  '00 2 22 1 11 2 21 1 22 1 11 2 11 1 11 1 00',
  '00 2 11 2 12 1 12 1 22 2 21 2 11 1 11 1 00',
  '00 2 11 2 12 1 12 1 22 1 11 2 11 1 11 1 00',
  '00 2 22 1 12 1 12 1 22 1 11 2 11 1 11 1 00',
  '00 2 11 1 11 2 21 1 22 1 11 2 11 1 11 1 00',
  '00 2 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 2 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 1 11 1 11 1 22 1 11 2 22 1 12 1 11 2 00',
  '00 1 11 1 11 1 11 1 12 1 11 2 12 2 11 2 00',
  '00 1 11 1 11 1 22 1 21 1 11 1 12 1 21 2 00',
  '00 1 11 1 11 1 22 1 21 1 11 1 12 1 21 2 00',
  '00 1 11 1 11 1 22 1 21 1 22 2 12 1 12 2 00',
  '00 1 11 1 11 1 22 1 21 1 11 2 12 1 12 2 00',
  '00 1 11 1 11 1 22 1 12 2 22 1 12 1 11 2 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 2 22 1 12 2 22 1 11 2 22 1 11 1 11 1 00',
  '00 2 11 2 12 1 11 1 22 1 11 1 11 1 11 1 00',
  '00 2 11 2 12 1 11 1 22 1 11 1 11 1 11 1 00',
  '00 2 11 2 12 2 22 1 22 2 11 1 11 1 11 1 00',
  '00 2 11 2 12 1 11 1 11 1 22 1 11 1 11 1 00',
  '00 2 11 2 12 1 11 1 11 1 22 1 11 1 11 1 00',
  '00 2 22 1 12 2 22 1 22 2 22 1 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
  '00 1 11 1 11 1 11 1 11 1 11 1 11 1 11 1 00',
] as const

const palette = [homePalette.grey, homePalette.darkGrey, homePalette.white]

export const homePattern: KnitPatternData = {
  castOn: 17,
  palette: { colors: palette },
  rows: figmaColorRows.map((row) => ({
    stitches: row.split(' ').map((token): KnitStitch =>
      token.length === 2
        ? {
            kind: 'knit',
            color: palette[Number(token[0])],
            leftColor: palette[Number(token[0])],
            rightColor: palette[Number(token[1])],
          }
        : { kind: 'purl', color: palette[Number(token)] },
    ),
  })),
}
