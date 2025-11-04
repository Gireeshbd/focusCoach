"use client";

import { Task } from "@/lib/types";
import { GripVertical, MoreVertical, Play, Sparkles, Clock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/localStorage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging = false,
}: TaskCardProps) {
  const router = useRouter();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const completedSessions = task.focusSessions.filter(
    (s) => s.endTime && s.focusQuality
  );

  const handleAICoach = async () => {
    if (showAIPanel && aiSuggestion) {
      setShowAIPanel(false);
      return;
    }

    const settings = getSettings();
    if (!settings.openAIApiKey) {
      setAiSuggestion("⚠️ Please add your OpenAI API key in Settings first!");
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
        setAiSuggestion(`❌ Error: ${data.error}`);
      } else {
        setAiSuggestion(data.response);
      }
    } catch (error) {
      setAiSuggestion("❌ Failed to get AI suggestions. Please check your API key.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={isDragging ? "cursor-grabbing" : "cursor-grab"}
    >
      <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 shadow-md">
        {/* Drag Handle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute left-4 top-4 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical size={18} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Drag to move</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Action Menu */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-6 pt-7">
          {/* Title */}
          <h3 className="font-bold text-lg mb-2 leading-snug pl-6 pr-8">
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed pl-6 pr-8">
              {task.description}
            </p>
          )}

          {/* Session Stats */}
          {completedSessions.length > 0 && (
            <Badge variant="secondary" className="mb-4 shadow-sm">
              <Target className="mr-1.5 h-3 w-3" />
              {completedSessions.length} session{completedSessions.length !== 1 ? "s" : ""}
            </Badge>
          )}

          {/* AI Coach Button */}
          <Button
            variant={showAIPanel ? "default" : "outline"}
            size="sm"
            className="w-full mb-3 shadow-sm"
            onClick={handleAICoach}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting suggestions...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Coach
              </>
            )}
          </Button>

          {/* AI Panel */}
          {showAIPanel && aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="bg-gradient-to-br from-muted/80 to-muted/40 mb-3 border-2 shadow-sm">
                <CardContent className="p-4 text-xs leading-relaxed whitespace-pre-wrap">
                  {aiSuggestion}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full shadow-md hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/focus/${task.id}`)}
          >
            <Play className="mr-2 h-4 w-4" fill="currentColor" />
            Enter Focus Mode
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
