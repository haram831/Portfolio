import { useEffect, useState } from 'react'
import Home from './pages/home/Home'
import Test from './pages/test/Test'
import { Experience } from './pages/experience/Experience'

type AppRoute = 'home' | 'test' | 'experience'

function getCurrentRoute(): AppRoute {
  if (window.location.pathname === '/experience') return 'experience'
  return window.location.pathname === '/test' ? 'test' : 'home'
}

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute())

  useEffect(() => {
    function handlePopState() {
      setRoute(getCurrentRoute())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function navigateToTest() {
    if (window.location.pathname !== '/test') {
      window.history.pushState(null, '', '/test')
    }

    setRoute('test')
  }

  function navigateToExperience() {
    if (window.location.pathname !== '/experience') {
      window.history.pushState(null, '', '/experience')
    }

    setRoute('experience')
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  if (route === 'test') return <Test />
  if (route === 'experience') return <Experience />

  return <Home onNavigateToTest={navigateToTest} onNavigateToExperience={navigateToExperience} />
}

export default App
