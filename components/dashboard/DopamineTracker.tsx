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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* Current Streak */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden shadow-md hover:shadow-xl transition-shadow border-2">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-xl shadow-lg">
                <Flame className="text-destructive-foreground h-6 w-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Current Streak
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold bg-gradient-to-br from-destructive to-destructive/70 bg-clip-text text-transparent">
                {stats.currentStreak}
              </span>
              <span className="text-xl font-semibold text-muted-foreground">days</span>
            </div>
            {stats.longestStreak > stats.currentStreak && (
              <p className="text-xs text-muted-foreground font-medium">
                🏆 Best: {stats.longestStreak} days
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Focus Time */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden shadow-md hover:shadow-xl transition-shadow border-2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <Clock className="text-primary-foreground h-6 w-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Total Focus
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                {totalHours}
              </span>
              <span className="text-xl font-semibold text-muted-foreground">h</span>
              {totalMinutes > 0 && (
                <>
                  <span className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent ml-1">
                    {totalMinutes}
                  </span>
                  <span className="text-xl font-semibold text-muted-foreground">m</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sessions Completed */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden shadow-md hover:shadow-xl transition-shadow border-2">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-warning to-warning/80 rounded-xl shadow-lg">
                <Target className="text-warning-foreground h-6 w-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Sessions
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold bg-gradient-to-br from-warning to-warning/70 bg-clip-text text-transparent">
                {stats.sessionsCompleted}
              </span>
              <span className="text-xl font-semibold text-muted-foreground">total</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Average Focus Quality */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden shadow-md hover:shadow-xl transition-shadow border-2">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-success to-success/80 rounded-xl shadow-lg">
                <TrendingUp className="text-success-foreground h-6 w-6" />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Avg Quality
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-bold bg-gradient-to-br from-success to-success/70 bg-clip-text text-transparent">
                {stats.averageFocusQuality.toFixed(1)}
              </span>
              <span className="text-xl font-semibold text-muted-foreground">/ 10</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.averageFocusQuality / 10) * 100}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-destructive via-warning to-success shadow-sm"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
