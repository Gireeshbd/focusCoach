"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { getTask, getSettings, addSession } from "@/lib/localStorage";
import FlowTimer from "@/components/focus/FlowTimer";
import ReflectionModal from "@/components/focus/ReflectionModal";

export default function FocusModePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const task = useMemo(() => getTask(taskId), [taskId]);
  const [targetDuration] = useState(() => getSettings().defaultFocusTime * 60 * 1000);
  const [sessionStartTime] = useState(() => Date.now());
  const [showReflection, setShowReflection] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    if (!task) router.push("/");
  }, [task, router]);

  const handleComplete = (duration: number) => {
    setSessionDuration(duration);
    setShowReflection(true);
  };

  const handleReflectionComplete = (reflection: {
    focusQuality: number;
    focusDepth: string;
    whatDistracted: string;
    whatsNext: string;
  }) => {
    addSession({
      taskId,
      startTime: sessionStartTime,
      endTime: Date.now(),
      duration: sessionDuration,
      targetDuration,
      focusQuality: reflection.focusQuality,
      distractions: reflection.whatDistracted ? [reflection.whatDistracted] : [],
      reflection,
      aiSummary: null,
    });

    router.push("/");
  };

  const handleExit = () => {
    if (confirm("Exit focus mode? This session will not be saved.")) {
      router.push("/");
    }
  };

  if (!task) return null;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-6">
        <div className="mb-10 flex items-center justify-between">
          <button onClick={handleExit} className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm hover:bg-muted">
            <ArrowLeft size={16} /> Exit
          </button>
          <button onClick={handleExit} className="rounded-lg border bg-card p-2 hover:bg-muted" aria-label="Close focus mode">
            <X size={16} />
          </button>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">{task.title}</h1>
          {task.description && <p className="mt-2 text-muted-foreground">{task.description}</p>}
        </div>

        <FlowTimer targetDuration={targetDuration} onComplete={handleComplete} onStop={handleComplete} />
      </div>

      <ReflectionModal isOpen={showReflection} duration={sessionDuration} onComplete={handleReflectionComplete} />
    </div>
  );
}
