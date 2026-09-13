import './App.css'
import { useState, useEffect } from 'react'
import { useAuth } from './store/AuthContext'
import type { Page } from './types'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import Dashboard from './pages/Dashboard'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import HabitsPage from './pages/HabitsPage'
import MedicationsPage from './pages/MedicationsPage'
import WaterPage from './pages/WaterPage'
import SettingsPage from './pages/SettingsPage'
import PlannerPage from './pages/PlannerPage'
import HealthPage from './pages/HealthPage'
import MorePage from './pages/MorePage'
import FitnessPage from './pages/FitnessPage'
import NutritionPage from './pages/NutritionPage'
import LibraryPage from './pages/LibraryPage'

function LoadingScreen() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-primary-700 text-white">
      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 text-3xl font-bold">L</div>
      <p className="text-lg font-medium">LifeOS</p>
      <p className="text-sm opacity-80 mt-1">در حال بارگذاری...</p>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<Page>('home')
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setPage('onboarding')
    } else if (user) {
      setPage('home')
    }
  }, [user])

  if (loading) return <LoadingScreen />

  if (!user) {
    if (page === 'signup') {
      return <SignupPage onSwitch={() => setPage('login')} />
    }
    return <LoginPage onSwitch={() => setPage('signup')} />
  }

  if (!user.onboardingCompleted || page === 'onboarding') {
    return <OnboardingPage onComplete={() => setPage('home')} />
  }

  const renderPage = () => {
    switch (page) {
      case 'home':
      case 'today':
        return <Dashboard onNavigate={setPage} />
      case 'calendar':
        return <PlannerPage onNavigate={setPage} />
      case 'habits':
        return <HabitsPage />
      case 'medications':
        return <MedicationsPage />
      case 'water':
        return <WaterPage />
      case 'health':
        return <HealthPage onNavigate={setPage} />
      case 'settings':
      case 'profile':
        return <SettingsPage onNavigate={setPage} />
      case 'more':
        return <MorePage onNavigate={setPage} />
      case 'fitness':
        return <FitnessPage />
      case 'nutrition':
        return <NutritionPage />
      case 'library':
        return <LibraryPage />
      default:
        return <Dashboard onNavigate={setPage} />
    }
  }

  return (
    <div className="min-h-full flex bg-zinc-50 dark:bg-zinc-900">
      {isDesktop && (
        <Sidebar current={page} onNavigate={setPage} />
      )}
      <main className={`flex-1 flex flex-col min-h-full ${isDesktop ? 'mr-64' : 'pb-20'}`}>
        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
        {!isDesktop && (
          <BottomNav current={page} onNavigate={setPage} />
        )}
      </main>
    </div>
  )
}
