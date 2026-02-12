"use client";

import { useEffect, useState } from "react";
import { Flame, Target, Clock, TrendingUp } from "lucide-react";
import { getStats } from "@/lib/localStorage";
import { DEFAULT_STATS } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function DopamineTracker() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(getStats());
  }, []);

  const totalHours = Math.floor(stats.totalFocusTime / (1000 * 60 * 60));
  const totalMinutes = Math.floor((stats.totalFocusTime % (1000 * 60 * 60)) / (1000 * 60));

  const tiles = [
    {
      label: "Current streak",
      value: `${stats.currentStreak}`,
      suffix: "days",
      icon: Flame,
    },
    {
      label: "Total focus",
      value: `${totalHours}h ${totalMinutes}m`,
      suffix: "this week",
      icon: Clock,
    },
    {
      label: "Sessions",
      value: `${stats.sessionsCompleted}`,
      suffix: "completed",
      icon: Target,
    },
    {
      label: "Avg quality",
      value: `${stats.averageFocusQuality.toFixed(1)}`,
      suffix: "/ 10",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="gap-0 border bg-card">
          <CardContent className="px-4 py-4">
            <div className="mb-3 inline-flex rounded-md bg-muted p-2">
              <tile.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{tile.label}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-semibold">{tile.value}</span>
              <span className="text-xs text-muted-foreground">{tile.suffix}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
