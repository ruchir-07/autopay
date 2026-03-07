import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function StatCard({ label, value, sub, accent, danger, warn, animate = false }) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const borderColor = danger ? 'border-danger/30' : accent ? 'border-accent/30' : warn ? 'border-warn/30' : 'border-border'
  const textColor = danger ? 'text-danger' : accent ? 'text-accent' : warn ? 'text-warn' : 'text-text'
  const glow = danger ? 'glow-danger' : accent ? 'glow-accent' : warn ? 'glow-warn' : ''

  useEffect(() => {
    if (!animate) return

    let numValue = typeof value === 'string'
      ? parseFloat(value.replace(/[$,]/g, ''))
      : value

    if (isNaN(numValue)) {
      setDisplayValue(value)
      return
    }

    let current = 0
    const increment = numValue / 30
    const interval = setInterval(() => {
      current += increment
      if (current >= numValue) {
        setDisplayValue(numValue)
        clearInterval(interval)
      } else {
        setDisplayValue(typeof value === 'string'
          ? value.replace(/[\d.]+/, current.toFixed(2))
          : Math.floor(current)
        )
      }
    }, 30)

    return () => clearInterval(interval)
  }, [value, animate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl border ${borderColor} ${glow} p-5 flex flex-col gap-1`}
    >
      <p className="text-muted text-xs font-mono uppercase tracking-wider">{label}</p>
      <p className={`font-display text-3xl ${textColor}`}>{displayValue}</p>
      {sub && <p className="text-muted text-xs">{sub}</p>}
    </motion.div>
  )
}
