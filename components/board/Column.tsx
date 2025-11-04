"use client";

import { Column as ColumnType, Task } from "@/lib/types";
import { Plus } from "lucide-react";
import DraggableTaskCard from "./DraggableTaskCard";
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
    <div
      ref={setNodeRef}
      className="flex flex-col h-full min-w-[320px] max-w-[360px] bg-card rounded-lg p-4 border"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">{column.title}</h2>
          <Badge variant="secondary" className="rounded-full h-5 px-2 text-xs">
            {tasks.length}
          </Badge>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          className="p-1.5 hover:bg-muted rounded-md transition-colors"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tasks Container */}
      <ScrollArea className="flex-1 pr-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {sortedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground">
                <p className="text-xs mb-1">No tasks yet</p>
                <button
                  onClick={() => onAddTask(column.id)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Add your first task
                </button>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
