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
        className="relative w-80 h-80 mb-12"
      >
        {/* Outer Ring */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted"
            opacity="0.2"
          />
          {/* Progress circle */}
          <motion.circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className={cn(
              "transition-colors duration-500",
              energy < 30 && "text-primary",
              energy >= 30 && energy < 70 && "text-secondary",
              energy >= 70 && "text-accent"
            )}
            strokeDasharray={`${2 * Math.PI * 140}`}
            strokeDashoffset={`${2 * Math.PI * 140 * (1 - energy / 100)}`}
            style={{
              transition: "stroke-dashoffset 0.1s linear",
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={Math.floor(elapsed / 1000)}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl font-bold tabular-nums mb-2">
              {formatTime(remainingTime)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {elapsed < targetDuration ? "Time Remaining" : "Completed!"}
            </div>
          </motion.div>

          {/* Energy Label */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mt-6 text-xl font-semibold"
          >
            <span
              className={cn(
                "transition-colors duration-500",
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
      <div className="flex gap-4">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center gap-3 px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Play size={24} fill="currentColor" />
            <span>Start Focus</span>
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all",
                isPaused
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-accent text-accent-foreground"
              )}
            >
              {isPaused ? (
                <>
                  <Play size={24} fill="currentColor" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause size={24} />
                  <span>Pause</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="flex items-center gap-3 px-8 py-4 bg-destructive text-destructive-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <Square size={24} />
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
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {energy < 30 && "Building momentum..."}
              {energy >= 30 && energy < 50 && "Entering flow state..."}
              {energy >= 50 && energy < 70 && "Deep in flow..."}
              {energy >= 70 && energy < 90 && "Peak focus achieved!"}
              {energy >= 90 && "Approaching completion..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
