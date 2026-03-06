import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Subscriptions from './pages/Subscriptions'
import Analyzer from './pages/Analyzer'
import Chat from './pages/Chat'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import { useSubscriptions } from './hooks/useSubscriptions'

export default function App() {
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

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar flaggedCount={getFlaggedCount()} />
      <main className="ml-60 flex-1 overflow-y-auto min-h-screen">
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
  )
}
