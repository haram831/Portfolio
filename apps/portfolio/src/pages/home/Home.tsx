import { KnitPattern, KnitScrollPattern } from '@knit-ui/core'
import type { KnitStitchPositionTarget } from '@knit-ui/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { homePalette } from './homeFigmaPattern'
import { connectHomeProjectPattern } from './homeContinuousPattern'
import { createProjectPattern, loadProjectColorGrids } from './ProjectPattern'
import './Home.css'

interface HomeProps {
  onNavigateToTest?: () => void
}

function Home({ onNavigateToTest }: HomeProps) {
  const enableTestNavigation = Boolean(onNavigateToTest)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1)
  const [stitchSize, setStitchSize] = useState(getHomeStitchSize)
  const [projectPattern, setProjectPattern] = useState(createProjectPattern)
  const pattern = useMemo(() => connectHomeProjectPattern(projectPattern), [projectPattern])
  const homeTestLinkPositions: KnitStitchPositionTarget[] = Array.from(
    { length: 7 },
    (_, index) => ({ columnIndex: 1, rowIndex: projectPattern.rows.length + index + 6 }),
  )

  useEffect(() => {
    let active = true

    void loadProjectColorGrids().then((colors) => {
      if (active) setProjectPattern(createProjectPattern(colors))
    })

    return () => { active = false }
  }, [])

  useEffect(() => {
    let frame = 0

    const updateScrollIndicatorOpacity = () => {
      frame = 0
      const scrollIndicator = scrollIndicatorRef.current

      if (!scrollIndicator) {
        return
      }

      const fadeDistance = Math.max(1, window.innerHeight * 0.5)
      const scrollIndicatorRect = scrollIndicator.getBoundingClientRect()
      const progress = clampNumber(scrollIndicatorRect.top / fadeDistance, 0, 1)

      setScrollIndicatorOpacity(progress ** 2)
      setStitchSize(getHomeStitchSize())
    }

    const requestScrollIndicatorUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateScrollIndicatorOpacity)
      }
    }

    requestScrollIndicatorUpdate()
    window.addEventListener('scroll', requestScrollIndicatorUpdate, {
      passive: true,
    })
    window.addEventListener('resize', requestScrollIndicatorUpdate)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestScrollIndicatorUpdate)
      window.removeEventListener('resize', requestScrollIndicatorUpdate)
    }
  }, [])

  return (
    <main
      className="home-page"
      style={{ '--home-stitch-size': `${stitchSize}px` } as CSSProperties}
    >
      <KnitScrollPattern
        aria-label="portfolio knitting stage"
        className="home-knit-scroll"
        needle={{
          angle: 13.627,
          color: homePalette.white,
          highlightColor: homePalette.white,
          speed: 1,
          thickness: stitchSize * 0.48,
          visible: true,
        }}
      >
        <KnitPattern
          aria-label="Continuous design portfolio and project knit pattern"
          density="compact"
          gap={0}
          interactiveStitchPositions={
            enableTestNavigation ? homeTestLinkPositions : undefined
          }
          onStitchClick={enableTestNavigation ? onNavigateToTest : undefined}
          pattern={pattern}
          rowAlign="start"
          rowGap={0}
          stitchOverlap={0}
          stitchSize={stitchSize}
        />
      </KnitScrollPattern>
      <div
        className="home-scroll-indicator"
        ref={scrollIndicatorRef}
        style={{ opacity: scrollIndicatorOpacity }}
      >
        Scroll down
      </div>
    </main>
  )
}

function getHomeStitchSize(): number {
  // One shared stitch size for the entire 19-column fabric, including side margins.
  return typeof window === 'undefined' ? 50 : Math.min(50, window.innerWidth / 32)
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export default Home
