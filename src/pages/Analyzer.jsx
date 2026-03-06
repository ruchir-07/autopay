import { useState } from 'react'
import { Scan, Zap, CheckCircle, AlertTriangle, Plus, Loader } from 'lucide-react'
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
          <p className="text-muted text-xs">Your data is processed privately and never stored on our servers.</p>
          <button
            onClick={analyze}
            disabled={!text.trim() || loading}
            className="flex items-center gap-2 bg-accent text-bg px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-accent"
          >
            {loading ? <><Loader size={15} className="animate-spin" /> Analyzing...</> : <><Zap size={15} /> Analyze with AI</>}
          </button>
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
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-text">Found {results.length} Subscriptions</h2>
              <p className="text-muted text-sm">
                {results.filter(s => s.risk === 'high').length} high risk ·{' '}
                {results.filter(s => s.risk === 'medium').length} need review
              </p>
            </div>
            <button
              onClick={handleAddAll}
              className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl text-sm text-muted hover:text-text hover:border-accent/30 transition-colors"
            >
              <Plus size={14} /> Add All to Tracker
            </button>
          </div>

          <div className="space-y-3">
            {results.map((sub, i) => {
              const risk = RISK_CONFIG[sub.risk] || RISK_CONFIG.none
              const isAdded = added.has(sub.name)
              return (
                <div key={i} className={`border rounded-xl p-4 ${sub.risk === 'high' ? 'border-danger/30 bg-danger/5' : sub.risk === 'medium' ? 'border-warn/20 bg-warn/5' : 'border-border bg-card'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: sub.color || '#2a2a3d' }}>
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-text font-medium">{sub.name}</p>
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
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
