import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Experience } from './Experience'
import { createImagePattern, createTextPattern, textCharacters } from './experiencePattern'
import { savePatternImage } from './savePattern'

vi.mock('./experiencePattern', async (importOriginal) => ({
  ...await importOriginal<typeof import('./experiencePattern')>(),
  createTextPattern: vi.fn(),
  createImagePattern: vi.fn(),
}))
vi.mock('./savePattern', () => ({ savePatternImage: vi.fn() }))

const pattern = { castOn: 1, rows: [{ stitches: [{ kind: 'knit' as const, color: '#ffffff' }] }] }

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.mocked(createTextPattern).mockResolvedValue(pattern)
  vi.mocked(createImagePattern).mockResolvedValue(pattern)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

async function finishGeneration() {
  await act(() => vi.advanceTimersByTimeAsync(100))
}

function submit() {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
  fireEvent.click(screen.getByRole('button', { name: '텍스트 패턴 생성' }))
}

describe('Experience', () => {
  it('moves from instructions through loading to scroll reveal and saves before scrolling', async () => {
    render(<Experience />)
    const save = screen.getByRole('button', { name: '패턴 이미지 저장' })
    expect(save).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('upload your image or text')
    submit()
    expect(screen.getByRole('status')).toHaveTextContent('making pattern...')
    expect(screen.getByRole('textbox')).toBeDisabled()
    await finishGeneration()
    expect(screen.getByRole('status')).toHaveTextContent('scroll down')
    expect(screen.getByRole('img', { name: '생성된 패턴: 1코, 1단' })).toBeInTheDocument()
    expect(save).toBeEnabled()
    await act(async () => fireEvent.click(save))
    expect(savePatternImage).toHaveBeenCalledWith(pattern, expect.any(SVGSVGElement))
  })

  it('limits pasted text to 50 visible characters without splitting emoji', () => {
    render(<Experience />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '👩‍👩‍👧‍👦'.repeat(51) } })
    expect(textCharacters(input.value)).toHaveLength(50)
    expect(input.value).toBe('👩‍👩‍👧‍👦'.repeat(50))
  })

  it('uploads a file and permits selecting the same file again', async () => {
    render(<Experience />)
    const input = screen.getByLabelText('패턴으로 만들 이미지 파일')
    const file = new File(['image'], 'pattern.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await finishGeneration()
    expect(createImagePattern).toHaveBeenCalledWith(file)
    expect(input).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent('scroll down')
  })

  it('retains the last successful pattern when a replacement fails', async () => {
    render(<Experience />)
    submit()
    await finishGeneration()
    vi.mocked(createTextPattern).mockRejectedValueOnce(new Error('생성 실패'))
    submit()
    await finishGeneration()
    expect(screen.getByRole('alert')).toHaveTextContent('생성 실패')
    expect(screen.getByRole('button', { name: '패턴 이미지 저장' })).toBeEnabled()
    expect(screen.getByRole('img', { name: '생성된 패턴: 1코, 1단' })).toBeInTheDocument()
  })

  it('does not start canvas work after navigating away', async () => {
    const { unmount } = render(<Experience />)
    submit()
    unmount()
    await finishGeneration()
    expect(createTextPattern).not.toHaveBeenCalled()
  })
})
