export default function StatCard({ label, value, sub, accent, danger, warn }) {
  const borderColor = danger ? 'border-danger/30' : accent ? 'border-accent/30' : warn ? 'border-warn/30' : 'border-border'
  const textColor = danger ? 'text-danger' : accent ? 'text-accent' : warn ? 'text-warn' : 'text-text'
  const glow = danger ? 'glow-danger' : accent ? 'glow-accent' : warn ? 'glow-warn' : ''

  return (
    <div className={`bg-card rounded-xl border ${borderColor} ${glow} p-5 flex flex-col gap-1`}>
      <p className="text-muted text-xs font-mono uppercase tracking-wider">{label}</p>
      <p className={`font-display text-3xl ${textColor}`}>{value}</p>
      {sub && <p className="text-muted text-xs">{sub}</p>}
    </div>
  )
}
