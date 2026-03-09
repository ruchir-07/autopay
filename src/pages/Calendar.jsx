import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Calendar({ subscriptions }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const billingsByDay = {}

    subscriptions.forEach(sub => {
      if (!sub.billingDay || sub.status === 'cancelled') return

      for (let day = sub.billingDay; day <= daysInMonth; day += sub.billingCycle || 30) {
        if (!billingsByDay[day]) billingsByDay[day] = []
        billingsByDay[day].push(sub)
      }
    })

    return { year, month, daysInMonth, startingDayOfWeek, billingsByDay }
  }, [currentDate, subscriptions])

  const monthTotals = useMemo(() => {
    const calculateTotal = (monthOffset = 0) => {
      const targetDate = new Date(monthData.year, monthData.month + monthOffset, 1)
      const targetMonth = targetDate.getMonth()
      const targetYear = targetDate.getFullYear()
      const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()

      let total = 0
      subscriptions.forEach(sub => {
        if (!sub.billingDay || sub.status === 'cancelled') return

        for (let day = sub.billingDay; day <= daysInTargetMonth; day += sub.billingCycle || 30) {
          total += sub.amount
        }
      })

      return total
    }

    return {
      current: calculateTotal(0),
      next: calculateTotal(1)
    }
  }, [monthData, subscriptions])

  const getDaysArray = () => {
    const days = []
    const { daysInMonth, startingDayOfWeek } = monthData

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getSelectedDayData = () => {
    if (!selectedDay) return null
    return monthData.billingsByDay[selectedDay] || []
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      monthData.month === today.getMonth() &&
      monthData.year === today.getFullYear()
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(monthData.year, monthData.month - 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(monthData.year, monthData.month + 1))
    setSelectedDay(null)
  }

  const days = getDaysArray()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const selectedDayBillings = getSelectedDayData()
  const selectedDayTotal = selectedDayBillings.reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text mb-1">Billing Calendar</h1>
        <p className="text-muted text-sm">Track subscription charges throughout the month</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-text font-medium text-lg">{monthNames[monthData.month]} {monthData.year}</h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-card-hover rounded-lg transition-colors text-muted hover:text-text"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-card-hover rounded-lg transition-colors text-muted hover:text-text"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-muted text-xs font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const hasBillings = day && monthData.billingsByDay[day]
                const today = isToday(day)
                const selected = day === selectedDay

                return (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    whileHover={day ? { scale: 1.05 } : {}}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all ${
                      day === null
                        ? ''
                        : today
                        ? 'bg-accent/10 border-2 border-accent font-semibold text-accent'
                        : selected
                        ? 'bg-accent/20 border border-accent'
                        : hasBillings
                        ? 'bg-card-hover border border-border hover:border-accent/50'
                        : 'bg-card-hover border border-transparent hover:border-border text-muted'
                    }`}
                  >
                    {day && (
                      <>
                        <span className={today ? 'text-accent' : 'text-text'}>{day}</span>
                        {hasBillings && (
                          <div className="absolute bottom-1 flex gap-1 flex-wrap justify-center px-1">
                            {monthData.billingsByDay[day].slice(0, 3).map((sub, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: sub.color || '#2a2a3d' }}
                              />
                            ))}
                            {monthData.billingsByDay[day].length > 3 && (
                              <div className="text-xs text-muted">+{monthData.billingsByDay[day].length - 3}</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-muted text-xs mb-1">This Month Total</p>
              <p className="text-text font-display text-2xl font-bold">${monthTotals.current.toFixed(2)}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-muted text-xs mb-1">Next Month Total</p>
              <p className="text-accent font-display text-2xl font-bold">${monthTotals.next.toFixed(2)}</p>
            </div>
          </div>

          <AnimatePresence>
            {selectedDay && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-accent/5 border border-accent/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-text font-medium text-sm">
                    {monthNames[monthData.month]} {selectedDay}
                  </p>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-muted hover:text-text transition-colors"
                  >
                    ×
                  </button>
                </div>

                {selectedDayBillings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayBillings.map((sub, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: sub.color || '#2a2a3d' }}
                        />
                        <div className="flex-1">
                          <p className="text-text text-sm font-medium">{sub.name}</p>
                          <p className="text-muted text-xs">${sub.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-accent/20 pt-3 mt-3">
                      <p className="text-accent font-medium text-sm flex items-center justify-between">
                        <span>Total</span>
                        <span>${selectedDayTotal.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-xs">No billings this day</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
