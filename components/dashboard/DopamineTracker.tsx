"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  if (!mounted || !stats) {
    return null;
  }

  const totalHours = Math.floor(stats.totalFocusTime / (1000 * 60 * 60));
  const totalMinutes = Math.floor((stats.totalFocusTime % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Current Streak */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flame className="text-red-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Current Streak
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {stats.currentStreak}
            </span>
            <span className="text-lg font-medium text-muted-foreground">days</span>
          </div>
          {stats.longestStreak > stats.currentStreak && (
            <p className="text-xs text-muted-foreground mt-2">
              🏆 Best: {stats.longestStreak} days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Focus Time */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Total Focus
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {totalHours}
            </span>
            <span className="text-lg font-medium text-muted-foreground">h</span>
            {totalMinutes > 0 && (
              <>
                <span className="text-2xl font-bold text-foreground ml-1">
                  {totalMinutes}
                </span>
                <span className="text-lg font-medium text-muted-foreground">m</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sessions Completed */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="text-yellow-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Sessions
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {stats.sessionsCompleted}
            </span>
            <span className="text-lg font-medium text-muted-foreground">total</span>
          </div>
        </CardContent>
      </Card>

      {/* Average Focus Quality */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Avg Quality
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {stats.averageFocusQuality.toFixed(1)}
            </span>
            <span className="text-lg font-medium text-muted-foreground">/ 10</span>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.averageFocusQuality / 10) * 100}%` }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
