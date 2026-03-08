import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, Bot, User, Loader, Zap, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { chatWithAI } from '../utils/ai'

const CONVERSATION_STARTERS = {
  savings: {
    title: 'Savings',
    icon: '💰',
    questions: [
      "Which subscriptions am I wasting money on?",
      "How much could I save if I cancel flagged ones?",
      "What's my highest spending category?",
    ]
  },
  duplicates: {
    title: 'Duplicates',
    icon: '⚡',
    questions: [
      "Which subscriptions overlap or duplicate?",
      "Which AI tools should I consolidate?",
      "Do I have overlapping storage services?",
    ]
  },
  upcoming: {
    title: 'Upcoming Bills',
    icon: '📅',
    questions: [
      "When are my next renewals?",
      "Which bills are coming up this month?",
      "Show me my billing calendar",
    ]
  },
  recommendations: {
    title: 'Recommendations',
    icon: '✨',
    questions: [
      "What should I keep and what should I cancel?",
      "Are there better alternatives for my services?",
      "How can I optimize my subscriptions?",
    ]
  }
}

export default function Chat({ subscriptions }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const generateQuickActions = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return []

    const actions = []
    const categories = {}
    const names = new Set()

    subscriptions.forEach(sub => {
      categories[sub.category] = (categories[sub.category] || 0) + 1
      names.add(sub.name)
    })

    const multipleCategories = Object.entries(categories).filter(([_, count]) => count > 1)
    if (multipleCategories.length > 0 && multipleCategories[0][1] >= 2) {
      const category = multipleCategories[0][0]
      const count = multipleCategories[0][1]
      actions.push(`Should I keep all ${count} ${category.toLowerCase()} subscriptions?`)
    }

    const aiTools = subscriptions.filter(s =>
      ['AI', 'Productivity'].includes(s.category) ||
      s.name.toLowerCase().match(/chatgpt|claude|gemini|copilot|notion.*ai/i)
    )
    if (aiTools.length >= 2) {
      actions.push(`I have ${aiTools.length} AI tools - should I consolidate?`)
    }

    const flagged = subscriptions.filter(s => s.status === 'flagged')
    if (flagged.length > 0) {
      actions.push(`Should I cancel these ${flagged.length} flagged subscriptions?`)
    }

    const expensive = subscriptions.sort((a, b) => b.amount - a.amount).slice(0, 3)
    if (expensive.length > 0 && expensive[0].amount > 50) {
      actions.push(`Is ${expensive[0].name} worth $${expensive[0].amount}/month?`)
    }

    return actions.slice(0, 3)
  }, [subscriptions])

  const renderMarkdown = (text) => {
    const lines = text.split('\n')
    const elements = []

    lines.forEach((line, idx) => {
      if (line.startsWith('# ')) {
        elements.push(<h2 key={idx} className="text-base font-bold mt-3 mb-2">{line.substring(2)}</h2>)
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={idx} className="text-sm font-semibold mt-2 mb-1">{line.substring(3)}</h3>)
      } else if (line.startsWith('- ')) {
        elements.push(<li key={idx} className="ml-4 list-disc">{line.substring(2)}</li>)
      } else if (line.startsWith('* ')) {
        elements.push(<li key={idx} className="ml-4 list-disc">{line.substring(2)}</li>)
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-1" />)
      } else {
        const parts = []
        let lastIdx = 0
        const boldRegex = /\*\*(.*?)\*\*/g
        let match

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIdx) {
            parts.push(line.substring(lastIdx, match.index))
          }
          parts.push(<strong key={`b${match.index}`}>{match[1]}</strong>)
          lastIdx = match.index + match[0].length
        }
        if (lastIdx < line.length) {
          parts.push(line.substring(lastIdx))
        }

        if (parts.length === 0) {
          elements.push(<p key={idx} className={idx > 0 ? 'mt-1' : ''}>{line}</p>)
        } else {
          elements.push(<p key={idx} className={idx > 0 ? 'mt-1' : ''}>{parts}</p>)
        }
      }
    })

    return <div className="space-y-1">{elements}</div>
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const send = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const reply = await chatWithAI(newMessages, subscriptions)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ Error: ${e.message}. Make sure your API key is configured in .env` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col p-8 pb-0 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center glow-accent">
            <Bot size={18} className="text-accent" />
          </div>
          <h1 className="font-display text-3xl text-text">Ask AI</h1>
        </div>
        <p className="text-muted text-sm">Ask anything about your subscriptions. Get personalized advice and insights.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 glow-accent">
                <Zap size={28} className="text-accent" />
              </div>
              <p className="text-text text-lg mb-2">SubTrack AI is ready</p>
              <p className="text-muted text-sm">Ask me anything about your subscriptions and spending</p>
            </div>

            {generateQuickActions.length > 0 && (
              <div className="mb-8">
                <p className="text-xs text-muted font-mono uppercase tracking-wider mb-3">QUICK ACTIONS</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {generateQuickActions.map((action, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => send(action)}
                      className="text-xs px-4 py-3 bg-accent/10 border border-accent/30 rounded-xl text-text hover:bg-accent/20 hover:border-accent/50 transition-colors text-left font-medium"
                    >
                      {action}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted font-mono uppercase tracking-wider mb-3">CONVERSATION STARTERS</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CONVERSATION_STARTERS).map(([key, group]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + Object.keys(CONVERSATION_STARTERS).indexOf(key) * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <p className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                      <span>{group.icon}</span>
                      {group.title}
                    </p>
                    <div className="space-y-2">
                      {group.questions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => send(q)}
                          className="text-xs w-full text-left px-3 py-2 text-muted hover:text-text hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={13} className="text-accent" />
              </div>
            )}
            <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-accent/10 border border-accent/20 text-text'
                : 'bg-card border border-border text-text group relative'
            }`}>
              {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.content, i)}
                  className="absolute -top-2 -right-2 p-2 rounded-lg bg-card border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/10"
                  title="Copy response"
                >
                  {copiedIndex === i ? (
                    <Check size={14} className="text-accent" />
                  ) : (
                    <Copy size={14} className="text-muted hover:text-text" />
                  )}
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-border flex items-center justify-center flex-shrink-0 mt-1">
                <User size={13} className="text-muted" />
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-accent" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border py-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your subscriptions..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-accent"
          >
            <Send size={16} className="text-bg" />
          </button>
        </div>
      </div>
    </div>
  )
}
