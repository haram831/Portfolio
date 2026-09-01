import { afterEach, describe, expect, it, vi } from 'vitest'
import { extractImageColorGrid } from './image'

const originalGetContext = HTMLCanvasElement.prototype.getContext

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
  vi.restoreAllMocks()
})

describe('extractImageColorGrid', () => {
  it('returns a row-major grid of average colors', async () => {
    mockCanvasPixels(4, 2, [
      255, 0, 0, 255,
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      0, 0, 255, 255,
      255, 255, 255, 255,
      255, 255, 255, 255,
    ])

    await expect(extractImageColorGrid(makeImage(4, 2), 2, 2)).resolves.toEqual([
      ['#FF0000', '#00FF00'],
      ['#0000FF', '#FFFFFF'],
    ])
  })

  it('returns the most common color cluster instead of averaging all colors', async () => {
    mockCanvasPixels(3, 1, [
      255, 0, 0, 255,
      240, 8, 8, 255,
      0, 0, 255, 255,
    ])

    await expect(extractImageColorGrid(makeImage(3, 1), 1, 1)).resolves.toEqual([
      ['#F80404'],
    ])
  })

  it('ignores fully transparent pixels and uses white for an empty cell', async () => {
    mockCanvasPixels(2, 1, [255, 0, 0, 255, 0, 0, 0, 0])

    await expect(extractImageColorGrid(makeImage(2, 1), 2, 1)).resolves.toEqual([
      ['#FF0000', '#FFFFFF'],
    ])
  })

  it('rejects invalid grid dimensions', async () => {
    await expect(extractImageColorGrid(makeImage(1, 1), 0, 1)).rejects.toThrow(
      'columns must be a positive integer.',
    )
    await expect(extractImageColorGrid(makeImage(1, 1), 1, 1.5)).rejects.toThrow(
      'rows must be a positive integer.',
    )
  })

  it('reports Canvas pixel-read failures', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      getImageData: vi.fn(() => {
        throw new Error('SecurityError')
      }),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext

    await expect(extractImageColorGrid(makeImage(1, 1), 1, 1)).rejects.toThrow(
      'Unable to read image pixels.',
    )
  })
})

function makeImage(width: number, height: number): HTMLImageElement {
  const image = document.createElement('img')

  Object.defineProperties(image, {
    complete: { configurable: true, value: true },
    naturalHeight: { configurable: true, value: height },
    naturalWidth: { configurable: true, value: width },
  })

  return image
}

function mockCanvasPixels(width: number, height: number, data: number[]) {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(data),
      height,
      width,
    })),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext
}
