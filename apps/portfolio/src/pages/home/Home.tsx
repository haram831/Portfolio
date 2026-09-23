import { KnitPattern, KnitPatternGroup, KnitScrollPattern } from '@knit-ui/core'
import type { KnitStitchPositionTarget } from '@knit-ui/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { homePalette } from './homeFigmaPattern'
import { connectHomeProjectPattern } from './homeContinuousPattern'
import { experienceLinkPositions, homeExperiencePattern } from './homeExperiencePattern'
import { createProjectPattern, projectPlacements } from './ProjectPattern'
import { getProjectTitleRevealCount, projectTitles } from './homeProjectTitles'
import './Home.css'

const projectPattern = createProjectPattern()
const pattern = connectHomeProjectPattern(projectPattern)
const projectTitleRevealCounts = projectPlacements.map((project) =>
  getProjectTitleRevealCount(project, pattern.rows.length, homeExperiencePattern.rows.length, pattern.castOn),
)

interface HomeProps {
  onNavigateToTest?: () => void
  onNavigateToExperience?: () => void
}

function Home({ onNavigateToTest, onNavigateToExperience }: HomeProps) {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const [stitchSize, setStitchSize] = useState(getHomeStitchSize)
  const [revealedProjectMask, setRevealedProjectMask] = useState(0)
  const updateProjectTitles = useCallback((visibleStitchCount: number) => {
    // Update React only when a project crosses its completion threshold.
    setRevealedProjectMask(projectTitleRevealCounts.reduce((mask, count, index) =>
      visibleStitchCount >= count ? mask | (1 << index) : mask, 0,
    ))
  }, [])
  const homeTestLinkPositions: KnitStitchPositionTarget[] = Array.from(
    { length: 7 },
    (_, index) => ({
      columnIndex: 1,
      rowIndex: homeExperiencePattern.rows.length + projectPattern.rows.length + index + 6,
    }),
  )
  const interactivePositions = [
    ...(onNavigateToTest ? homeTestLinkPositions : []),
    ...(onNavigateToExperience ? experienceLinkPositions : []),
  ]

  useEffect(() => {
    let frame = 0
    let indicatorTop = 0

    const updateScrollIndicatorOpacity = () => {
      frame = 0
      const scrollIndicator = scrollIndicatorRef.current

      if (!scrollIndicator) {
        return
      }

      const fadeDistance = Math.max(1, window.innerHeight * 0.5)
      const progress = clampNumber((indicatorTop - window.scrollY) / fadeDistance, 0, 1)
      const opacity = String(progress ** 2)
      if (scrollIndicator.style.opacity !== opacity) scrollIndicator.style.opacity = opacity
    }

    const requestScrollIndicatorUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateScrollIndicatorOpacity)
      }
    }

    const resize = () => {
      indicatorTop = (scrollIndicatorRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY
      setStitchSize(getHomeStitchSize())
      requestScrollIndicatorUpdate()
    }

    resize()
    window.addEventListener('scroll', requestScrollIndicatorUpdate, {
      passive: true,
    })
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestScrollIndicatorUpdate)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <main
      className="home-page"
      style={{ '--home-stitch-size': `${stitchSize}px` } as CSSProperties}
    >
      <KnitScrollPattern
        aria-label="portfolio knitting stage"
        className="portfolio-knit-scroll home-knit-scroll"
        onRevealChange={updateProjectTitles}
        needle={{
          angle: 13.627,
          color: homePalette.white,
          highlightColor: homePalette.white,
          speed: 1,
          thickness: stitchSize * 0.48,
          visible: true,
        }}
      >
        <KnitPatternGroup className="home-project-fabric" gap={0}>
          <KnitPattern
            aria-label="Continuous design portfolio and project knit pattern"
            aria-description="Try Your Pattern: 흰색 글자 코를 클릭하면 패턴 체험 페이지로 이동합니다."
            density="compact"
            gap={0}
            interactiveStitchPositions={interactivePositions}
            onStitchClick={({ rowIndex }) => {
              if (rowIndex < homeExperiencePattern.rows.length) {
                onNavigateToExperience?.()
              } else {
                onNavigateToTest?.()
              }
            }}
            pattern={pattern}
            rowAlign="start"
            rowGap={0}
            stitchOverlap={0}
            stitchSize={stitchSize}
            mistakeFrequency={0.01}
          />
          <ul className="home-project-titles" aria-label="프로젝트">
            {projectPlacements.map((project, index) => {
              const title = projectTitles[project.id]!
              const revealed = (revealedProjectMask & (1 << index)) !== 0

              return (
                <li
                  key={project.id}
                  className="home-project-title"
                  data-project={project.id}
                  data-revealed={revealed}
                  aria-hidden={!revealed}
                  style={{
                    '--project-title-left': title.left,
                    '--project-title-top': homeExperiencePattern.rows.length + title.top,
                  } as CSSProperties}
                >
                  {title.text}
                </li>
              )
            })}
          </ul>
        </KnitPatternGroup>
      </KnitScrollPattern>
      <div
        className="portfolio-instruction home-scroll-indicator"
        ref={scrollIndicatorRef}
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
