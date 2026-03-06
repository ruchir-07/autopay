import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = ['Entertainment', 'AI Tools', 'Software', 'Shopping', 'Health', 'Finance', 'News', 'Education', 'Gaming', 'Utilities', 'Other']
const CYCLES = ['monthly', 'yearly', 'weekly']
const COLORS = ['#E50914', '#1DB954', '#10A37F', '#FF0000', '#FF9900', '#0078D4', '#7B68EE', '#FF6B35', '#00ff88', '#00ccff', '#ff3366']

const empty = {
  name: '', amount: '', currency: 'USD', cycle: 'monthly',
  category: 'Entertainment', status: 'active', nextBilling: '', color: '#2a2a3d', notes: ''
}

export default function SubModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || empty)

  useEffect(() => {
    if (initial) setForm(initial)
  }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name || !form.amount) return
    onSave({ ...form, amount: parseFloat(form.amount) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-text">{initial ? 'Edit' : 'Add'} Subscription</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-muted font-mono block mb-1.5">SERVICE NAME</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Netflix, ChatGPT..."
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Amount + Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted font-mono block mb-1.5">AMOUNT ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="9.99"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-mono block mb-1.5">BILLING CYCLE</label>
              <select
                value={form.cycle}
                onChange={e => set('cycle', e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors"
              >
                {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-muted font-mono block mb-1.5">CATEGORY</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Next Billing */}
          <div>
            <label className="text-xs text-muted font-mono block mb-1.5">NEXT BILLING DATE</label>
            <input
              type="date"
              value={form.nextBilling}
              onChange={e => set('nextBilling', e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-muted font-mono block mb-1.5">STATUS</label>
            <div className="flex gap-2">
              {['active', 'unknown', 'flagged'].map(s => (
                <button
                  key={s}
                  onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-lg text-xs border transition-colors capitalize ${
                    form.status === s
                      ? s === 'active' ? 'bg-accent/10 border-accent/30 text-accent'
                        : s === 'flagged' ? 'bg-danger/10 border-danger/30 text-danger'
                        : 'bg-warn/10 border-warn/30 text-warn'
                      : 'bg-bg border-border text-muted hover:text-text'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-muted font-mono block mb-1.5">COLOR</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted font-mono block mb-1.5">NOTES (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any notes about this subscription..."
              rows={2}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-muted hover:text-text text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name || !form.amount}
            className="flex-1 py-2.5 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {initial ? 'Update' : 'Add Subscription'}
          </button>
        </div>
      </div>
    </div>
  )
}
