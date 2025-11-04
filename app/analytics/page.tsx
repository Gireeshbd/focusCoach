'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { analyticsService, type HourlyHeatmapData, type TaskVelocityData, type DistractionPattern } from '@/lib/services/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Clock, Target, AlertCircle, Flame, Trophy, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  const [insights, setInsights] = useState<any>(null)
  const [heatmap, setHeatmap] = useState<HourlyHeatmapData[]>([])
  const [velocity, setVelocity] = useState<TaskVelocityData[]>([])
  const [patterns, setPatterns] = useState<DistractionPattern[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirectTo=/analytics')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile) {
      loadAnalytics()
    }
  }, [user, profile])

  const loadAnalytics = async () => {
    // In production, fetch from Supabase
    // For now, get from localStorage as fallback
    const boardState = localStorage.getItem('flowboard-state')
    if (!boardState) return

    try {
      const data = JSON.parse(boardState)
      const allSessions: any[] = []

      // Collect all sessions from tasks
      data.tasks?.forEach((task: any) => {
        if (task.focusSessions) {
          allSessions.push(...task.focusSessions)
        }
      })

      // Generate analytics
      const summary = analyticsService.generateInsightsSummary(allSessions, data.tasks || [])
      const heatmapData = analyticsService.generateHourlyHeatmap(allSessions)
      const velocityData = analyticsService.analyzeTaskVelocity(data.tasks || [])
      const patternsData = analyticsService.detectDistractionPatterns(allSessions)

      setInsights(summary)
      setHeatmap(heatmapData)
      setVelocity(velocityData.slice(0, 5))
      setPatterns(patternsData.slice(0, 5))
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'elite'

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
              <Lock className="h-8 w-8 text-purple-500" />
            </div>
            <CardTitle className="text-2xl">Advanced Analytics</CardTitle>
            <CardDescription>
              Unlock deep insights into your focus patterns with Pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
              <h3 className="font-semibold mb-2">What you&apos;ll get:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Hourly heatmap showing your peak focus times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Task velocity analysis (which tasks = best flow)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Distraction pattern detection with AI recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Energy curve visualization across sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Benchmarks against top performers</span>
                </li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link href="/pricing">Upgrade to Pro for $12/month</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <CardTitle>No Data Yet</CardTitle>
          <CardDescription className="mt-2">
            Complete some focus sessions to see your analytics!
          </CardDescription>
          <Button asChild className="mt-4">
            <Link href="/">Start a Session</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Flow Intelligence Dashboard</h1>
          <p className="text-gray-300">Deep insights into your focus patterns</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Focus Quality</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {insights.avgQuality}
                <span className="text-lg text-muted-foreground">/10</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                {insights.avgQuality >= 8 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Excellent</span>
                  </>
                ) : insights.avgQuality >= 6 ? (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500">Good</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">Needs work</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Focus Time</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {insights.totalHours}
                <span className="text-lg text-muted-foreground">hrs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>{insights.sessionsCompleted} sessions</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {insights.currentStreak}
                <span className="text-lg text-muted-foreground">days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-orange-500">Keep it going!</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Best Focus Time</CardDescription>
              <CardTitle className="text-xl">
                {insights.bestFocusTime}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Schedule deep work here</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Velocity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Focus Tasks
            </CardTitle>
            <CardDescription>Tasks that lead to your best flow states</CardDescription>
          </CardHeader>
          <CardContent>
            {velocity.length > 0 ? (
              <div className="space-y-4">
                {velocity.map((task, index) => (
                  <div key={task.taskId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{task.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.sessionsCompleted} sessions • {Math.round(task.totalFocusTime / (1000 * 60))} min
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {task.avgFocusQuality.toFixed(1)}/10
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No task data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Distraction Patterns */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Distraction Patterns
            </CardTitle>
            <CardDescription>Your most common focus killers</CardDescription>
          </CardHeader>
          <CardContent>
            {patterns.length > 0 ? (
              <div className="space-y-3">
                {patterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium capitalize">{pattern.distraction}</p>
                      <p className="text-sm text-muted-foreground">
                        Occurs {pattern.count}x • Most common at {pattern.mostCommonTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-500">
                        -{pattern.impactOnQuality.toFixed(1)} quality
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No distraction data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Hourly Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Quality Heatmap</CardTitle>
            <CardDescription>When are you most focused? Darker = better focus</CardDescription>
          </CardHeader>
          <CardContent>
            {heatmap.length > 0 ? (
              <div className="grid grid-cols-8 gap-2">
                <div></div>
                {Array.from({ length: 24 }, (_, i) => i).filter(h => h % 3 === 0).map(hour => (
                  <div key={hour} className="text-xs text-center text-muted-foreground">
                    {hour}:00
                  </div>
                ))}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const dayData = heatmap.filter(h => h.day.startsWith(day.substring(0, 3)))
                  return (
                    <div key={day} className="contents">
                      <div className="text-xs text-muted-foreground flex items-center">{day}</div>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const data = dayData.find(d => d.hour === hour)
                        const quality = data?.focusQuality || 0
                        const opacity = quality / 10

                        return (
                          <div
                            key={`${day}-${hour}`}
                            className="aspect-square rounded"
                            style={{
                              backgroundColor: data ? `rgba(168, 85, 247, ${opacity})` : 'rgb(226, 232, 240)',
                            }}
                            title={data ? `${data.day} ${data.hour}:00 - Quality: ${data.focusQuality.toFixed(1)}` : 'No data'}
                          />
                        )
                      }).filter((_, i) => i % 3 === 0)}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Complete more sessions to see your heatmap</p>
            )}
          </CardContent>
        </Card>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
