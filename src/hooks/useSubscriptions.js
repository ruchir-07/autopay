import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'subtrack_subscriptions'

const SAMPLE_DATA = [
  { id: '1', name: 'Netflix', amount: 15.99, currency: 'USD', cycle: 'monthly', category: 'Entertainment', status: 'active', nextBilling: '2026-03-20', color: '#E50914', notes: '' },
  { id: '2', name: 'Spotify', amount: 9.99, currency: 'USD', cycle: 'monthly', category: 'Entertainment', status: 'active', nextBilling: '2026-03-18', color: '#1DB954', notes: '' },
  { id: '3', name: 'ChatGPT Plus', amount: 20.00, currency: 'USD', cycle: 'monthly', category: 'AI Tools', status: 'active', nextBilling: '2026-03-25', color: '#10A37F', notes: '' },
  { id: '4', name: 'Adobe Creative Cloud', amount: 54.99, currency: 'USD', cycle: 'monthly', category: 'Software', status: 'active', nextBilling: '2026-03-12', color: '#FF0000', notes: '' },
  { id: '5', name: 'Amazon Prime', amount: 139.00, currency: 'USD', cycle: 'yearly', category: 'Shopping', status: 'active', nextBilling: '2026-09-01', color: '#FF9900', notes: '' },
  { id: '6', name: 'Notion AI', amount: 16.00, currency: 'USD', cycle: 'monthly', category: 'AI Tools', status: 'unknown', nextBilling: '2026-03-15', color: '#000000', notes: 'Not sure if still using this' },
  { id: '7', name: 'Gym Membership', amount: 49.99, currency: 'USD', cycle: 'monthly', category: 'Health', status: 'flagged', nextBilling: '2026-03-10', color: '#FF6B35', notes: 'Havent been in 3 months' },
]

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : SAMPLE_DATA
    } catch {
      return SAMPLE_DATA
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
  }, [subscriptions])

  const addSubscription = useCallback((sub) => {
    const newSub = {
      ...sub,
      id: Date.now().toString(),
      status: sub.status || 'active',
      notes: sub.notes || '',
    }
    setSubscriptions(prev => [newSub, ...prev])
    return newSub
  }, [])

  const updateSubscription = useCallback((id, updates) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const deleteSubscription = useCallback((id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }, [])

  const flagSubscription = useCallback((id) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'flagged' } : s))
  }, [])

  const getMonthlyTotal = useCallback(() => {
    return subscriptions.reduce((sum, sub) => {
      const monthly = sub.cycle === 'yearly' ? sub.amount / 12
        : sub.cycle === 'weekly' ? sub.amount * 4.33
        : sub.amount
      return sum + monthly
    }, 0)
  }, [subscriptions])

  const getYearlyTotal = useCallback(() => {
    return subscriptions.reduce((sum, sub) => {
      const yearly = sub.cycle === 'monthly' ? sub.amount * 12
        : sub.cycle === 'weekly' ? sub.amount * 52
        : sub.amount
      return sum + yearly
    }, 0)
  }, [subscriptions])

  const getFlaggedCount = useCallback(() => {
    return subscriptions.filter(s => s.status === 'flagged' || s.status === 'unknown').length
  }, [subscriptions])

  const getByCategory = useCallback(() => {
    const map = {}
    subscriptions.forEach(sub => {
      const cat = sub.category || 'Other'
      if (!map[cat]) map[cat] = { name: cat, total: 0, count: 0 }
      const monthly = sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount
      map[cat].total += monthly
      map[cat].count++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [subscriptions])

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    flagSubscription,
    getMonthlyTotal,
    getYearlyTotal,
    getFlaggedCount,
    getByCategory,
  }
}
