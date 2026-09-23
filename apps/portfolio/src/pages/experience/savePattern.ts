import type { KnitPatternData } from '@knit-ui/core'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Reuse the library's rendered stitch geometry, independently of scroll visibility. */
export async function savePatternImage(pattern: KnitPatternData, stitch: SVGSVGElement) {
  const size = 16
  const padding = 24
  const viewBox = stitch.viewBox.baseVal
  const stitchWidth = size * viewBox.width / viewBox.height
  const width = Math.ceil((pattern.castOn - 1) * size + stitchWidth + padding * 2)
  const height = pattern.rows.length * size + padding * 2
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  const symbol = document.createElementNS(SVG_NS, 'symbol')
  symbol.id = 'stitch'
  symbol.setAttribute('viewBox', stitch.getAttribute('viewBox')!)
  symbol.setAttribute('overflow', 'visible')
  stitch.querySelectorAll('path').forEach((path) => {
    const clone = path.cloneNode(true) as SVGPathElement
    clone.removeAttribute('class')
    clone.setAttribute('fill', 'none')
    clone.setAttribute('stroke', 'currentColor')
    clone.setAttribute('stroke-width', getComputedStyle(path).strokeWidth)
    symbol.append(clone)
  })
  const defs = document.createElementNS(SVG_NS, 'defs')
  defs.append(symbol)
  svg.append(defs)

  pattern.rows.forEach((row, rowIndex) => {
    row.stitches.forEach((cell, columnIndex) => {
      const use = document.createElementNS(SVG_NS, 'use')
      use.setAttribute('href', '#stitch')
      use.setAttribute('x', String(padding + columnIndex * size))
      use.setAttribute('y', String(padding + rowIndex * size))
      use.setAttribute('width', String(stitchWidth))
      use.setAttribute('height', String(size))
      use.setAttribute('color', cell.color ?? '#ffffff')
      svg.append(use)
    })
  })

  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], {
    type: 'image/svg+xml;charset=utf-8',
  }))
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('이미지를 저장할 수 없습니다.')
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--page-background').trim()
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('PNG 변환에 실패했습니다.')), 'image/png')
    })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `knit-pattern-${pattern.castOn}x${pattern.rows.length}.png`
    document.body.append(link)
    link.click()
    link.remove()
    // Allow the browser to start the download before releasing its URL.
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  } finally {
    URL.revokeObjectURL(url)
  }
}
