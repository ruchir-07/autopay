import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import SubscriptionCard from '../components/SubscriptionCard'
import SubModal from '../components/SubModal'

const ALL_CATS = ['All', 'Entertainment', 'AI Tools', 'Software', 'Shopping', 'Health', 'Finance', 'News', 'Education', 'Gaming', 'Utilities', 'Other']

export default function Subscriptions({ subscriptions, addSubscription, updateSubscription, deleteSubscription, flagSubscription }) {
  const [showModal, setShowModal] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name')

  const filtered = subscriptions
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => category === 'All' || s.category === category)
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'date') return new Date(a.nextBilling) - new Date(b.nextBilling)
      return 0
    })

  const handleEdit = (sub) => {
    setEditSub(sub)
    setShowModal(true)
  }

  const handleSave = (data) => {
    if (editSub) {
      updateSubscription(editSub.id, data)
    } else {
      addSubscription(data)
    }
    setEditSub(null)
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-text">Subscriptions</h1>
          <p className="text-muted text-sm mt-1">{subscriptions.length} total services tracked</p>
        </div>
        <button
          onClick={() => { setEditSub(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-dim transition-colors glow-accent"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 py-2.5 text-muted text-sm outline-none"
        >
          <option value="name">Sort: A-Z</option>
          <option value="amount">Sort: Price</option>
          <option value="date">Sort: Billing Date</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ALL_CATS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              category === cat
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-card border-border text-muted hover:text-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-lg mb-2">No subscriptions found</p>
          <p className="text-sm">Add one manually or use the AI Analyzer to import from bank statements</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(sub => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              onDelete={deleteSubscription}
              onFlag={flagSubscription}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {showModal && (
        <SubModal
          onClose={() => { setShowModal(false); setEditSub(null) }}
          onSave={handleSave}
          initial={editSub}
        />
      )}
    </div>
  )
}
