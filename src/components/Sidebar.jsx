import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Search, MessageSquare, Settings, Zap, AlertTriangle } from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { path: '/analyze', icon: Search, label: 'AI Analyzer' },
  { path: '/chat', icon: MessageSquare, label: 'Ask AI' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ flaggedCount }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center glow-accent">
            <Zap size={16} className="text-accent" />
          </div>
          <div>
            <span className="font-display text-lg text-text">SubTrack</span>
            <span className="text-accent font-mono text-xs ml-1">AI</span>
          </div>
        </div>
        <p className="text-muted text-xs mt-1 font-mono">Know every charge</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-muted hover:text-text hover:bg-card'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-accent' : 'text-muted group-hover:text-text'} />
                <span>{label}</span>
                {label === 'Alerts' && flaggedCount > 0 && (
                  <span className="ml-auto bg-danger text-white text-xs font-mono rounded-full w-5 h-5 flex items-center justify-center glow-danger">
                    {flaggedCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="bg-card rounded-lg p-3 border border-border">
          <p className="text-xs text-muted">All data stored locally.</p>
          <p className="text-xs text-muted">Your financial data never leaves your device.</p>
        </div>
      </div>
    </aside>
  )
}
