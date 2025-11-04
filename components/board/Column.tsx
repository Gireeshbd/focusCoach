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
      className="flex flex-col h-full min-w-[360px] max-w-[400px] bg-muted/60 rounded-xl p-5 border-2 shadow-sm"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{column.title}</h2>
          <Badge variant="secondary" className="rounded-full px-3 py-1 shadow-sm">
            {tasks.length}
          </Badge>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAddTask(column.id)}
          className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
        >
          <Plus size={18} />
        </motion.button>
      </div>

      {/* Tasks Container */}
      <ScrollArea className="flex-1 pr-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl text-muted-foreground bg-background/30"
                >
                  <p className="text-sm font-medium mb-3">No tasks yet</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddTask(column.id)}
                    className="text-sm text-primary hover:text-primary-hover font-semibold px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    Add your first task
                  </motion.button>
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
