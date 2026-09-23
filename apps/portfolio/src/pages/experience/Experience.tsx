import { KnitPattern, KnitScrollPattern } from '@knit-ui/core'
import type { KnitPatternData } from '@knit-ui/core'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { createImagePattern, createTextPattern, MAX_TEXT_LENGTH, textCharacters } from './experiencePattern'
import { savePatternImage } from './savePattern'
import './Experience.css'

export function Experience() {
  const [text, setText] = useState('')
  const [pattern, setPattern] = useState<KnitPatternData | null>(null)
  const [status, setStatus] = useState<'idle' | 'making' | 'ready'>('idle')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const rootRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const requestRef = useRef(0)
  const busyRef = useRef(false)
  const savingRef = useRef(false)
  const busy = status === 'making'
  const instruction = busy ? 'making pattern...' : pattern ? 'scroll down' : 'upload your image or text'
  const stitchSize = Math.min(24, (viewportWidth - 48) / ((pattern?.castOn ?? 1) + 0.34))

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (introRef.current) {
        const progress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.4))
        introRef.current.style.opacity = String((1 - progress) ** 2)
        introRef.current.style.visibility = progress === 1 ? 'hidden' : 'visible'
      }
    }
    const scroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    const resize = () => {
      setViewportWidth(window.innerWidth)
      scroll()
    }
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', resize)
    scroll()
    return () => {
      requestRef.current += 1
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', resize)
    }
  }, [])

  async function generate(create: () => Promise<KnitPatternData>) {
    if (busyRef.current || savingRef.current) return
    busyRef.current = true
    const request = ++requestRef.current
    setError('')
    setStatus('making')
    window.scrollTo({ top: 0, behavior: 'instant' })
    try {
      // Give the loading instruction a paint before canvas sampling starts.
      await new Promise<void>((resolve) => window.setTimeout(resolve, 100))
      if (request !== requestRef.current) return
      const result = await create()
      if (request !== requestRef.current) return
      setPattern(result)
      setStatus('ready')
    } catch (cause) {
      if (request !== requestRef.current) return
      setError(cause instanceof Error ? cause.message : '패턴을 생성하지 못했습니다. 다시 시도해주세요.')
      setStatus(pattern ? 'ready' : 'idle')
    } finally {
      busyRef.current = false
    }
  }

  function submitText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busyRef.current || savingRef.current || !text.trim()) return
    void generate(() => createTextPattern(text))
    setText('')
  }

  async function save() {
    const stitch = rootRef.current?.querySelector<SVGSVGElement>('.knit-pattern-view svg')
    if (!pattern || !stitch || savingRef.current || busyRef.current) return
    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      await savePatternImage(pattern, stitch)
    } catch {
      setError('이미지를 저장하지 못했습니다. 다시 시도해주세요.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <main className={`experience-page${pattern ? ' experience-page--ready' : ''}`} aria-label="패턴 체험 페이지" ref={rootRef}>
      <button
        className="experience-save experience-button"
        type="button"
        disabled={!pattern || busy || saving}
        onClick={() => void save()}
        aria-label="패턴 이미지 저장"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></svg>
        {saving ? 'saving...' : 'save image'}
      </button>

      <KnitScrollPattern
        className="portfolio-knit-scroll experience-knit-scroll"
        aria-label="생성된 뜨개 패턴 스크롤 영역"
        fabricSpeed={0.8}
        needle={{
          visible: true,
          angle: 13.627,
          color: '#805638',
          highlightColor: '#805638',
          thickness: Math.min(50, viewportWidth / 32) * 0.48,
          speed: 1,
        }}
      >
        {pattern && (
          <KnitPattern
            aria-label={`생성된 패턴: ${pattern.castOn}코, ${pattern.rows.length}단`}
            pattern={pattern}
            stitchSize={stitchSize}
            stitchOverlap={0}
            gap={0}
            rowGap={0}
          />
        )}
      </KnitScrollPattern>

      <div className="experience-intro" ref={introRef}>
        <div className="experience-instruction portfolio-instruction" role="status" aria-live="polite">
          <span className="experience-sr-only">{instruction}</span>
          <span aria-hidden="true" className={status === 'ready' ? 'experience-bounce' : undefined}>
            {Array.from(instruction).map((character, index) => (
              <span key={index} style={{ '--letter-index': index } as CSSProperties}>
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </span>
        </div>

        <form className="experience-form" onSubmit={submitText} aria-busy={busy}>
          <div className="experience-input-row">
            <div className="experience-text-field">
              <label className="experience-sr-only" htmlFor="experience-text">패턴으로 만들 텍스트</label>
              <input
                id="experience-text"
                type="text"
                placeholder="type your text"
                value={text}
                onChange={(event) => setText(textCharacters(event.target.value).slice(0, MAX_TEXT_LENGTH).join(''))}
                onKeyDown={(event) => { if (event.nativeEvent.isComposing && event.key === 'Enter') event.preventDefault() }}
                disabled={busy || saving}
                aria-describedby="experience-input-hint experience-count"
                autoComplete="off"
              />
              <button className="experience-button experience-submit" type="submit" disabled={busy || saving || !text.trim()} aria-label="텍스트 패턴 생성">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
              </button>
            </div>
            <button className="experience-button experience-upload" type="button" onClick={() => fileRef.current?.click()} disabled={busy || saving} aria-label="이미지 업로드">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" /></svg>
              <span>upload image</span>
            </button>
            <input
              className="experience-sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              ref={fileRef}
              disabled={busy || saving}
              tabIndex={-1}
              aria-label="패턴으로 만들 이미지 파일"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void generate(() => createImagePattern(file))
              }}
            />
          </div>
          <div className="experience-input-meta">
            <span id="experience-input-hint">up to 50 characters · image up to 10 MB</span>
            <span id="experience-count">{textCharacters(text).length} / {MAX_TEXT_LENGTH}</span>
          </div>
        </form>
      </div>
      {error && <p className="experience-error" role="alert">{error}</p>}
    </main>
  )
}
