import { useState, useMemo, useEffect } from 'react'
import { AlertTriangle, HelpCircle, Trash2, CheckCircle, Loader, Sparkles, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { getAIInsights } from '../utils/ai'
import { useToast } from '../contexts/ToastContext'

export default function Alerts({ subscriptions, updateSubscription, deleteSubscription }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ignoredAlerts, setIgnoredAlerts] = useState(() => {
    const saved = localStorage.getItem('ignored_alerts')
    return saved ? JSON.parse(saved) : []
  })
  const { addToast } = useToast()

  useEffect(() => {
    localStorage.setItem('ignored_alerts', JSON.stringify(ignoredAlerts))
  }, [ignoredAlerts])

  const flagged = subscriptions.filter(s => s.status === 'flagged')
  const unknown = subscriptions.filter(s => s.status === 'unknown')

  const smartDetection = useMemo(() => {
    const now = new Date()
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const overlaps = []
    const categoryMap = {}

    subscriptions.forEach(sub => {
      if (!categoryMap[sub.category]) categoryMap[sub.category] = []
      categoryMap[sub.category].push(sub)
    })

    Object.entries(categoryMap).forEach(([category, subs]) => {
      if (subs.length >= 2) {
        overlaps.push({
          id: `overlap_${category}`,
          type: 'overlap',
          category,
          subscriptions: subs,
          message: `You have ${subs.length} ${category} subscriptions that might overlap`
        })
      }
    })

    const forgotten = subscriptions.filter(sub => {
      const lastBilled = new Date(sub.lastBilled || sub.createdAt || now)
      return lastBilled < sixtyDaysAgo && sub.status !== 'cancelled'
    }).map(sub => ({
      id: `forgotten_${sub.id}`,
      type: 'forgotten',
      subscription: sub,
      message: `${sub.name} hasn't been billed in over 60 days`
    }))

    const renewals = subscriptions.filter(sub => {
      if (!sub.renewalDate || sub.cycle !== 'yearly') return false
      const renewal = new Date(sub.renewalDate)
      return renewal > now && renewal <= thirtyDaysFromNow
    }).map(sub => {
      const renewal = new Date(sub.renewalDate)
      const daysUntil = Math.ceil((renewal - now) / (24 * 60 * 60 * 1000))
      return {
        id: `renewal_${sub.id}`,
        type: 'renewal',
        subscription: sub,
        daysUntil,
        message: `${sub.name} renews in ${daysUntil} day${daysUntil === 1 ? '' : 's'} ($${sub.amount})`
      }
    })

    return { overlaps, forgotten, renewals }
  }, [subscriptions])

  const monthlyComparison = useMemo(() => {
    const now = new Date()
    const currentMonth = subscriptions.reduce((sum, sub) => {
      if (sub.cycle === 'monthly') return sum + sub.amount
      if (sub.cycle === 'yearly') return sum + (sub.amount / 12)
      if (sub.cycle === 'weekly') return sum + (sub.amount * 4.33)
      return sum
    }, 0)

    return currentMonth
  }, [subscriptions])

  const toggleIgnore = (alertId) => {
    setIgnoredAlerts(prev => {
      if (prev.includes(alertId)) {
        return prev.filter(id => id !== alertId)
      }
      return [...prev, alertId]
    })
  }

  const isIgnored = (alertId) => ignoredAlerts.includes(alertId)

  const loadInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAIInsights(subscriptions)
      setInsights(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const resolve = (id) => {
    updateSubscription(id, { status: 'active' })
    addToast('Subscription marked as active', 'success')
  }

  const dismiss = (id) => {
    deleteSubscription(id)
    addToast('Subscription cancelled', 'success')
  }

  const totalSmartAlerts = smartDetection.overlaps.length + smartDetection.forgotten.length + smartDetection.renewals.length
  const visibleSmartAlerts = totalSmartAlerts - smartDetection.overlaps.filter(a => isIgnored(a.id)).length - smartDetection.forgotten.filter(a => isIgnored(a.id)).length - smartDetection.renewals.filter(a => isIgnored(a.id)).length

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text mb-1">Alerts</h1>
        <p className="text-muted text-sm">{flagged.length + unknown.length + visibleSmartAlerts} subscriptions need your attention</p>
      </div>

      {/* Monthly Spend Comparison */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <TrendingUp size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-text font-medium">Monthly Spending</p>
            <p className="text-muted text-xs">Normalized from all billing cycles</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-accent">${monthlyComparison.toFixed(2)}</div>
        <p className="text-muted text-sm mt-2">Per month across all subscriptions</p>
      </div>

      {/* Smart Detection */}
      {visibleSmartAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-accent" />
            <h2 className="text-text font-medium">Smart Detection ({visibleSmartAlerts})</h2>
          </div>

          {smartDetection.overlaps.map(alert => !isIgnored(alert.id) && (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-text font-medium text-sm mb-2">{alert.message}</p>
                  <div className="flex flex-wrap gap-2">
                    {alert.subscriptions.map(sub => (
                      <span key={sub.id} className="text-xs px-2 py-1 bg-accent/10 border border-accent/20 rounded text-text">
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => toggleIgnore(alert.id)}
                  className="flex-shrink-0 p-2 hover:bg-accent/10 rounded-lg transition-colors"
                  title={isIgnored(alert.id) ? 'Show alert' : 'Ignore alert'}
                >
                  {isIgnored(alert.id) ? (
                    <EyeOff size={14} className="text-muted" />
                  ) : (
                    <Eye size={14} className="text-muted" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}

          {smartDetection.forgotten.map(alert => !isIgnored(alert.id) && (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warn/5 border border-warn/20 rounded-xl p-4 mb-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: alert.subscription.color || '#2a2a3d' }}>
                    {alert.subscription.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-text font-medium text-sm">{alert.message}</p>
                    <p className="text-muted text-xs mt-1">{alert.subscription.category} · ${alert.subscription.amount}/{alert.subscription.cycle}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleIgnore(alert.id)}
                  className="flex-shrink-0 p-2 hover:bg-warn/10 rounded-lg transition-colors"
                  title={isIgnored(alert.id) ? 'Show alert' : 'Ignore alert'}
                >
                  {isIgnored(alert.id) ? (
                    <EyeOff size={14} className="text-muted" />
                  ) : (
                    <Eye size={14} className="text-muted" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}

          {smartDetection.renewals.map(alert => !isIgnored(alert.id) && (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: alert.subscription.color || '#2a2a3d' }}>
                    {alert.subscription.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-text font-medium text-sm">{alert.message}</p>
                    <p className="text-accent text-xs mt-1 font-semibold">{alert.daysUntil} day countdown</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleIgnore(alert.id)}
                  className="flex-shrink-0 p-2 hover:bg-accent/10 rounded-lg transition-colors"
                  title={isIgnored(alert.id) ? 'Show alert' : 'Ignore alert'}
                >
                  {isIgnored(alert.id) ? (
                    <EyeOff size={14} className="text-muted" />
                  ) : (
                    <Eye size={14} className="text-muted" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* AI Insights button */}
      <div className="bg-gradient-to-r from-accent/5 to-blue-500/5 border border-accent/20 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-text font-medium mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-accent" /> AI Spending Analysis
            </h2>
            <p className="text-muted text-sm">Let AI analyze all your subscriptions and surface personalized savings opportunities.</p>
          </div>
          <button
            onClick={loadInsights}
            disabled={loading}
            className="flex items-center gap-2 bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-dim transition-colors disabled:opacity-50 glow-accent flex-shrink-0"
          >
            {loading ? <><Loader size={14} className="animate-spin" /> Analyzing...</> : 'Run AI Analysis'}
          </button>
        </div>

        {error && <p className="mt-3 text-danger text-sm">⚠ {error}</p>}

        {insights && (
          <div className="mt-5 space-y-4 animate-slide-up">
            <div className="bg-bg rounded-xl p-4 border border-border">
              <p className="text-text text-sm leading-relaxed">{insights.summary}</p>
              {insights.savingsOpportunity > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-accent font-mono font-bold text-lg">${insights.savingsOpportunity.toFixed(2)}/mo</span>
                  <span className="text-muted text-sm">potential savings — {insights.savingsNote}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {insights.insights?.map((ins, i) => (
                <div key={i} className={`rounded-xl p-4 border ${
                  ins.type === 'warning' ? 'border-danger/30 bg-danger/5' :
                  ins.type === 'tip' ? 'border-accent/20 bg-accent/5' :
                  'border-border bg-card'
                }`}>
                  <p className={`font-medium text-sm mb-1 ${
                    ins.type === 'warning' ? 'text-danger' :
                    ins.type === 'tip' ? 'text-accent' : 'text-text'
                  }`}>{ins.title}</p>
                  <p className="text-muted text-sm">{ins.body}</p>
                </div>
              ))}
            </div>

            {insights.duplicates?.length > 0 && (
              <div className="bg-warn/5 border border-warn/20 rounded-xl p-4">
                <p className="text-warn font-medium text-sm mb-2">⚡ Possible Duplicates</p>
                {insights.duplicates.map((d, i) => <p key={i} className="text-muted text-xs">• {d}</p>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flagged */}
      {flagged.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-danger" />
            <h2 className="text-text font-medium">Flagged ({flagged.length})</h2>
          </div>
          <div className="space-y-3">
            {flagged.map(sub => (
              <AlertItem key={sub.id} sub={sub} onResolve={resolve} onDismiss={dismiss} />
            ))}
          </div>
        </div>
      )}

      {/* Unknown */}
      {unknown.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={16} className="text-warn" />
            <h2 className="text-text font-medium">Unknown / Unverified ({unknown.length})</h2>
          </div>
          <div className="space-y-3">
            {unknown.map(sub => (
              <AlertItem key={sub.id} sub={sub} onResolve={resolve} onDismiss={dismiss} warn />
            ))}
          </div>
        </div>
      )}

      {flagged.length === 0 && unknown.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle size={40} className="text-accent mx-auto mb-4" />
          <p className="text-text text-lg mb-1">All clear!</p>
          <p className="text-muted text-sm">No subscriptions need attention right now.</p>
        </div>
      )}
    </div>
  )
}

function AlertItem({ sub, onResolve, onDismiss, warn }) {
  return (
    <div className={`bg-card border ${warn ? 'border-warn/20' : 'border-danger/20'} rounded-xl p-4 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: sub.color || '#2a2a3d' }}>
          {sub.name.charAt(0)}
        </div>
        <div>
          <p className="text-text font-medium">{sub.name}</p>
          <p className="text-muted text-xs">{sub.category} · ${sub.amount}/{sub.cycle}</p>
          {sub.notes && <p className={`text-xs mt-0.5 ${warn ? 'text-warn' : 'text-danger'}`}>{sub.notes}</p>}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onResolve(sub.id)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          <CheckCircle size={12} /> Keep
        </button>
        <button
          onClick={() => onDismiss(sub.id)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-danger/10 border border-danger/30 text-danger rounded-lg hover:bg-danger/20 transition-colors"
        >
          <Trash2 size={12} /> Cancel
        </button>
      </div>
    </div>
  )
}
