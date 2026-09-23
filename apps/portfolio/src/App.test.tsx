import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
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
    expect(knitPattern).toHaveAttribute('data-row-count', '92')
    expect(document.querySelectorAll('.knit-scroll-pattern')).toHaveLength(1)
    expect(scrollPattern.querySelectorAll('.knit-scroll-pattern__needles')).toHaveLength(1)
    expect(scrollPattern.querySelectorAll('.knit-pattern-view__fabric')).toHaveLength(1)
    expect(knitPattern.querySelectorAll('.knit-stitch-unit')).toHaveLength(19 * 92)
    expect(scrollPattern).not.toHaveTextContent(/full & false|La Tourette|Adreboa/)
  })

  it('navigates to the Test page when the linked stitch is clicked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', {
      name: /purl stitch row 59, column 2/,
    }))

    expect(window.location.pathname).toBe('/test')
    expect(screen.getByRole('heading', {
      name: 'Knit UI System',
    })).toBeInTheDocument()
  })
})
