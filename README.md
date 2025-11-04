# FlowBoard

> An AI-powered Focus Management App inspired by neuroscience and the "1-90-0" deep work method.

FlowBoard is not just a Kanban board — it's a **flow-state system** that helps you rewire your focus, eliminate distractions, and achieve deep work sessions. Each task card becomes a mini flow challenge.

## Features

### 🎯 Flow Kanban Board
- **Dynamic Columns**: TODO, In Progress, Done (with ability to add custom columns)
- **Beautiful Cards**: Each card includes title, description, notes, and an AI Focus Coach panel
- **Smooth Animations**: Buttery drag-and-drop transitions powered by Framer Motion
- **Minimal UI**: Built with Next.js 14 (App Router) and Tailwind CSS v3

### 🧠 Focus Mode (1-90-0 System)
- **Immersive Experience**: Full-screen view that hides UI clutter
- **Smart Timer**: Defaults to 90 minutes (editable), with visual "flow energy" meter
- **Breathing Animations**: Subtle background animations to maintain calm focus
- **AI Reflection**: After each session, AI prompts reflection questions

### 🤖 AI Flow Coach
Uses OpenAI API to provide:
- Task breakdown into "flow-optimized" chunks
- Dopamine detox reminders
- Motivational insights based on previous sessions
- Auto-generated session summaries

### 📊 Dopamine Detox Tracker
Dashboard showing:
- **Current Streak**: Consecutive days with focus sessions
- **Total Focus Time**: Cumulative hours and minutes
- **Sessions Completed**: Total number of completed sessions
- **Average Focus Quality**: Visual feedback with energy meter

### 🎨 Design & Motion
- Clean, handwritten-meets-modern UI aesthetic
- Breathing background animations during focus mode
- Smooth card animations with Framer Motion
- Color palette: Red (#ff3333), Yellow (#ffff00), Blue (#0066ff)

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS v3
- Framer Motion
- OpenAI API
- Local Storage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Tasks
1. Click "+" in any column
2. Enter task details
3. Click "Create Task"

### Focus Mode
1. Click "Enter Focus Mode" on a task card
2. Start the 90-minute timer
3. Work in deep focus
4. Complete reflection questions

### AI Features (Optional)
Add your OpenAI API key in the AI Coach panel to enable:
- Task breakdowns
- Dopamine detox tips
- Session summaries
- Motivational insights

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

## License

MIT License

---

**Built with ❤️ and deep focus**
