import { getSupabaseClient } from '../supabase/client'
import type { Database } from '../supabase/database.types'
import type { Task, Column, FocusSession, DopamineStats } from '../types'

type DbTask = Database['public']['Tables']['tasks']['Row']
type DbColumn = Database['public']['Tables']['columns']['Row']
type DbFocusSession = Database['public']['Tables']['focus_sessions']['Row']
type DbUserStats = Database['public']['Tables']['user_stats']['Row']

export class CloudSyncService {
  private supabase = getSupabaseClient()
  private syncInProgress = false

  /**
   * Migrate local data to cloud on first login
   */
  async migrateLocalDataToCloud(userId: string, localData: {
    tasks: Task[]
    columns: Column[]
    stats?: DopamineStats
  }) {
    if (this.syncInProgress) return
    this.syncInProgress = true

    try {
      // Get user's personal workspace
      const { data: workspace } = await this.supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId)
        .eq('workspace_type', 'personal')
        .single()

      if (!workspace) throw new Error('No personal workspace found')

      // Migrate columns
      const columnsToInsert = localData.columns.map(col => ({
        id: col.id,
        user_id: userId,
        workspace_id: workspace.id,
        title: col.title,
        position: col.position,
        created_at: col.createdAt,
      }))

      const { error: columnsError } = await this.supabase
        .from('columns')
        .upsert(columnsToInsert, { onConflict: 'id' })

      if (columnsError) throw columnsError

      // Migrate tasks
      const tasksToInsert = localData.tasks.map(task => ({
        id: task.id,
        user_id: userId,
        workspace_id: workspace.id,
        column_id: task.columnId,
        title: task.title,
        description: task.description || null,
        notes: task.notes || null,
        position: task.position,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      }))

      const { error: tasksError } = await this.supabase
        .from('tasks')
        .upsert(tasksToInsert, { onConflict: 'id' })

      if (tasksError) throw tasksError

      // Migrate focus sessions
      const allSessions: FocusSession[] = []
      localData.tasks.forEach(task => {
        if (task.focusSessions) {
          allSessions.push(...task.focusSessions)
        }
      })

      if (allSessions.length > 0) {
        const sessionsToInsert = allSessions.map(session => ({
          id: session.id,
          user_id: userId,
          task_id: session.taskId,
          start_time: session.startTime,
          end_time: session.endTime || null,
          duration: session.duration,
          target_duration: session.targetDuration,
          focus_quality: session.focusQuality || null,
          reflection: session.reflection as any,
          distractions: session.distractions || [],
          ai_summary: session.aiSummary || null,
        }))

        const { error: sessionsError } = await this.supabase
          .from('focus_sessions')
          .upsert(sessionsToInsert, { onConflict: 'id' })

        if (sessionsError) throw sessionsError
      }

      // Update stats (stats are auto-created on user signup, so we just update)
      if (localData.stats) {
        const { error: statsError } = await this.supabase
          .from('user_stats')
          .update({
            total_focus_time: localData.stats.totalFocusTime,
            total_distraction_time: localData.stats.totalDistractionTime,
            current_streak: localData.stats.currentStreak,
            longest_streak: localData.stats.longestStreak,
            last_session_date: localData.stats.lastSessionDate || null,
            sessions_completed: localData.stats.sessionsCompleted,
            average_focus_quality: localData.stats.averageFocusQuality,
          })
          .eq('user_id', userId)

        if (statsError) throw statsError
      }

      console.log('✅ Local data migrated to cloud successfully')
      return true
    } catch (error) {
      console.error('❌ Error migrating local data:', error)
      throw error
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Fetch all user data from cloud
   */
  async fetchAllData(userId: string) {
    try {
      // Get personal workspace
      const { data: workspace } = await this.supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId)
        .eq('workspace_type', 'personal')
        .single()

      if (!workspace) throw new Error('No personal workspace found')

      // Fetch columns
      const { data: dbColumns, error: columnsError } = await this.supabase
        .from('columns')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspace.id)
        .order('position')

      if (columnsError) throw columnsError

      // Fetch tasks
      const { data: dbTasks, error: tasksError } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspace.id)
        .order('position')

      if (tasksError) throw tasksError

      // Fetch focus sessions
      const { data: dbSessions, error: sessionsError } = await this.supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (sessionsError) throw sessionsError

      // Fetch stats
      const { data: dbStats, error: statsError } = await this.supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (statsError) throw statsError

      // Transform to local format
      const columns: Column[] = dbColumns?.map(this.dbColumnToLocal) || []
      const tasks: Task[] = dbTasks?.map(dbTask => {
        const taskSessions = dbSessions?.filter(s => s.task_id === dbTask.id) || []
        return this.dbTaskToLocal(dbTask, taskSessions)
      }) || []
      const stats: DopamineStats = this.dbStatsToLocal(dbStats)

      return { columns, tasks, stats, workspaceId: workspace.id }
    } catch (error) {
      console.error('Error fetching cloud data:', error)
      throw error
    }
  }

  /**
   * Sync specific task to cloud
   */
  async syncTask(userId: string, workspaceId: string, task: Task) {
    try {
      const dbTask = {
        id: task.id,
        user_id: userId,
        workspace_id: workspaceId,
        column_id: task.columnId,
        title: task.title,
        description: task.description || null,
        notes: task.notes || null,
        position: task.position,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      }

      const { error } = await this.supabase
        .from('tasks')
        .upsert(dbTask, { onConflict: 'id' })

      if (error) throw error
    } catch (error) {
      console.error('Error syncing task:', error)
      throw error
    }
  }

  /**
   * Sync columns to cloud
   */
  async syncColumns(userId: string, workspaceId: string, columns: Column[]) {
    try {
      const dbColumns = columns.map(col => ({
        id: col.id,
        user_id: userId,
        workspace_id: workspaceId,
        title: col.title,
        position: col.position,
        created_at: col.createdAt,
      }))

      const { error } = await this.supabase
        .from('columns')
        .upsert(dbColumns, { onConflict: 'id' })

      if (error) throw error
    } catch (error) {
      console.error('Error syncing columns:', error)
      throw error
    }
  }

  /**
   * Sync focus session to cloud
   */
  async syncFocusSession(userId: string, session: FocusSession) {
    try {
      const dbSession = {
        id: session.id,
        user_id: userId,
        task_id: session.taskId,
        start_time: session.startTime,
        end_time: session.endTime || null,
        duration: session.duration,
        target_duration: session.targetDuration,
        focus_quality: session.focusQuality || null,
        reflection: session.reflection as any,
        distractions: session.distractions || [],
        ai_summary: session.aiSummary || null,
      }

      const { error } = await this.supabase
        .from('focus_sessions')
        .upsert(dbSession, { onConflict: 'id' })

      if (error) throw error
    } catch (error) {
      console.error('Error syncing focus session:', error)
      throw error
    }
  }

  /**
   * Delete task from cloud
   */
  async deleteTask(taskId: string) {
    try {
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  /**
   * Delete column from cloud
   */
  async deleteColumn(columnId: string) {
    try {
      const { error } = await this.supabase
        .from('columns')
        .delete()
        .eq('id', columnId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting column:', error)
      throw error
    }
  }

  // Transform functions
  private dbColumnToLocal(dbColumn: DbColumn): Column {
    return {
      id: dbColumn.id,
      title: dbColumn.title,
      position: dbColumn.position,
      createdAt: dbColumn.created_at,
    }
  }

  private dbTaskToLocal(dbTask: DbTask, dbSessions: DbFocusSession[]): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || undefined,
      notes: dbTask.notes || undefined,
      columnId: dbTask.column_id,
      position: dbTask.position,
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at,
      focusSessions: dbSessions.map(this.dbSessionToLocal),
    }
  }

  private dbSessionToLocal(dbSession: DbFocusSession): FocusSession {
    return {
      id: dbSession.id,
      taskId: dbSession.task_id,
      startTime: dbSession.start_time,
      endTime: dbSession.end_time || undefined,
      duration: dbSession.duration,
      targetDuration: dbSession.target_duration,
      focusQuality: dbSession.focus_quality || undefined,
      reflection: dbSession.reflection as any,
      distractions: dbSession.distractions || [],
      aiSummary: dbSession.ai_summary || undefined,
    }
  }

  private dbStatsToLocal(dbStats: DbUserStats): DopamineStats {
    return {
      totalFocusTime: Number(dbStats.total_focus_time),
      totalDistractionTime: Number(dbStats.total_distraction_time),
      currentStreak: dbStats.current_streak,
      longestStreak: dbStats.longest_streak,
      lastSessionDate: dbStats.last_session_date || undefined,
      sessionsCompleted: dbStats.sessions_completed,
      averageFocusQuality: Number(dbStats.average_focus_quality),
    }
  }
}

// Singleton instance
export const cloudSync = new CloudSyncService()
