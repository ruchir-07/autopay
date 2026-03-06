import { AlertTriangle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function ApiKeyBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-warn/10 border-b border-warn/30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle size={16} className="text-warn flex-shrink-0" />
        <p className="text-sm text-text">
          API key not configured. AI features won't work until you add your Anthropic API key.
        </p>
        <Link
          to="/settings"
          className="text-sm text-accent hover:text-accent-dim underline font-medium"
        >
          Go to Settings
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted hover:text-text transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}
