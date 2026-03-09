import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Settings, MessageSquare, Zap, AlertCircle, CalendarDays, Layers } from 'lucide-react'

export default function Sidebar({ flaggedCount }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={24} className="text-accent" />
          <h1 className="font-display text-xl font-bold text-text">SubTrack</h1>
        </div>
        <p className="text-muted text-xs">Subscription Intelligence</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <NavItem
          icon={<BarChart3 size={18} />}
          label="Dashboard"
          path="/"
          active={isActive('/')}
        />
        <NavItem
          icon={<Layers size={18} />}
          label="Subscriptions"
          path="/subscriptions"
          active={isActive('/subscriptions')}
        />
        <NavItem
          icon={<CalendarDays size={18} />}
          label="Calendar"
          path="/calendar"
          active={isActive('/calendar')}
        />
        <NavItem
          icon={<Zap size={18} />}
          label="Analyze"
          path="/analyze"
          active={isActive('/analyze')}
        />
        <NavItem
          icon={<MessageSquare size={18} />}
          label="Chat"
          path="/chat"
          active={isActive('/chat')}
        />
        <NavItem
          icon={<AlertCircle size={18} />}
          label="Alerts"
          path="/alerts"
          active={isActive('/alerts')}
          badge={flaggedCount > 0 ? flaggedCount : null}
        />
      </nav>

      <div className="border-t border-border p-4">
        <NavItem
          icon={<Settings size={18} />}
          label="Settings"
          path="/settings"
          active={isActive('/settings')}
        />
      </div>
    </div>
  )
}

function NavItem({ icon, label, path, active, badge }) {
  return (
    <Link
      to={path}
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors ${
        active
          ? 'bg-accent/10 text-accent'
          : 'text-muted hover:text-text hover:bg-card-hover'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}
