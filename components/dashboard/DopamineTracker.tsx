"use client";

import { useEffect, useState } from "react";
import { Flame, Target, Clock, TrendingUp } from "lucide-react";
import { getStats, getAllSessions } from "@/lib/localStorage";
import { DopamineStats } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function DopamineTracker() {
  const [stats, setStats] = useState<DopamineStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStats());
  }, []);

  if (!mounted || !stats) return null;

  const totalHours = Math.floor(stats.totalFocusTime / (1000 * 60 * 60));
  const totalMinutes = Math.floor((stats.totalFocusTime % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Streak */}
      <Card className="border border-border hover:border-primary/20 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Flame className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Current Streak
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">
              {stats.currentStreak}
            </span>
            <span className="text-sm font-medium text-muted-foreground">Days</span>
          </div>
          {stats.longestStreak > stats.currentStreak && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Keep it up!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Focus Time */}
      <Card className="border border-border hover:border-primary/20 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Total Focus
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">
              {totalHours}h
            </span>
            {totalMinutes > 0 && (
              <span className="text-lg font-semibold text-muted-foreground">
                {totalMinutes}m
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            this week
          </p>
        </CardContent>
      </Card>

      {/* Sessions Completed */}
      <Card className="border border-border hover:border-primary/20 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="h-4 w-4 text-purple-500" />
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Sessions
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">
              {stats.sessionsCompleted}
            </span>
            <span className="text-sm font-medium text-muted-foreground">total</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Focus Quality */}
      <Card className="border border-border hover:border-primary/20 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Avg Quality
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">
              {stats.averageFocusQuality.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">/ 10</span>
          </div>
          <div className="mt-2.5 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(stats.averageFocusQuality / 10) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
