"use client";

import { Column as ColumnType, Task } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import DraggableTaskCard from "./DraggableTaskCard";
import { Button } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export default function Column({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: ColumnProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
  const taskIds = sortedTasks.map((task) => task.id);

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full min-w-[340px] max-w-[380px] bg-muted/30 rounded-lg p-4 border"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{column.title}</h2>
          <Badge variant="secondary" className="rounded-full">
            {tasks.length}
          </Badge>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tasks Container */}
      <ScrollArea className="flex-1 pr-4">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground"
                >
                  <p className="text-sm mb-2">No tasks yet</p>
                  <button
                    onClick={() => onAddTask(column.id)}
                    className="text-xs text-primary hover:underline"
                  >
                    Add your first task
                  </button>
                </motion.div>
              ) : (
                sortedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.03 }
                    }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <DraggableTaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </SortableContext>
      </ScrollArea>
    </motion.div>
  );
}
