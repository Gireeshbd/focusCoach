"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { Task } from "@/lib/types";
import { getTask, getSettings, addSession } from "@/lib/localStorage";
import FlowTimer from "@/components/focus/FlowTimer";
import ReflectionModal from "@/components/focus/ReflectionModal";

export default function FocusModePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [targetDuration, setTargetDuration] = useState(90 * 60 * 1000); // 90 minutes default
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadedTask = getTask(taskId);
    if (!loadedTask) {
      router.push("/");
      return;
    }
    setTask(loadedTask);

    const settings = getSettings();
    setTargetDuration(settings.defaultFocusTime * 60 * 1000);
    setSessionStartTime(Date.now());
  }, [taskId, router]);

  const handleComplete = (duration: number) => {
    setSessionDuration(duration);
    setShowReflection(true);
  };

  const handleStop = (duration: number) => {
    setSessionDuration(duration);
    setShowReflection(true);
  };

  const handleReflectionComplete = (reflection: {
    focusQuality: number;
    focusDepth: string;
    whatDistracted: string;
    whatsNext: string;
  }) => {
    // Save session
    addSession({
      taskId,
      startTime: sessionStartTime || Date.now(),
      endTime: Date.now(),
      duration: sessionDuration,
      targetDuration,
      focusQuality: reflection.focusQuality,
      distractions: reflection.whatDistracted ? [reflection.whatDistracted] : [],
      reflection: {
        focusDepth: reflection.focusDepth,
        whatDistracted: reflection.whatDistracted,
        whatsNext: reflection.whatsNext,
      },
      aiSummary: null,
    });

    // Navigate back to board
    router.push("/");
  };

  const handleExit = () => {
    if (confirm("Are you sure you want to exit focus mode? Your session will not be saved.")) {
      router.push("/");
    }
  };

  if (!mounted || !task) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Breathing Background Animation - Vibrant */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Primary Blue Orb */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-primary/40 to-primary/20 rounded-full blur-3xl"
        />
        {/* Accent Teal Orb */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-[36rem] h-[36rem] bg-gradient-to-br from-accent/40 to-accent/20 rounded-full blur-3xl"
        />
        {/* Secondary Purple Orb */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.65, 0.35],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-full blur-3xl"
        />
        {/* Additional smaller orbs for depth */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-3/4 left-1/3 w-64 h-64 bg-gradient-to-br from-success/30 to-success/10 rounded-full blur-2xl"
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-10">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExit}
          className="flex items-center gap-2 px-5 py-3 bg-background/90 backdrop-blur-md border-2 rounded-xl hover:bg-muted/80 transition-all shadow-lg hover:shadow-xl"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Exit Focus</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleExit}
          className="p-3 bg-background/90 backdrop-blur-md border-2 rounded-xl hover:bg-muted/80 transition-all shadow-lg hover:shadow-xl"
        >
          <X size={22} />
        </motion.button>
      </div>

      {/* Task Info */}
      <div className="absolute top-28 left-0 right-0 px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {task.title}
          </h1>
          {task.description && (
            <p className="text-lg text-muted-foreground font-medium">
              {task.description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center min-h-screen pt-32 pb-20">
        <FlowTimer
          targetDuration={targetDuration}
          onComplete={handleComplete}
          onStop={handleStop}
        />
      </div>

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={showReflection}
        duration={sessionDuration}
        onComplete={handleReflectionComplete}
      />
    </div>
  );
}
