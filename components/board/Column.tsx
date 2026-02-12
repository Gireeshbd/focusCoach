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

export default function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
  const taskIds = sortedTasks.map((task) => task.id);

  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="flex h-full min-w-[300px] max-w-[340px] flex-col rounded-xl border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight">{column.title}</h2>
          <Badge variant="secondary" className="h-5 rounded-full px-2 text-xs">
            {tasks.length}
          </Badge>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Add task to ${column.title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1 pr-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sortedTasks.length === 0 ? (
              <button
                onClick={() => onAddTask(column.id)}
                className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                Add your first task
              </button>
            ) : (
              sortedTasks.map((task) => (
                <DraggableTaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
              ))
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
