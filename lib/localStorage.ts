// FlowBoard localStorage utilities

import {
  Task,
  Column,
  FocusSession,
  AppSettings,
  DopamineStats,
  BoardState,
  DEFAULT_COLUMNS,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
} from "./types";

const STORAGE_KEYS = {
  TASKS: "flowboard_tasks",
  COLUMNS: "flowboard_columns",
  SETTINGS: "flowboard_settings",
  STATS: "flowboard_stats",
  SESSIONS: "flowboard_sessions",
};

// Helper to safely parse JSON from localStorage
function safeJSONParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Tasks
export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  return safeJSONParse<Task[]>(tasks, []);
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "focusSessions">): Task {
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    focusSessions: [],
  };
  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: Date.now(),
  };
  saveTasks(tasks);
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}

export function getTask(id: string): Task | null {
  const tasks = getTasks();
  return tasks.find((t) => t.id === id) || null;
}

// Columns
export function getColumns(): Column[] {
  if (typeof window === "undefined") return DEFAULT_COLUMNS;
  const columns = localStorage.getItem(STORAGE_KEYS.COLUMNS);
  const parsed = safeJSONParse<Column[]>(columns, []);
  return parsed.length > 0 ? parsed : DEFAULT_COLUMNS;
}

export function saveColumns(columns: Column[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(columns));
}

export function addColumn(title: string): Column {
  const columns = getColumns();
  const newColumn: Column = {
    id: crypto.randomUUID(),
    title,
    position: columns.length,
    createdAt: Date.now(),
  };
  columns.push(newColumn);
  saveColumns(columns);
  return newColumn;
}

export function updateColumn(id: string, updates: Partial<Column>): Column | null {
  const columns = getColumns();
  const index = columns.findIndex((c) => c.id === id);
  if (index === -1) return null;

  columns[index] = {
    ...columns[index],
    ...updates,
  };
  saveColumns(columns);
  return columns[index];
}

export function deleteColumn(id: string): boolean {
  const columns = getColumns();
  const filtered = columns.filter((c) => c.id !== id);
  if (filtered.length === columns.length) return false;
  saveColumns(filtered);

  // Move tasks from deleted column to first column
  const tasks = getTasks();
  const firstColumn = filtered[0];
  if (firstColumn) {
    const updatedTasks = tasks.map((task) =>
      task.columnId === id ? { ...task, columnId: firstColumn.id } : task
    );
    saveTasks(updatedTasks);
  }

  return true;
}

// Settings
export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return safeJSONParse<AppSettings>(settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const settings = getSettings();
  const updated = { ...settings, ...updates };
  saveSettings(updated);
  return updated;
}

// Stats
export function getStats(): DopamineStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  const stats = localStorage.getItem(STORAGE_KEYS.STATS);
  return safeJSONParse<DopamineStats>(stats, DEFAULT_STATS);
}

export function saveStats(stats: DopamineStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

export function updateStats(updates: Partial<DopamineStats>): DopamineStats {
  const stats = getStats();
  const updated = { ...stats, ...updates };
  saveStats(updated);
  return updated;
}

// Focus Sessions
export function getAllSessions(): FocusSession[] {
  if (typeof window === "undefined") return [];
  const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return safeJSONParse<FocusSession[]>(sessions, []);
}

export function saveSessions(sessions: FocusSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function addSession(
  session: Omit<FocusSession, "id">
): FocusSession {
  const newSession: FocusSession = {
    ...session,
    id: crypto.randomUUID(),
  };
  const sessions = getAllSessions();
  sessions.push(newSession);
  saveSessions(sessions);

  // Update task's focusSessions
  const task = getTask(session.taskId);
  if (task) {
    task.focusSessions.push(newSession);
    updateTask(task.id, { focusSessions: task.focusSessions });
  }

  // Update stats
  if (session.endTime && session.focusQuality) {
    const stats = getStats();
    const sessions = getAllSessions();
    const completedSessions = sessions.filter((s) => s.endTime && s.focusQuality);

    const totalQuality = completedSessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0);
    const avgQuality = completedSessions.length > 0 ? totalQuality / completedSessions.length : 0;

    updateStats({
      totalFocusTime: stats.totalFocusTime + session.duration,
      sessionsCompleted: stats.sessionsCompleted + 1,
      averageFocusQuality: avgQuality,
      lastSessionDate: Date.now(),
    });

    // Update streak
    updateStreak();
  }

  return newSession;
}

export function updateSession(id: string, updates: Partial<FocusSession>): FocusSession | null {
  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  sessions[index] = {
    ...sessions[index],
    ...updates,
  };
  saveSessions(sessions);

  // Update task's focusSessions
  const task = getTask(sessions[index].taskId);
  if (task) {
    const sessionIndex = task.focusSessions.findIndex((s) => s.id === id);
    if (sessionIndex !== -1) {
      task.focusSessions[sessionIndex] = sessions[index];
      updateTask(task.id, { focusSessions: task.focusSessions });
    }
  }

  return sessions[index];
}

// Calculate and update streak
function updateStreak(): void {
  const sessions = getAllSessions();
  if (sessions.length === 0) return;

  const completedSessions = sessions
    .filter((s) => s.endTime && s.focusQuality)
    .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));

  if (completedSessions.length === 0) return;

  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 24 * 60 * 60 * 1000;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let currentDate = today;

  for (const session of completedSessions) {
    const sessionDate = new Date(session.endTime!).setHours(0, 0, 0, 0);

    if (sessionDate === currentDate || sessionDate === yesterday) {
      tempStreak++;
      currentDate = sessionDate - 24 * 60 * 60 * 1000;
    } else if (sessionDate < currentDate - 24 * 60 * 60 * 1000) {
      break;
    }
  }

  currentStreak = tempStreak;

  // Calculate longest streak
  const sessionDates = new Set(
    completedSessions.map((s) => new Date(s.endTime!).setHours(0, 0, 0, 0))
  );
  const sortedDates = Array.from(sessionDates).sort((a, b) => b - a);

  tempStreak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0 || sortedDates[i] === sortedDates[i - 1] - 24 * 60 * 60 * 1000) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  const stats = getStats();
  updateStats({
    ...stats,
    currentStreak,
    longestStreak: Math.max(stats.longestStreak, longestStreak),
  });
}

// Complete board state
export function getBoardState(): BoardState {
  return {
    tasks: getTasks(),
    columns: getColumns(),
    settings: getSettings(),
    stats: getStats(),
  };
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
