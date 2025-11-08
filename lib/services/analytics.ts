import { FocusSession, Task } from '../types'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, getHours, differenceInDays } from 'date-fns'

export interface HourlyHeatmapData {
  hour: number
  day: string
  focusQuality: number
  sessionCount: number
}

export interface TaskVelocityData {
  taskTitle: string
  taskId: string
  sessionsCompleted: number
  avgFocusQuality: number
  totalFocusTime: number
  completionRate: number
}

export interface DistractionPattern {
  distraction: string
  count: number
  impactOnQuality: number
  mostCommonTime: string
}

export interface EnergyC

urvePoint {
  time: number // minutes into session
  energy: number // 0-100
}

export interface BenchmarkData {
  userAverage: number
  topPerformers: number // top 10%
  allUsers: number // platform average
  percentile: number // user's percentile
}

export class AnalyticsService {
  /**
   * Generate hourly heatmap showing when user is most focused
   */
  generateHourlyHeatmap(sessions: FocusSession[], daysBack: number = 30): HourlyHeatmapData[] {
    const now = new Date()
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const heatmapData: Map<string, HourlyHeatmapData> = new Map()

    sessions
      .filter(s => new Date(s.startTime) >= startDate && s.endTime && s.focusQuality)
      .forEach(session => {
        const startTime = parseISO(session.startTime)
        const hour = getHours(startTime)
        const day = format(startTime, 'EEEE') // Monday, Tuesday, etc.

        const key = `${day}-${hour}`
        const existing = heatmapData.get(key)

        if (existing) {
          // Average the quality
          const newCount = existing.sessionCount + 1
          const newQuality = (existing.focusQuality * existing.sessionCount + session.focusQuality!) / newCount
          heatmapData.set(key, {
            ...existing,
            focusQuality: newQuality,
            sessionCount: newCount,
          })
        } else {
          heatmapData.set(key, {
            hour,
            day,
            focusQuality: session.focusQuality!,
            sessionCount: 1,
          })
        }
      })

    return Array.from(heatmapData.values())
  }

  /**
   * Analyze task velocity - which tasks lead to best focus
   */
  analyzeTaskVelocity(tasks: Task[]): TaskVelocityData[] {
    return tasks
      .filter(task => task.focusSessions && task.focusSessions.length > 0)
      .map(task => {
        const sessions = task.focusSessions || []
        const completedSessions = sessions.filter(s => s.endTime && s.focusQuality)

        const avgQuality = completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) / completedSessions.length
          : 0

        const totalTime = completedSessions.reduce((sum, s) => sum + s.duration, 0)

        const completionRate = sessions.length > 0
          ? (completedSessions.length / sessions.length) * 100
          : 0

        return {
          taskTitle: task.title,
          taskId: task.id,
          sessionsCompleted: completedSessions.length,
          avgFocusQuality: avgQuality,
          totalFocusTime: totalTime,
          completionRate,
        }
      })
      .sort((a, b) => b.avgFocusQuality - a.avgFocusQuality)
  }

  /**
   * Detect distraction patterns across sessions
   */
  detectDistractionPatterns(sessions: FocusSession[]): DistractionPattern[] {
    const distractionMap: Map<string, {
      count: number
      qualityImpact: number[]
      times: Date[]
    }> = new Map()

    sessions
      .filter(s => s.distractions && s.distractions.length > 0 && s.focusQuality)
      .forEach(session => {
        session.distractions.forEach(distraction => {
          const normalized = distraction.toLowerCase().trim()
          if (!normalized) return

          const existing = distractionMap.get(normalized)
          const time = parseISO(session.startTime)
          const qualityImpact = 10 - (session.focusQuality || 0) // Lower quality = higher impact

          if (existing) {
            existing.count++
            existing.qualityImpact.push(qualityImpact)
            existing.times.push(time)
          } else {
            distractionMap.set(normalized, {
              count: 1,
              qualityImpact: [qualityImpact],
              times: [time],
            })
          }
        })
      })

    return Array.from(distractionMap.entries())
      .map(([distraction, data]) => {
        const avgImpact = data.qualityImpact.reduce((a, b) => a + b, 0) / data.qualityImpact.length

        // Find most common time (hour)
        const hourCounts: Record<number, number> = {}
        data.times.forEach(time => {
          const hour = getHours(time)
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        })
        const mostCommonHour = Object.entries(hourCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || '0'

        const timeLabel = `${mostCommonHour}:00`

        return {
          distraction,
          count: data.count,
          impactOnQuality: avgImpact,
          mostCommonTime: timeLabel,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 distractions
  }

  /**
   * Generate energy curve for a typical session
   */
  generateEnergyCurve(sessions: FocusSession[]): EnergyC

urvePoint[] {
    // Simulate energy curve based on session quality
    // In a real implementation, this would use actual biometric data
    const completedSessions = sessions.filter(s => s.endTime && s.focusQuality)

    if (completedSessions.length === 0) {
      return this.getDefaultEnergyCurve()
    }

    const avgQuality = completedSessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) / completedSessions.length

    // Generate curve based on average quality
    const curve: EnergyC

urvePoint[] = []

    for (let minute = 0; minute <= 90; minute += 5) {
      let energy: number

      if (minute <= 10) {
        // Warmup phase
        energy = 40 + (minute / 10) * 20
      } else if (minute <= 60) {
        // Peak flow phase
        energy = 60 + (avgQuality / 10) * 30
      } else {
        // Decline phase
        energy = Math.max(50, 90 - ((minute - 60) / 30) * 40)
      }

      // Add some variance based on user's typical quality
      const variance = (Math.random() - 0.5) * 10
      energy = Math.max(0, Math.min(100, energy + variance))

      curve.push({ time: minute, energy })
    }

    return curve
  }

  private getDefaultEnergyCurve(): EnergyCurvePoint[] {
    return [
      { time: 0, energy: 40 },
      { time: 5, energy: 50 },
      { time: 10, energy: 60 },
      { time: 20, energy: 75 },
      { time: 30, energy: 85 },
      { time: 45, energy: 90 },
      { time: 60, energy: 85 },
      { time: 75, energy: 70 },
      { time: 90, energy: 55 },
    ]
  }

  /**
   * Calculate user's benchmark position
   */
  calculateBenchmarks(userAvgQuality: number, platformStats?: { avg: number, top10: number }): BenchmarkData {
    // In production, fetch these from database aggregates
    const defaultPlatformAvg = 7.2
    const defaultTop10Avg = 9.1

    const platformAvg = platformStats?.avg || defaultPlatformAvg
    const top10Avg = platformStats?.top10 || defaultTop10Avg

    // Calculate percentile (simplified)
    let percentile: number
    if (userAvgQuality >= top10Avg) {
      percentile = 95 + ((userAvgQuality - top10Avg) / (10 - top10Avg)) * 5
    } else if (userAvgQuality >= platformAvg) {
      percentile = 50 + ((userAvgQuality - platformAvg) / (top10Avg - platformAvg)) * 45
    } else {
      percentile = (userAvgQuality / platformAvg) * 50
    }

    return {
      userAverage: userAvgQuality,
      topPerformers: top10Avg,
      allUsers: platformAvg,
      percentile: Math.round(percentile),
    }
  }

  /**
   * Get focus insights summary
   */
  generateInsightsSummary(sessions: FocusSession[], tasks: Task[]) {
    const completedSessions = sessions.filter(s => s.endTime && s.focusQuality)
    const avgQuality = completedSessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) / completedSessions.length

    const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.duration, 0)
    const totalFocusHours = totalFocusTime / (1000 * 60 * 60)

    const heatmap = this.generateHourlyHeatmap(sessions)
    const bestTime = heatmap.sort((a, b) => b.focusQuality - a.focusQuality)[0]

    const velocity = this.analyzeTaskVelocity(tasks)
    const bestTask = velocity[0]

    const patterns = this.detectDistractionPatterns(sessions)
    const topDistraction = patterns[0]

    const streakDays = this.calculateStreak(sessions)

    return {
      avgQuality: Math.round(avgQuality * 10) / 10,
      totalHours: Math.round(totalFocusHours * 10) / 10,
      sessionsCompleted: completedSessions.length,
      bestFocusTime: bestTime ? `${bestTime.day}s at ${bestTime.hour}:00` : 'Not enough data',
      bestTaskType: bestTask?.taskTitle || 'None',
      topDistraction: topDistraction?.distraction || 'None',
      currentStreak: streakDays,
    }
  }

  private calculateStreak(sessions: FocusSession[]): number {
    const sortedSessions = sessions
      .filter(s => s.endTime)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    if (sortedSessions.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.startTime)
      sessionDate.setHours(0, 0, 0, 0)

      const daysDiff = differenceInDays(currentDate, sessionDate)

      if (daysDiff === 0) {
        // Same day
        if (streak === 0) streak = 1
        continue
      } else if (daysDiff === 1 || (streak === 0 && daysDiff === 1)) {
        // Previous day
        streak++
        currentDate = sessionDate
      } else {
        // Streak broken
        break
      }
    }

    return streak
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService()
