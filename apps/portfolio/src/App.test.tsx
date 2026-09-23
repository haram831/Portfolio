import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { experienceLinkPositions, homeExperiencePattern } from './pages/home/homeExperiencePattern'

function getExperienceButton() {
  const { rowIndex, columnIndex } = experienceLinkPositions[0]!
  return screen.getByRole('button', {
    name: new RegExp(`stitch row ${rowIndex + 1}, column ${columnIndex + 1}$`),
  })
}

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.history.replaceState(null, '', '/')
})

describe('App', () => {
  it('renders the Home knitting portfolio stage', () => {
    render(<App />)

    const scrollPattern = screen.getByLabelText('portfolio knitting stage')
    const knitPattern = screen.getByLabelText(
      'Continuous design portfolio and project knit pattern',
    )

    expect(screen.queryByRole('heading', {
      name: 'Design Portfolio',
    })).not.toBeInTheDocument()
    expect(scrollPattern).toHaveClass('knit-scroll-pattern')
    const rowCount = 92 + homeExperiencePattern.rows.length
    expect(knitPattern).toHaveAttribute('data-row-count', String(rowCount))
    expect(document.querySelectorAll('.knit-scroll-pattern')).toHaveLength(1)
    expect(scrollPattern.querySelectorAll('.knit-scroll-pattern__needles')).toHaveLength(1)
    expect(scrollPattern.querySelectorAll('.knit-pattern-view__fabric')).toHaveLength(1)
    expect(knitPattern.querySelectorAll('.knit-stitch-unit')).toHaveLength(19 * rowCount)
    expect(scrollPattern).not.toHaveTextContent(/full & false|La Tourette|Adreboa/)
  })

  it('navigates to the Test page when the linked stitch is clicked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', {
      name: new RegExp(`purl stitch row ${59 + homeExperiencePattern.rows.length}, column 2$`),
    }))

    expect(window.location.pathname).toBe('/test')
    expect(screen.getByRole('heading', {
      name: 'Knit UI System',
    })).toBeInTheDocument()
  })

  it('opens the pattern experience when the invitation is clicked', () => {
    render(<App />)
    fireEvent.click(getExperienceButton())

    expect(window.location.pathname).toBe('/experience')
    expect(screen.getByRole('status')).toHaveTextContent('upload your image or text')
    expect(screen.queryByLabelText('portfolio knitting stage')).not.toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it.each(['Enter', ' '])('opens the experience page with the %s key', (key) => {
    render(<App />)
    fireEvent.keyDown(getExperienceButton(), { key })
    expect(window.location.pathname).toBe('/experience')
    expect(screen.getByRole('textbox', { name: '패턴으로 만들 텍스트' })).toBeInTheDocument()
  })

  it('supports direct experience URLs and history navigation back to home', () => {
    window.history.replaceState(null, '', '/experience')
    render(<App />)
    expect(screen.getByRole('textbox', { name: '패턴으로 만들 텍스트' })).toBeInTheDocument()

    window.history.replaceState(null, '', '/')
    fireEvent.popState(window)
    expect(screen.getByLabelText('portfolio knitting stage')).toBeInTheDocument()
  })
})
