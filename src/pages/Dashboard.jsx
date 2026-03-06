import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertTriangle, Plus } from 'lucide-react'
import StatCard from '../components/StatCard'
import SubModal from '../components/SubModal'
import { format, addMonths } from 'date-fns'

const CHART_COLORS = ['#00ff88', '#00ccff', '#ff6b35', '#7b68ee', '#ff3366', '#ffd700']

function buildSpendingHistory(subscriptions) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = addMonths(new Date(), -i)
    const total = subscriptions.reduce((s, sub) => {
      const m = sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount
      return s + m
    }, 0)
    // Simulate slight variation
    const variation = 1 + (Math.sin(i * 1.3) * 0.05)
    months.push({ month: format(d, 'MMM'), amount: +(total * variation).toFixed(2) })
  }
  return months
}

export default function Dashboard({ subscriptions, getMonthlyTotal, getYearlyTotal, getFlaggedCount, getByCategory, addSubscription }) {
  const [showModal, setShowModal] = useState(false)

  const monthly = getMonthlyTotal()
  const yearly = getYearlyTotal()
  const flagged = getFlaggedCount()
  const categories = getByCategory()
  const chartData = buildSpendingHistory(subscriptions)
  const upcoming = [...subscriptions]
    .filter(s => s.nextBilling)
    .sort((a, b) => new Date(a.nextBilling) - new Date(b.nextBilling))
    .slice(0, 5)

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-text">Dashboard</h1>
          <p className="text-muted text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-dim transition-colors glow-accent"
        >
          <Plus size={16} /> Add Subscription
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Monthly Spend" value={`$${monthly.toFixed(2)}`} sub="total this month" accent />
        <StatCard label="Annual Spend" value={`$${yearly.toFixed(0)}`} sub="projected this year" />
        <StatCard label="Total Services" value={subscriptions.length} sub="active subscriptions" />
        <StatCard label="Needs Review" value={flagged} sub="flagged or unknown" danger={flagged > 0} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Spending trend */}
        <div className="col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-accent" />
            <h2 className="text-sm font-mono text-muted uppercase tracking-wider">6-Month Spending Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#6b6b8a" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#6b6b8a" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e8e8f0' }}
                formatter={v => [`$${v}`, 'Monthly']}
              />
              <Area type="monotone" dataKey="amount" stroke="#00ff88" fill="url(#grad)" strokeWidth={2} dot={{ fill: '#00ff88', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-5">By Category</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categories} dataKey="total" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={0}>
                {categories.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: '8px', fontSize: '11px' }}
                formatter={v => [`$${v.toFixed(2)}/mo`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categories.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-xs text-muted">{cat.name}</span>
                </div>
                <span className="text-xs font-mono text-text">${cat.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming charges + flagged */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">Upcoming Charges</h2>
          <div className="space-y-3">
            {upcoming.map(sub => {
              const daysUntil = Math.ceil((new Date(sub.nextBilling) - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={sub.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: sub.color || '#2a2a3d' }}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-text text-sm">{sub.name}</p>
                      <p className="text-muted text-xs font-mono">{daysUntil <= 0 ? 'Today' : `${daysUntil}d`}</p>
                    </div>
                  </div>
                  <span className="text-text font-mono text-sm">${sub.amount.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Flagged */}
        <div className="bg-card border border-danger/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-danger" />
            <h2 className="text-sm font-mono text-muted uppercase tracking-wider">Needs Attention</h2>
          </div>
          {subscriptions.filter(s => s.status !== 'active').length === 0 ? (
            <p className="text-muted text-sm">All subscriptions look good! 🎉</p>
          ) : (
            <div className="space-y-3">
              {subscriptions.filter(s => s.status !== 'active').slice(0, 4).map(sub => (
                <div key={sub.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: sub.color || '#2a2a3d' }}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-text text-sm">{sub.name}</p>
                      <p className={`text-xs ${sub.status === 'flagged' ? 'text-danger' : 'text-warn'}`}>{sub.status}</p>
                    </div>
                  </div>
                  <span className="text-text font-mono text-sm">${sub.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && <SubModal onClose={() => setShowModal(false)} onSave={addSubscription} />}
    </div>
  )
}
