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
      'Figma matched grey and white knit purl portfolio pattern',
    )

    expect(screen.queryByRole('heading', {
      name: 'Design Portfolio',
    })).not.toBeInTheDocument()
    expect(scrollPattern).toHaveClass('knit-scroll-pattern')
    expect(knitPattern).toHaveAttribute('data-row-count', '40')
  })

  it('navigates to the Test page when the linked stitch is clicked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', {
      name: /purl stitch row 7, column 2/,
    }))

    expect(window.location.pathname).toBe('/test')
    expect(screen.getByRole('heading', {
      name: 'Knit UI System',
    })).toBeInTheDocument()
  })
})
