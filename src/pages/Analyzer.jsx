import { useState } from 'react'
import { Scan, Zap, CheckCircle, AlertTriangle, Plus, Loader, Upload, Play, Shield, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { analyzeTransactions } from '../utils/ai'

const PLACEHOLDER = `Paste your bank statement or transaction history here.

Example format:
Mar 1, 2026  NETFLIX.COM               -$15.99
Mar 1, 2026  SPOTIFY USA               -$9.99
Feb 28, 2026 OPENAI *CHATGPT           -$20.00
Feb 27, 2026 AMZN PRIME MEMBERSHIP     -$14.99
Feb 25, 2026 ADOBE SYSTEMS INC         -$54.99
Feb 22, 2026 GRAMMARLY                 -$12.00
Feb 20, 2026 NOTION LABS INC           -$16.00
Feb 18, 2026 DUOLINGO PLUS             -$6.99
...

SubTrack AI will identify all recurring charges and flag any suspicious ones.`

const EXAMPLE_TEMPLATES = [
  {
    label: 'Entertainment Stack',
    transactions: `Mar 15, 2026  NETFLIX.COM               -$15.99
Mar 15, 2026  SPOTIFY USA               -$9.99
Mar 15, 2026  DISNEY PLUS               -$7.99
Mar 14, 2026  HBO MAX SUBSCRIPTION      -$19.99`
  },
  {
    label: 'AI & Productivity',
    transactions: `Mar 12, 2026  OPENAI *CHATGPT           -$20.00
Mar 12, 2026  NOTION LABS INC           -$16.00
Mar 10, 2026  FIGMA INC                 -$12.00
Mar 8, 2026   GRAMMARLY                 -$12.00`
  },
  {
    label: 'Cloud & Software',
    transactions: `Mar 20, 2026  ADOBE SYSTEMS INC         -$54.99
Mar 18, 2026  MICROSOFT AZURE           -$50.00
Mar 15, 2026  AWS SERVICES              -$45.67
Mar 10, 2026  GITHUB COPILOT            -$10.00`
  },
  {
    label: 'Fitness & Health',
    transactions: `Mar 10, 2026  GYM MEMBERSHIP            -$49.99
Mar 8, 2026   PELOTON APP               -$44.00
Mar 5, 2026   CALM APP PREMIUM          -$14.99
Mar 1, 2026   MYFITNESSPAL PLUS         -$9.99`
  }
]

const RISK_CONFIG = {
  high: { color: 'text-danger', bg: 'bg-danger/10 border-danger/30', label: '⚠ High Risk' },
  medium: { color: 'text-warn', bg: 'bg-warn/10 border-warn/30', label: '◉ Review' },
  low: { color: 'text-accent', bg: 'bg-accent/10 border-accent/30', label: '✓ Looks Fine' },
  none: { color: 'text-accent', bg: 'bg-accent/10 border-accent/30', label: '✓ Active' },
}

export default function Analyzer({ addSubscription }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(new Set())

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        setText(content)
      }
    }
    reader.readAsText(file)
  }

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const subs = await analyzeTransactions(text)
      setResults(subs)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = (sub) => {
    addSubscription({
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency || 'USD',
      cycle: sub.cycle,
      category: sub.category,
      color: sub.color || '#2a2a3d',
      status: sub.risk === 'high' ? 'flagged' : sub.risk === 'medium' ? 'unknown' : 'active',
      nextBilling: sub.nextBilling || '',
      notes: sub.riskReason || ''
    })
    setAdded(prev => new Set([...prev, sub.name]))
  }

  const handleAddAll = () => {
    results?.forEach(sub => {
      if (!added.has(sub.name)) handleAdd(sub)
    })
  }

  const handleAddAllSafe = () => {
    results?.forEach(sub => {
      if (!added.has(sub.name) && sub.risk !== 'high') handleAdd(sub)
    })
  }

  const handleAddFlagRisky = () => {
    results?.forEach(sub => {
      if (!added.has(sub.name)) handleAdd(sub)
    })
  }

  const handleSkipHighRisk = () => {
    results?.forEach(sub => {
      if (!added.has(sub.name) && sub.risk !== 'high') handleAdd(sub)
    })
  }

  const highRiskCount = results?.filter(s => s.risk === 'high').length || 0
  const mediumRiskCount = results?.filter(s => s.risk === 'medium').length || 0
  const lowRiskCount = results?.filter(s => s.risk !== 'high' && s.risk !== 'medium').length || 0

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center glow-accent">
            <Scan size={18} className="text-accent" />
          </div>
          <h1 className="font-display text-3xl text-text">AI Analyzer</h1>
        </div>
        <p className="text-muted text-sm">Paste your bank statement or transaction history. Our AI will detect all subscriptions and flag suspicious charges.</p>
      </div>

      {/* Input */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <label className="text-xs text-muted font-mono uppercase tracking-wider block mb-3">TRANSACTION DATA</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={12}
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-accent/50 transition-colors resize-none font-mono leading-relaxed"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <p className="text-muted text-xs">Your data is processed privately.</p>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted hover:text-text hover:border-accent/30 transition-colors cursor-pointer text-xs">
              <Upload size={14} />
              Upload File
              <input type="file" accept=".pdf,.csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <button
            onClick={analyze}
            disabled={!text.trim() || loading}
            className="flex items-center gap-2 bg-accent text-bg px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-accent"
          >
            {loading ? <><Loader size={15} className="animate-spin" /> Analyzing...</> : <><Zap size={15} /> Analyze with AI</>}
          </button>
        </div>
      </div>

      {/* Example templates */}
      <div className="mb-6">
        <p className="text-xs text-muted font-mono uppercase tracking-wider mb-2">Try a demo with example transactions:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {EXAMPLE_TEMPLATES.map((template, i) => (
            <button
              key={i}
              onClick={() => setText(template.transactions)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted hover:text-text hover:border-accent/50 transition-colors text-xs"
            >
              <Play size={12} />
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 mb-6 text-danger text-sm">
          ⚠ {error} — Make sure your API key is set in .env
        </div>
      )}

      {/* Results */}
      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-slide-up">
          {/* Risk Summary */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6 grid grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-danger">{highRiskCount}</p>
                <p className="text-xs text-muted mt-1">High Risk</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-warn">{mediumRiskCount}</p>
                <p className="text-xs text-muted mt-1">To Review</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{lowRiskCount}</p>
                <p className="text-xs text-muted mt-1">Look Fine</p>
              </div>
            </motion.div>
          </div>

          {/* Bulk actions */}
          <div className="bg-surface border border-accent/20 rounded-xl p-4 mb-6">
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-3">BULK ACTIONS</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleAddAll}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-bg text-sm font-medium hover:bg-accent-dim transition-colors"
              >
                <Plus size={14} />
                Add All
              </button>
              <button
                onClick={handleAddFlagRisky}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-warn/20 border border-warn/30 text-warn text-sm font-medium hover:bg-warn/30 transition-colors"
              >
                <AlertCircle size={14} />
                Add All + Flag Risky
              </button>
              <button
                onClick={handleSkipHighRisk}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-muted hover:text-text hover:border-accent/30 text-sm font-medium transition-colors"
              >
                <Shield size={14} />
                Skip High Risk
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-text">Found {results.length} Subscriptions</h2>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((sub, i) => {
              const risk = RISK_CONFIG[sub.risk] || RISK_CONFIG.none
              const isAdded = added.has(sub.name)
              const confidence = sub.confidence || 85
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className={`border rounded-xl p-4 ${sub.risk === 'high' ? 'border-danger/30 bg-danger/5' : sub.risk === 'medium' ? 'border-warn/20 bg-warn/5' : 'border-border bg-card'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: sub.color || '#2a2a3d' }}>
                        {sub.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-text font-medium">{sub.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                            {confidence}%
                          </span>
                        </div>
                        <p className="text-muted text-xs">{sub.category} · {sub.cycle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-text font-mono">${sub.amount?.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${risk.bg} ${risk.color}`}>{risk.label}</span>
                      </div>
                      <button
                        onClick={() => handleAdd(sub)}
                        disabled={isAdded}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                          isAdded
                            ? 'bg-accent/10 border-accent/30 text-accent cursor-default'
                            : 'border-border text-muted hover:text-text hover:border-accent/30'
                        }`}
                      >
                        {isAdded ? <><CheckCircle size={12} /> Added</> : <><Plus size={12} /> Add</>}
                      </button>
                    </div>
                  </div>
                  {sub.riskReason && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-warn bg-warn/5 rounded-lg px-3 py-2">
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                      {sub.riskReason}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
