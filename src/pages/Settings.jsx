import { useState } from 'react'
import { Save, Key, Trash2, Download } from 'lucide-react'

export default function Settings({ subscriptions, onClearAll }) {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('subtrack_api_key') || import.meta.env.VITE_ANTHROPIC_API_KEY || ''
  )
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('subtrack_api_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    window.dispatchEvent(new Event('storage'))
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(subscriptions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtrack-export.json'
    a.click()
  }

  const totalMonthly = subscriptions.reduce((s, sub) => s + (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount), 0)

  return (
    <div className="p-8 animate-fade-in max-w-2xl">
      <h1 className="font-display text-3xl text-text mb-8">Settings</h1>

      {/* API Key */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-accent" />
          <h2 className="text-text font-medium">Anthropic API Key</h2>
        </div>
        <p className="text-muted text-sm mb-4">Your API key is required to use AI features. Get one at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-accent underline">console.anthropic.com</a></p>
        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-accent/50 transition-colors font-mono"
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-accent text-bg px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-dim transition-colors glow-accent"
          >
            <Save size={14} /> {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
        <p className="text-muted text-xs mt-3">For production: set <code className="bg-bg px-1 py-0.5 rounded text-accent">VITE_ANTHROPIC_API_KEY</code> in your <code className="bg-bg px-1 py-0.5 rounded text-accent">.env</code> file</p>
      </div>

      {/* Account summary */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-text font-medium mb-4">Account Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-display text-accent">{subscriptions.length}</p>
            <p className="text-muted text-xs mt-1">Subscriptions</p>
          </div>
          <div className="bg-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-display text-text">${totalMonthly.toFixed(0)}</p>
            <p className="text-muted text-xs mt-1">Monthly</p>
          </div>
          <div className="bg-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-display text-warn">{subscriptions.filter(s => s.status !== 'active').length}</p>
            <p className="text-muted text-xs mt-1">Flagged</p>
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-text font-medium mb-4">Data Management</h2>
        <p className="text-muted text-sm mb-4">All data is stored locally in your browser. Nothing is sent to any server.</p>
        <div className="flex gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 border border-border text-muted hover:text-text hover:border-accent/30 px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Download size={14} /> Export JSON
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 border border-danger/30 text-danger hover:bg-danger/10 px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Trash2 size={14} /> Clear All Data
          </button>
        </div>
      </div>
    </div>
  )
}
