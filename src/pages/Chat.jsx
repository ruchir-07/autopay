import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader, Zap } from 'lucide-react'
import { chatWithAI } from '../utils/ai'

const SUGGESTIONS = [
  "Which subscriptions am I wasting money on?",
  "What's my most expensive category?",
  "Which subscriptions overlap or duplicate?",
  "How much could I save if I cancel flagged ones?",
  "Which AI tools should I consolidate?",
]

export default function Chat({ subscriptions }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 glow-accent">
              <Zap size={28} className="text-accent" />
            </div>
            <p className="text-text text-lg mb-2">SubTrack AI is ready</p>
            <p className="text-muted text-sm mb-8">Ask me anything about your subscriptions and spending</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-2 bg-card border border-border rounded-xl text-muted hover:text-text hover:border-accent/30 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={13} className="text-accent" />
              </div>
            )}
            <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-accent/10 border border-accent/20 text-text'
                : 'bg-card border border-border text-text'
            }`}>
              {msg.content.split('\n').map((line, j) => (
                <p key={j} className={j > 0 ? 'mt-1.5' : ''}>{line}</p>
              ))}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-border flex items-center justify-center flex-shrink-0 mt-1">
                <User size={13} className="text-muted" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-accent" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <Loader size={14} className="text-muted animate-spin" />
            </div>
          </div>
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
