import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ApiKeyBanner from './components/ApiKeyBanner'
import Onboarding from './components/Onboarding'
import Dashboard from './pages/Dashboard'
import Subscriptions from './pages/Subscriptions'
import Analyzer from './pages/Analyzer'
import Chat from './pages/Chat'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import { useSubscriptions } from './hooks/useSubscriptions'
import { ToastProvider } from './contexts/ToastContext'

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const checkApiKey = () => {
      const key = localStorage.getItem('subtrack_api_key') || import.meta.env.VITE_ANTHROPIC_API_KEY
      setHasApiKey(!!key)
    }

    const checkOnboarding = () => {
      const completed = localStorage.getItem('subtrack_onboarding_completed')
      const subscriptions = localStorage.getItem('subtrack_subscriptions')
      if (!completed && !subscriptions) {
        setShowOnboarding(true)
      }
    }

    checkApiKey()
    checkOnboarding()
    window.addEventListener('storage', checkApiKey)
    return () => window.removeEventListener('storage', checkApiKey)
  }, [])
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    flagSubscription,
    getMonthlyTotal,
    getYearlyTotal,
    getFlaggedCount,
    getByCategory,
  } = useSubscriptions()

  const clearAll = () => {
    if (window.confirm('Clear all subscription data? This cannot be undone.')) {
      localStorage.removeItem('subtrack_subscriptions')
      window.location.reload()
    }
  }

  const sharedProps = { subscriptions, addSubscription, updateSubscription, deleteSubscription, flagSubscription }

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />
    )
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar flaggedCount={getFlaggedCount()} />
        <main className="ml-60 flex-1 overflow-y-auto min-h-screen">
          {!hasApiKey && <ApiKeyBanner />}
          <Routes>
            <Route path="/" element={
              <Dashboard
                {...sharedProps}
                getMonthlyTotal={getMonthlyTotal}
                getYearlyTotal={getYearlyTotal}
                getFlaggedCount={getFlaggedCount}
                getByCategory={getByCategory}
              />
            } />
            <Route path="/subscriptions" element={<Subscriptions {...sharedProps} />} />
            <Route path="/analyze" element={<Analyzer addSubscription={addSubscription} />} />
            <Route path="/chat" element={<Chat subscriptions={subscriptions} />} />
            <Route path="/alerts" element={<Alerts {...sharedProps} />} />
            <Route path="/settings" element={<Settings subscriptions={subscriptions} onClearAll={clearAll} />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  )
}
