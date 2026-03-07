import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { TrendingUp, AlertTriangle, Plus, Calendar, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import StatCard from '../components/StatCard'
import SubModal from '../components/SubModal'
import { format, addMonths, addDays, startOfDay } from 'date-fns'

const CHART_COLORS = ['#00ff88', '#00ccff', '#ff6b35', '#7b68ee', '#ff3366', '#ffd700']

function buildSpendingHistory(subscriptions) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = addMonths(new Date(), -i)
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)

    const total = subscriptions.reduce((s, sub) => {
      const monthlyAmount = sub.cycle === 'yearly' ? sub.amount / 12
        : sub.cycle === 'weekly' ? sub.amount * 4.33
        : sub.amount

      if (!sub.nextBilling) return s + monthlyAmount

      const nextBill = new Date(sub.nextBilling)
      const nextBillInMonth = nextBill >= monthStart && nextBill <= monthEnd

      if (nextBillInMonth) return s + monthlyAmount
      return s
    }, 0)

    months.push({ month: format(d, 'MMM'), amount: Math.max(0, +(total).toFixed(2)) })
  }
  return months
}

function buildUpcomingTimeline(subscriptions) {
  const today = startOfDay(new Date())
  const upcoming = []

  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i)
    const charges = subscriptions
      .filter(s => s.nextBilling && startOfDay(new Date(s.nextBilling)).getTime() === date.getTime())
      .reduce((sum, s) => sum + s.amount, 0)

    if (charges > 0) {
      upcoming.push({
        date: format(date, 'MMM d'),
        amount: charges,
        daysUntil: i,
        fullDate: date
      })
    }
  }

  return upcoming
}

export default function Dashboard({ subscriptions, getMonthlyTotal, getYearlyTotal, getFlaggedCount, getByCategory, addSubscription }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const monthly = getMonthlyTotal()
  const yearly = getYearlyTotal()
  const flagged = getFlaggedCount()
  const categories = getByCategory()
  const chartData = buildSpendingHistory(subscriptions)
  const timelineData = buildUpcomingTimeline(subscriptions)

  const flaggedSubscriptions = subscriptions.filter(s => s.status !== 'active')
  const potentialSavings = flaggedSubscriptions.reduce((sum, s) => sum + (s.cycle === 'yearly' ? s.amount / 12 : s.amount), 0)

  const upcomingCharges = [...subscriptions]
    .filter(s => s.nextBilling)
    .sort((a, b) => new Date(a.nextBilling) - new Date(b.nextBilling))
    .slice(0, 5)

  const filteredSubscriptions = selectedCategory
    ? subscriptions.filter(s => s.category === selectedCategory)
    : subscriptions

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
        <StatCard label="Monthly Spend" value={`$${monthly.toFixed(2)}`} sub="total this month" accent animate />
        <StatCard label="Annual Spend" value={`$${yearly.toFixed(0)}`} sub="projected this year" animate />
        <StatCard label="Total Services" value={subscriptions.length} sub="active subscriptions" animate />
        <StatCard label="Needs Review" value={flagged} sub="flagged or unknown" danger={flagged > 0} animate />
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
              <Pie
                data={categories}
                dataKey="total"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                strokeWidth={0}
                onClick={(entry) => setSelectedCategory(entry.name)}
              >
                {categories.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    style={{ cursor: 'pointer', opacity: !selectedCategory || selectedCategory === categories[i].name ? 1 : 0.4 }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: '8px', fontSize: '11px' }}
                formatter={v => [`$${v.toFixed(2)}/mo`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categories.slice(0, 4).map((cat, i) => (
              <motion.div
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                whileHover={{ x: 4 }}
                className={`flex items-center justify-between cursor-pointer p-1 rounded transition-colors ${
                  selectedCategory === cat.name ? 'bg-accent/10' : 'hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-xs text-muted">{cat.name}</span>
                </div>
                <span className="text-xs font-mono text-text">${cat.total.toFixed(2)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Next 30 days timeline */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={16} className="text-accent" />
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider">Next 30 Days Charges</h2>
        </div>
        {timelineData.length === 0 ? (
          <p className="text-muted text-sm">No charges scheduled in the next 30 days</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timelineData}>
              <XAxis dataKey="date" stroke="#6b6b8a" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#6b6b8a" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2a2a3d', borderRadius: '8px', fontSize: '12px' }}
                formatter={v => [`$${v.toFixed(2)}`, 'Charges']}
              />
              <Bar dataKey="amount" fill="#00ff88" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Savings meter */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={16} className="text-accent" />
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider">Potential Savings</h2>
        </div>
        {potentialSavings > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text">Monthly savings by cancelling flagged:</span>
              <span className="text-accent font-mono font-semibold text-lg">${potentialSavings.toFixed(2)}</span>
            </div>
            <div className="w-full bg-surface rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((potentialSavings / monthly) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-accent h-full rounded-full"
              />
            </div>
            <p className="text-muted text-xs">{Math.round((potentialSavings / monthly) * 100)}% of your current monthly spend</p>
          </div>
        ) : (
          <p className="text-muted text-sm">No flagged subscriptions - great job!</p>
        )}
      </div>

      {/* Upcoming charges + filtered list */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Upcoming */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">Upcoming Charges</h2>
          <div className="space-y-3">
            {upcomingCharges.map(sub => {
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
          {flaggedSubscriptions.length === 0 ? (
            <p className="text-muted text-sm">All subscriptions look good!</p>
          ) : (
            <div className="space-y-3">
              {flaggedSubscriptions.slice(0, 4).map(sub => (
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

      {/* Subscriptions list with filter indicator */}
      {selectedCategory && (
        <div className="bg-surface border border-accent/30 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-text">Showing <span className="text-accent font-semibold">{filteredSubscriptions.length}</span> subscriptions in <span className="text-accent font-semibold">{selectedCategory}</span></p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-accent hover:text-accent-dim text-sm font-mono"
          >
            Clear filter
          </button>
        </div>
      )}

      {showModal && <SubModal onClose={() => setShowModal(false)} onSave={addSubscription} />}
    </div>
  )
}
