function getApiKey() {
  return localStorage.getItem('subtrack_api_key') || import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

export async function analyzeTransactions(rawText) {
  const API_KEY = getApiKey()
  if (!API_KEY) throw new Error('API key not set. Please add your Anthropic API key in Settings.')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a financial assistant that identifies subscriptions from bank statements or transaction history.

Analyze the following transaction data and extract ALL recurring subscriptions, autopay charges, and membership fees.

For each subscription found, return a JSON object. Be very thorough — catch even obscure services.

TRANSACTION DATA:
${rawText}

Return ONLY a JSON array (no markdown, no explanation) like:
[
  {
    "name": "Service Name",
    "amount": 9.99,
    "currency": "USD",
    "cycle": "monthly",
    "category": "Entertainment",
    "color": "#hex",
    "confidence": "high|medium|low",
    "risk": "none|low|medium|high",
    "riskReason": "Why this might be unwanted (or empty string)",
    "nextBilling": "YYYY-MM-DD estimated",
    "notes": "Any relevant notes"
  }
]

Categories: Entertainment, AI Tools, Software, Shopping, Health, Finance, News, Education, Gaming, Utilities, Other
Risk levels: 'high' = duplicate or likely forgotten, 'medium' = rarely used, 'low' = seems active, 'none' = clearly active`
      }]
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'AI analysis failed')
  }

  const data = await response.json()
  const text = data.content[0].text.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function getAIInsights(subscriptions) {
  const API_KEY = getApiKey()
  if (!API_KEY) throw new Error('API key not set. Please add your Anthropic API key in Settings.')

  const total = subscriptions.reduce((s, sub) => {
    const m = sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount
    return s + m
  }, 0).toFixed(2)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are a subscription spending advisor. Analyze these subscriptions and give sharp, actionable insights.

SUBSCRIPTIONS (total: $${total}/month):
${JSON.stringify(subscriptions, null, 2)}

Return ONLY a JSON object (no markdown):
{
  "summary": "2-3 sentence sharp honest summary of their spending",
  "savingsOpportunity": 12.50,
  "savingsNote": "How much they could save and how",
  "insights": [
    { "type": "warning|tip|info", "title": "Short title", "body": "Actionable insight" }
  ],
  "duplicates": ["Name of possible duplicate pairs"],
  "forgottenRisk": ["Services that look potentially abandoned"]
}`
      }]
    })
  })

  if (!response.ok) throw new Error('AI insights failed')
  const data = await response.json()
  const text = data.content[0].text.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function chatWithAI(messages, subscriptions) {
  const API_KEY = getApiKey()
  if (!API_KEY) throw new Error('API key not set. Please add your Anthropic API key in Settings.')

  const context = `The user has ${subscriptions.length} subscriptions totaling $${
    subscriptions.reduce((s, sub) => s + (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount), 0).toFixed(2)
  }/month. Their subscriptions: ${subscriptions.map(s => `${s.name} ($${s.amount}/${s.cycle})`).join(', ')}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are SubTrack AI, a helpful subscription management assistant. Be concise, direct, and actionable. Context: ${context}`,
      messages
    })
  })

  if (!response.ok) throw new Error('Chat failed')
  const data = await response.json()
  return data.content[0].text
}
