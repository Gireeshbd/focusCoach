"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Square } from "lucide-react";
import { formatTime, calculateFocusEnergy, cn } from "@/lib/utils";

interface FlowTimerProps {
  targetDuration: number;
  onComplete: (duration: number) => void;
  onStop: (duration: number) => void;
}

export default function FlowTimer({ targetDuration, onComplete, onStop }: FlowTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => Math.min(prev + 100, targetDuration));
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, targetDuration]);

  useEffect(() => {
    if (elapsed < targetDuration) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsRunning(false);
    setIsPaused(false);
    onComplete(targetDuration);
  }, [elapsed, targetDuration, onComplete]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => setIsPaused((prev) => !prev);

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    onStop(elapsed);
  };

  const energy = calculateFocusEnergy(elapsed, targetDuration);
  const remainingTime = Math.max(targetDuration - elapsed, 0);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10 w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="text-6xl font-semibold tabular-nums tracking-tight">{formatTime(remainingTime)}</div>
        <p className="mt-2 text-sm text-muted-foreground">{elapsed < targetDuration ? "Time remaining" : "Complete"}</p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Flow energy</span>
            <span>{Math.floor(energy)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3">
        {!isRunning ? (
          <button onClick={handleStart} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
            <Play size={16} fill="currentColor" /> Start
          </button>
        ) : (
          <>
            <button onClick={handlePause} className={cn("inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium", isPaused ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
              {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />} {isPaused ? "Resume" : "Pause"}
            </button>
            <button onClick={handleStop} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-3 text-sm font-medium text-destructive-foreground">
              <Square size={16} /> End
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {isRunning && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 text-sm text-muted-foreground">
            {energy < 40 ? "Settling in..." : energy < 75 ? "Locked in." : "Deep flow mode."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
