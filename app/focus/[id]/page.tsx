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
      {/* Breathing Background Animation */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExit}
          className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Exit Focus</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleExit}
          className="p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <X size={20} />
        </motion.button>
      </div>

      {/* Task Info */}
      <div className="absolute top-24 left-0 right-0 px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {task.title}
          </h1>
          {task.description && (
            <p className="text-muted-foreground">
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
