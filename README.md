# 🧠 FlowBoard - AI-Powered Focus Management SaaS

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com/)

**Master deep work. Achieve flow state. Build your focus superpower.**

FlowBoard is not just a Kanban board — it's a **subscription-based flow-state system** that helps you achieve *real* deep work through neuroscience-backed methods (1-90-0), AI coaching, gamification, and advanced analytics.

🚀 **Now with cloud sync, subscriptions, and premium features!**

## ✨ Features

### 🎯 **Flow Kanban Board**
- Dynamic columns (TODO, In Progress, Done + custom)
- Beautiful task cards with rich metadata
- Smooth drag-and-drop (Framer Motion + dnd-kit)
- Cloud sync across all devices ☁️

### 🧠 **Focus Mode (1-90-0 System)**
- **1 minute** prep, **90 minutes** deep focus, **0 distractions**
- Immersive full-screen experience
- Visual energy meter tracks flow state
- Breathing background animations

### 🤖 **AI Flow Coach** (No API key required!)
- **Task Breakdown**: Optimize work for flow
- **Dopamine Detox**: Pre-session prep tips
- **Motivational Insights**: Progress-based encouragement
- **Session Summaries**: AI-generated reflections
- **Usage limits**: 5/month free, unlimited Pro/Elite

### 📊 **Advanced Analytics** (Pro+)
- **Hourly Heatmap**: Discover your peak focus times
- **Task Velocity**: Which tasks = best flow?
- **Distraction Patterns**: AI detects blockers
- **Energy Curves**: Visualize focus over time
- **Benchmarks**: Compare vs. top performers

### 🎮 **Gamification** (Coming Soon)
- Weekly challenges & seasonal leagues
- Achievement badges (Zen Master, Peak State Warrior)
- Streak tracking with dopamine detox rewards
- Leaderboards & boss battles

### ☁️ **Cloud Sync & Auth**
- Email/password authentication
- Google & GitHub OAuth
- Real-time sync across devices
- Automatic localStorage migration
- No data loss ever!

### 💳 **Subscription Tiers**
- **Free**: Local storage, 5 AI requests/month
- **Pro ($12/mo)**: Cloud sync, unlimited AI, analytics
- **Elite ($29/mo)**: Teams, adaptive AI, integrations

### 🎨 **Design & Motion**
- shadcn/ui component library
- Tailwind CSS v4 styling
- Smooth animations everywhere
- Dark mode support
- Mobile-responsive

## 🏗️ Tech Stack

**Frontend:**
- Next.js 16 (App Router, Server Components)
- React 19 with hooks
- TypeScript (strict mode)
- Tailwind CSS v4
- Framer Motion (animations)
- shadcn/ui + Radix UI

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime)
- Next.js API Routes (serverless)
- Stripe (subscriptions + payments)
- OpenAI API (GPT-4o-mini)

**DevOps:**
- Vercel (hosting)
- GitHub Actions (CI/CD)
- Stripe CLI (webhooks)

## 🚀 Quick Start

### 1. Install dependencies:
```bash
npm install
```

### 2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### 3. Run database migration:
- Go to your Supabase project
- Run the SQL in `supabase/migrations/001_initial_schema.sql`

### 4. Start development server:
```bash
npm run dev
```

### 5. Open [http://localhost:3000](http://localhost:3000)

📖 **Full setup guide:** See [SETUP.md](./SETUP.md) for detailed instructions

## 💡 Usage

### Sign Up & Get Started
1. Create an account at `/auth/signup`
2. Choose email/password or OAuth (Google/GitHub)
3. Your existing local data will auto-migrate to cloud ☁️

### Create & Manage Tasks
1. Click "+" in any column to add tasks
2. Drag and drop between columns
3. Edit, delete, or add notes anytime
4. All changes sync automatically (Pro+)

### Enter Flow State
1. Click "Enter Focus Mode" on any task
2. Configure session duration (15-120 min)
3. Hit "Start" and go deep 🧠
4. Visual energy meter tracks your flow
5. Complete post-session reflection

### Use AI Coach
- No API key needed (included in Pro/Elite!)
- Click AI panel on any task card
- Choose coaching type:
  - Task Breakdown
  - Dopamine Detox
  - Motivational Insight
  - Session Summary
- Free: 5 requests/month
- Pro/Elite: Unlimited

### View Analytics
- Go to `/analytics` (Pro+ only)
- See hourly heatmap of peak focus times
- Track task velocity & distraction patterns
- Compare against top performers

### Upgrade Your Plan
- Go to `/pricing` to view tiers
- Choose Pro ($12/mo) or Elite ($29/mo)
- One-click Stripe Checkout
- Manage subscription in Settings

## Project Structure

```
flowboard/
├── app/              # Next.js pages and API routes
├── components/       # React components
│   ├── board/       # Kanban board components
│   ├── focus/       # Focus mode components
│   └── dashboard/   # Stats dashboard
├── lib/             # Utilities and types
└── public/          # Static assets
```

## 📊 Revenue Model

**Projected Growth:**
- Year 1: $36K ARR (3,866 users, 5% conversion)
- Year 2: $150K ARR (10K users + enterprise)
- Year 3: $500K+ ARR (25K users, market fit)

**Why Subscription-Worthy:**
1. ☁️ Cloud sync = no data loss (strong retention)
2. 🤖 Included AI = high perceived value
3. 📊 Advanced analytics = ongoing insights
4. 🎮 Gamification = habit formation
5. 👥 Team features = B2B expansion

## 🗺️ Roadmap

- [x] Phase 1: Foundation (auth, cloud sync, subscriptions, AI, analytics)
- [ ] Phase 2: Gamification, teams, browser extension
- [ ] Phase 3: Mobile apps, integrations, marketplace

See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for detailed roadmap.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Submit a PR with tests

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 🧠 for deep work**

[📖 Documentation](./SETUP.md) • [💰 Pricing](/pricing) • [📊 Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

Made with Next.js, Supabase, Stripe, and OpenAI

</div>
