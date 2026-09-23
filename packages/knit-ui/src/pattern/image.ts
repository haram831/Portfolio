export type ImageColorGridSource = string | Blob | HTMLImageElement

export interface ImageColorGridOptions {
  /** Sample a smaller image for interactive previews. Omit to retain full-resolution sampling. */
  maxSampleDimension?: number
}

const dominantColorClusterDistance = 32

interface ColorCluster {
  blueTotal: number
  greenTotal: number
  pixelCount: number
  redTotal: number
}

/**
 * Returns dominant-cluster #RRGGBB colors for an image divided into a row-major grid.
 */
export async function extractImageColorGrid(
  source: ImageColorGridSource,
  columns: number,
  rows: number,
  options: ImageColorGridOptions = {},
): Promise<string[][]> {
  validateGridSize(columns, rows)
  const maximum = options.maxSampleDimension
  if (maximum !== undefined && (!Number.isInteger(maximum) || maximum < 1)) {
    throw new Error('maxSampleDimension must be a positive integer.')
  }

  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    throw new Error('Unable to create a Canvas 2D context.')
  }

  const naturalWidth = image.naturalWidth
  const naturalHeight = image.naturalHeight

  if (naturalWidth < 1 || naturalHeight < 1) {
    throw new Error('Image must have a non-zero natural width and height.')
  }

  const scale = maximum === undefined ? 1 : Math.min(1, maximum / Math.max(naturalWidth, naturalHeight))
  const width = scale === 1 ? naturalWidth : Math.max(columns, Math.round(naturalWidth * scale))
  const height = scale === 1 ? naturalHeight : Math.max(rows, Math.round(naturalHeight * scale))

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  let pixels: ImageData

  try {
    pixels = context.getImageData(0, 0, width, height)
  } catch {
    throw new Error(
      'Unable to read image pixels. The image may not allow cross-origin Canvas access.',
    )
  }

  return getDominantColorGrid(pixels.data, width, height, columns, rows)
}

function validateGridSize(columns: number, rows: number) {
  if (!Number.isInteger(columns) || columns < 1) {
    throw new Error('columns must be a positive integer.')
  }

  if (!Number.isInteger(rows) || rows < 1) {
    throw new Error('rows must be a positive integer.')
  }
}

async function loadImage(source: ImageColorGridSource): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    await waitForImage(source)
    return source
  }

  const image = new Image()
  image.crossOrigin = 'anonymous'

  if (typeof source === 'string') {
    image.src = source
    await waitForImage(image)
    return image
  }

  const objectUrl = URL.createObjectURL(source)

  try {
    image.src = objectUrl
    await waitForImage(image)
    return image
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete) {
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      return Promise.resolve()
    }

    return Promise.reject(new Error('Unable to load image.'))
  }

  return new Promise((resolve, reject) => {
    image.addEventListener('load', () => resolve(), { once: true })
    image.addEventListener(
      'error',
      () => reject(new Error('Unable to load image.')),
      { once: true },
    )
  })
}

function getDominantColorGrid(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  columns: number,
  rows: number,
): string[][] {
  const cellCount = columns * rows
  const clustersByCell = Array.from(
    { length: cellCount },
    (): ColorCluster[] => [],
  )
  const distanceSquared = dominantColorClusterDistance ** 2

  for (let y = 0; y < height; y += 1) {
    const row = Math.min(rows - 1, Math.floor((y * rows) / height))

    for (let x = 0; x < width; x += 1) {
      const pixelOffset = (y * width + x) * 4

      if (pixels[pixelOffset + 3] === 0) {
        continue
      }

      const column = Math.min(columns - 1, Math.floor((x * columns) / width))
      const cellIndex = row * columns + column
      const red = pixels[pixelOffset]
      const green = pixels[pixelOffset + 1]
      const blue = pixels[pixelOffset + 2]
      const clusters = clustersByCell[cellIndex]
      const cluster = clusters.find((candidate) =>
        isWithinColorDistance(candidate, red, green, blue, distanceSquared),
      )

      if (cluster) {
        cluster.redTotal += red
        cluster.greenTotal += green
        cluster.blueTotal += blue
        cluster.pixelCount += 1
      } else {
        clusters.push({
          blueTotal: blue,
          greenTotal: green,
          pixelCount: 1,
          redTotal: red,
        })
      }
    }
  }

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => {
      const cellIndex = row * columns + column
      const dominantCluster = clustersByCell[cellIndex].reduce<
        ColorCluster | undefined
      >(
        (largestCluster, cluster) =>
          !largestCluster || cluster.pixelCount > largestCluster.pixelCount
            ? cluster
            : largestCluster,
        undefined,
      )

      if (!dominantCluster) {
        return '#FFFFFF'
      }

      return toHexColor(
        Math.round(dominantCluster.redTotal / dominantCluster.pixelCount),
        Math.round(dominantCluster.greenTotal / dominantCluster.pixelCount),
        Math.round(dominantCluster.blueTotal / dominantCluster.pixelCount),
      )
    }),
  )
}

function isWithinColorDistance(
  cluster: ColorCluster,
  red: number,
  green: number,
  blue: number,
  distanceSquared: number,
): boolean {
  const redDifference = red - cluster.redTotal / cluster.pixelCount
  const greenDifference = green - cluster.greenTotal / cluster.pixelCount
  const blueDifference = blue - cluster.blueTotal / cluster.pixelCount

  return (
    redDifference ** 2 + greenDifference ** 2 + blueDifference ** 2 <=
    distanceSquared
  )
}

function toHexColor(red: number, green: number, blue: number): string {
  return `#${toHexPart(red)}${toHexPart(green)}${toHexPart(blue)}`
}

function toHexPart(value: number): string {
  return value.toString(16).padStart(2, '0').toUpperCase()
}
