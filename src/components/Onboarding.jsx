import { useState } from 'react'
import { Zap, Bell, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Onboarding({ onComplete, onSkip }) {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGetStarted = () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key')
      return
    }

    setLoading(true)
    localStorage.setItem('subtrack_api_key', apiKey.trim())
    localStorage.setItem('subtrack_onboarding_completed', 'true')
    window.dispatchEvent(new Event('storage'))
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  const handleSkip = () => {
    localStorage.setItem('subtrack_onboarding_completed', 'true')
    onSkip()
  }

  const features = [
    {
      icon: Zap,
      title: 'AI Analyzer',
      description: 'Automatically categorize and analyze your subscriptions with AI'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get notified about price changes and upcoming renewals'
    },
    {
      icon: MessageCircle,
      title: 'AI Chat',
      description: 'Ask questions about your spending and get instant insights'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg z-50 flex items-center justify-center overflow-y-auto"
    >
      <div className="w-full max-w-2xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="text-5xl font-bold mb-3">
            <span className="text-gradient">SubTrack AI</span>
          </div>
          <p className="text-xl text-muted font-light">Know Every Charge</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Icon size={24} className="text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface border border-border rounded-lg p-8 max-w-md mx-auto"
        >
          <h2 className="text-xl font-semibold text-text mb-4">Get Started</h2>

          <div className="mb-4">
            <label className="block text-sm text-muted mb-2">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError('')
              }}
              placeholder="sk-ant-..."
              className="w-full bg-bg border border-border rounded px-4 py-2 text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleGetStarted()}
            />
            {error && (
              <p className="text-sm text-danger mt-2">{error}</p>
            )}
            <p className="text-xs text-muted mt-2">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dim underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>

          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="w-full bg-accent text-bg font-semibold py-2 rounded mb-3 hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </button>

          <button
            onClick={handleSkip}
            className="w-full text-muted hover:text-text text-sm transition-colors"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
