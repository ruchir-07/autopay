# 🔍 SubTrack AI — Know Every Charge

An AI-powered subscription tracker that helps you discover, monitor, and manage every subscription and autopay charge — so you never pay for something you forgot about.

## ✨ Features

- **📊 Dashboard** — Visual overview of monthly/yearly spend, charts by category, upcoming charges
- **💳 Subscription Manager** — Add, edit, flag, and delete subscriptions with full filtering
- **🤖 AI Analyzer** — Paste your bank statement; AI detects and flags suspicious/forgotten subscriptions
- **💬 Ask AI** — Chat with an AI assistant about your spending habits and get personalized advice  
- **⚠️ Alerts** — Review flagged subscriptions, run AI spending analysis to find savings opportunities
- **⚙️ Settings** — Manage API key, export data, clear storage

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd subtrack-ai
npm install
```

### 2. Set Your Anthropic API Key

Copy the env file and add your key:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com)

### 3. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🏗 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── StatCard.jsx         # Dashboard stat tiles
│   ├── SubscriptionCard.jsx # Individual subscription card
│   └── SubModal.jsx         # Add/Edit subscription modal
├── hooks/
│   └── useSubscriptions.js  # Local storage data layer
├── pages/
│   ├── Dashboard.jsx        # Main dashboard with charts
│   ├── Subscriptions.jsx    # Full list with filters
│   ├── Analyzer.jsx         # AI bank statement analyzer
│   ├── Chat.jsx             # AI chatbot
│   ├── Alerts.jsx           # Flagged subscriptions + AI insights
│   └── Settings.jsx         # API key + data management
├── utils/
│   └── ai.js                # Anthropic API integration
└── App.jsx                  # Root with routing
```

## 🔐 Privacy

All subscription data is stored locally in your browser (`localStorage`). **Nothing is sent to any server** except:
- Anthropic API calls for AI features (your transaction text is sent to Claude for analysis)

## 🛠 Tech Stack

- **React 18** + **Vite** — Fast development
- **React Router** — Client-side routing
- **Tailwind CSS** — Styling
- **Recharts** — Charts and data visualization
- **Anthropic Claude** — AI analysis, insights, and chat
- **date-fns** — Date utilities
- **Framer Motion** — Animations

## 💡 How to Use the AI Analyzer

1. Log into your bank's website and find your transaction history
2. Copy and paste the transactions into the **AI Analyzer** page
3. SubTrack AI will identify all subscriptions, estimate billing cycles, and flag anything suspicious
4. Click **Add** to import them into your tracker

## 📦 Build for Production

```bash
npm run build
```

---

Built with ❤️ to solve the problem of forgotten subscription charges.
