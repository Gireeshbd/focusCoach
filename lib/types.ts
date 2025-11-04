// FlowBoard Type Definitions

export interface Task {
  id: string;
  title: string;
  description: string;
  notes: string;
  columnId: string;
  position: number;
  createdAt: number;
  updatedAt: number;
  focusSessions: FocusSession[];
}

export interface Column {
  id: string;
  title: string;
  position: number;
  createdAt: number;
}

export interface FocusSession {
  id: string;
  taskId: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in milliseconds
  targetDuration: number; // in milliseconds (default 90 * 60 * 1000)
  focusQuality: number | null; // 1-10 scale
  distractions: string[];
  reflection: {
    focusDepth: string;
    whatDistracted: string;
    whatsNext: string;
  } | null;
  aiSummary: string | null;
}

export interface DopamineStats {
  totalFocusTime: number; // in milliseconds
  totalDistractionTime: number; // in milliseconds
  currentStreak: number; // number of consecutive days with at least one session
  longestStreak: number;
  lastSessionDate: number | null;
  sessionsCompleted: number;
  averageFocusQuality: number;
}

export interface AppSettings {
  defaultFocusTime: number; // in minutes
  enableWarmup: boolean;
  warmupDuration: number; // in minutes
  openAIApiKey: string | null;
}

export interface BoardState {
  tasks: Task[];
  columns: Column[];
  settings: AppSettings;
  stats: DopamineStats;
}

// Default values
export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "TODO", position: 0, createdAt: Date.now() },
  { id: "in-progress", title: "In Progress", position: 1, createdAt: Date.now() },
  { id: "done", title: "Done", position: 2, createdAt: Date.now() },
];

export const DEFAULT_SETTINGS: AppSettings = {
  defaultFocusTime: 90,
  enableWarmup: false,
  warmupDuration: 15,
  openAIApiKey: null,
};

export const DEFAULT_STATS: DopamineStats = {
  totalFocusTime: 0,
  totalDistractionTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  sessionsCompleted: 0,
  averageFocusQuality: 0,
};
