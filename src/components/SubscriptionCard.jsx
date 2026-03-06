import { Trash2, Flag, CheckCircle, AlertCircle, HelpCircle, Edit } from 'lucide-react'

const STATUS_CONFIG = {
  active: { icon: CheckCircle, color: 'text-accent', label: 'Active' },
  flagged: { icon: Flag, color: 'text-danger', label: 'Flagged' },
  unknown: { icon: HelpCircle, color: 'text-warn', label: 'Unknown' },
  cancelled: { icon: AlertCircle, color: 'text-muted', label: 'Cancelled' },
}

export default function SubscriptionCard({ sub, onDelete, onFlag, onEdit }) {
  const status = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active
  const StatusIcon = status.icon
  const monthlyAmount = sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount
  const isRisky = sub.status === 'flagged' || sub.status === 'unknown'

  return (
    <div className={`bg-card rounded-xl border ${isRisky ? 'border-danger/30' : 'border-border'} p-4 hover:border-accent/20 transition-all duration-200 group`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: color dot + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: sub.color || '#2a2a3d' }}
          >
            {sub.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-text font-medium truncate">{sub.name}</p>
            <p className="text-muted text-xs">{sub.category}</p>
          </div>
        </div>

        {/* Right: amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-text font-mono font-medium">${sub.amount.toFixed(2)}</p>
          <p className="text-muted text-xs">/{sub.cycle}</p>
        </div>
      </div>

      {/* Status + next billing */}
      <div className="mt-3 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-xs ${status.color}`}>
          <StatusIcon size={12} />
          <span>{status.label}</span>
        </div>
        <span className="text-muted text-xs font-mono">Next: {sub.nextBilling}</span>
      </div>

      {sub.notes && (
        <p className="mt-2 text-xs text-muted bg-bg rounded px-2 py-1">{sub.notes}</p>
      )}

      {/* Monthly equivalent for yearly */}
      {sub.cycle === 'yearly' && (
        <p className="mt-2 text-xs text-muted font-mono">≈ ${monthlyAmount.toFixed(2)}/mo</p>
      )}

      {/* Actions (show on hover) */}
      <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(sub)}
          className="flex-1 text-xs py-1.5 rounded-lg bg-bg border border-border text-muted hover:text-text hover:border-accent/30 transition-colors flex items-center justify-center gap-1"
        >
          <Edit size={11} /> Edit
        </button>
        <button
          onClick={() => onFlag(sub.id)}
          className="flex-1 text-xs py-1.5 rounded-lg bg-bg border border-border text-muted hover:text-warn hover:border-warn/30 transition-colors flex items-center justify-center gap-1"
        >
          <Flag size={11} /> Flag
        </button>
        <button
          onClick={() => onDelete(sub.id)}
          className="flex-1 text-xs py-1.5 rounded-lg bg-bg border border-border text-muted hover:text-danger hover:border-danger/30 transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  )
}
