"use client";

import { Task } from "@/lib/types";
import { MoreVertical, Play, Sparkles, Pencil, Trash2, Target, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSettings } from "@/lib/localStorage";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export default function TaskCard({ task, onEdit, onDelete, isDragging = false }: TaskCardProps) {
  const router = useRouter();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const completedSessions = task.focusSessions.filter((s) => s.endTime && s.focusQuality);

  const handleAICoach = async () => {
    if (showAIPanel && aiSuggestion) {
      setShowAIPanel(false);
      return;
    }

    const settings = getSettings();
    if (!settings.openAIApiKey) {
      setAiSuggestion("Add your OpenAI API key in Settings first.");
      setShowAIPanel(true);
      return;
    }

    setShowAIPanel(true);
    setLoadingAI(true);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: settings.openAIApiKey,
          task: {
            title: task.title,
            description: task.description,
          },
          type: "task-breakdown",
        }),
      });

      const data = await response.json();
      if (data.error) {
        setAiSuggestion(`Error: ${data.error}`);
      } else {
        setAiSuggestion(data.response);
      }
    } catch {
      setAiSuggestion("Failed to get AI suggestions. Please check your API key.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={isDragging ? "cursor-grabbing" : "cursor-grab"}
    >
      <Card className="group relative gap-0 rounded-lg border shadow-sm transition-shadow hover:shadow-md">
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="px-4 py-4">
          <h3 className="pr-8 text-sm font-semibold leading-5">{task.title}</h3>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{task.description}</p>
          )}

          {completedSessions.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">
                <Target className="mr-1 h-3 w-3" />
                {completedSessions.length} {completedSessions.length === 1 ? "session" : "sessions"}
              </Badge>
            </div>
          )}

          <Button variant={showAIPanel ? "default" : "outline"} size="sm" className="mt-3 w-full" onClick={handleAICoach} disabled={loadingAI}>
            {loadingAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Coach
              </>
            )}
          </Button>

          {showAIPanel && aiSuggestion && (
            <div className="mt-2 rounded-md border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap">
              {aiSuggestion}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <Button className="w-full" onClick={() => router.push(`/focus/${task.id}`)}>
            <Play className="mr-2 h-4 w-4" fill="currentColor" />
            Start Focus
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
