"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Square } from "lucide-react";
import { formatTime, calculateFocusEnergy } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FlowTimerProps {
  targetDuration: number; // in milliseconds
  onComplete: (duration: number) => void;
  onStop: (duration: number) => void;
}

export default function FlowTimer({
  targetDuration,
  onComplete,
  onStop,
}: FlowTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 100;
          if (next >= targetDuration) {
            handleComplete();
            return targetDuration;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    onStop(elapsed);
  };

  const handleComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    onComplete(elapsed);
  };

  const energy = calculateFocusEnergy(elapsed, targetDuration);
  const remainingTime = targetDuration - elapsed;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Energy Meter */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-96 h-96 mb-16"
      >
        {/* Outer Ring with Glow */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{
            background: energy < 30
              ? 'radial-gradient(circle, var(--primary) 0%, transparent 70%)'
              : energy >= 30 && energy < 70
              ? 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)'
              : 'radial-gradient(circle, var(--accent) 0%, transparent 70%)'
          }}
        />

        <svg className="w-full h-full transform -rotate-90 relative">
          {/* Background circle */}
          <circle
            cx="192"
            cy="192"
            r="160"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            className="text-muted"
            opacity="0.15"
          />
          {/* Progress circle */}
          <motion.circle
            cx="192"
            cy="192"
            r="160"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 160}`}
            strokeDashoffset={`${2 * Math.PI * 160 * (1 - energy / 100)}`}
            style={{
              transition: "stroke-dashoffset 0.1s linear",
              filter: "drop-shadow(0 0 12px currentColor)",
            }}
            className={cn(
              "transition-colors duration-500",
              energy < 30 && "text-primary",
              energy >= 30 && energy < 70 && "text-secondary",
              energy >= 70 && "text-accent"
            )}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={
                energy < 30 ? "var(--primary)" : energy >= 30 && energy < 70 ? "var(--secondary)" : "var(--accent)"
              } />
              <stop offset="100%" stopColor={
                energy < 30 ? "var(--primary)" : energy >= 30 && energy < 70 ? "var(--accent)" : "var(--success)"
              } stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={Math.floor(elapsed / 1000)}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-7xl font-bold tabular-nums mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {formatTime(remainingTime)}
            </div>
            <div className="text-base text-muted-foreground font-semibold tracking-wide">
              {elapsed < targetDuration ? "Time Remaining" : "Completed!"}
            </div>
          </motion.div>

          {/* Energy Label */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mt-8 px-6 py-3 rounded-full bg-gradient-to-br from-muted/80 to-muted/40 shadow-lg border-2"
          >
            <span
              className={cn(
                "transition-colors duration-500 text-2xl font-bold",
                energy < 30 && "text-primary",
                energy >= 30 && energy < 70 && "text-secondary",
                energy >= 70 && "text-accent"
              )}
            >
              Flow Energy: {Math.floor(energy)}%
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex gap-5">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all border-2 border-secondary/20"
          >
            <Play size={28} fill="currentColor" />
            <span>Start Focus</span>
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className={cn(
                "flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all border-2",
                isPaused
                  ? "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-secondary/20"
                  : "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground border-accent/20"
              )}
            >
              {isPaused ? (
                <>
                  <Play size={28} fill="currentColor" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause size={28} />
                  <span>Pause</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all border-2 border-destructive/20"
            >
              <Square size={28} />
              <span>End Session</span>
            </motion.button>
          </>
        )}
      </div>

      {/* Phase Indicator */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-10 text-center"
          >
            <p className="text-base text-muted-foreground font-semibold tracking-wide">
              {energy < 30 && "🔥 Building momentum..."}
              {energy >= 30 && energy < 50 && "🌊 Entering flow state..."}
              {energy >= 50 && energy < 70 && "⚡ Deep in flow..."}
              {energy >= 70 && energy < 90 && "🚀 Peak focus achieved!"}
              {energy >= 90 && "✨ Approaching completion..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
