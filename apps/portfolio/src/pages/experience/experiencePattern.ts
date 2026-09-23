import { extractImageColorGrid } from '@knit-ui/core'
import type { KnitPatternData } from '@knit-ui/core'

export const MAX_TEXT_LENGTH = 50
export const MAX_COLUMNS = 80
export const MAX_ROWS = 100
export const MAX_FILE_BYTES = 10 * 1024 * 1024

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export function textCharacters(text: string): string[] {
  return Array.from(segmenter.segment(text), ({ segment }) => segment)
}

export function getPatternDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('이미지 크기를 확인할 수 없습니다.')
  }

  // Roughly one stitch per four source pixels; never exceed either limit.
  const scale = Math.min(1 / 4, MAX_COLUMNS / width, MAX_ROWS / height)
  return {
    columns: Math.max(1, Math.round(width * scale)),
    rows: Math.max(1, Math.round(height * scale)),
  }
}

export function colorGridToPattern(colors: string[][]): KnitPatternData {
  return {
    castOn: colors[0].length,
    rows: colors.map((row) => ({
      stitches: row.map((color) => ({ kind: 'knit', color })),
    })),
  }
}

export async function createImagePattern(file: File): Promise<KnitPatternData> {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) {
    throw new Error('PNG, JPG, WebP, GIF 또는 AVIF 이미지를 선택해주세요.')
  }
  if (file.size > MAX_FILE_BYTES) throw new Error('이미지는 10MB 이하로 업로드해주세요.')

  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    try {
      await image.decode()
    } catch {
      throw new Error('이미지를 읽을 수 없습니다. 다른 파일을 선택해주세요.')
    }
    const { columns, rows } = getPatternDimensions(image.naturalWidth, image.naturalHeight)
    return colorGridToPattern(await extractImageColorGrid(image, columns, rows, {
      maxSampleDimension: 384,
    }))
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function createTextPattern(text: string): Promise<KnitPatternData> {
  const characters = textCharacters(text.trim())
  if (!characters.length) throw new Error('패턴으로 만들 텍스트를 입력해주세요.')
  if (characters.length > MAX_TEXT_LENGTH) throw new Error('텍스트는 최대 50자까지 입력할 수 있습니다.')

  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('이 브라우저에서는 패턴을 생성할 수 없습니다.')

  const font = '600 48px system-ui, sans-serif'
  context.font = font
  const lines: string[] = []
  let line = ''
  for (const character of characters) {
    if (line && context.measureText(line + character).width > 352) {
      lines.push(line)
      line = ''
    }
    line += character
  }
  if (line) lines.push(line)
  canvas.width = Math.ceil(Math.max(...lines.map((value) => context.measureText(value).width))) + 32
  canvas.height = lines.length * 64 + 32
  context.fillStyle = '#59534e'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.font = font
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#ffffff'
  lines.forEach((value, index) => context.fillText(value, canvas.width / 2, 48 + index * 64))

  const { columns, rows } = getPatternDimensions(canvas.width, canvas.height)
  const sample = document.createElement('canvas')
  sample.width = columns
  sample.height = rows
  const sampleContext = sample.getContext('2d', { willReadFrequently: true })
  if (!sampleContext) throw new Error('이 브라우저에서는 패턴을 생성할 수 없습니다.')
  sampleContext.drawImage(canvas, 0, 0, columns, rows)
  const { data } = sampleContext.getImageData(0, 0, columns, rows)
  return colorGridToPattern(Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) =>
      data[(row * columns + column) * 4] > 160 ? '#ffffff' : '#59534e',
    ),
  ))
}
