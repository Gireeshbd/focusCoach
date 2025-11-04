"use client";

import { useEffect, useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Task, Column as ColumnType } from "@/lib/types";
import {
  getTasks,
  saveTasks,
  getColumns,
  addTask,
  updateTask,
  deleteTask as deleteTaskFromStorage,
  addColumn,
} from "@/lib/localStorage";
import Column from "./Column";
import TaskModal from "./TaskModal";
import DopamineTracker from "../dashboard/DopamineTracker";
import SettingsModal from "../dashboard/SettingsModal";
import { Plus, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableTaskCard from "./DraggableTaskCard";
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setMounted(true);
    const loadedColumns = getColumns();
    const loadedTasks = getTasks();
    setColumns(loadedColumns);
    setTasks(loadedTasks);
  }, []);

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedColumnId(task.columnId);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskFromStorage(id);
      setTasks(getTasks());
    }
  };

  const handleSaveTask = (taskData: {
    title: string;
    description: string;
    notes: string;
  }) => {
    if (editingTask) {
      // Update existing task
      updateTask(editingTask.id, taskData);
    } else if (selectedColumnId) {
      // Create new task
      const existingTasks = getTasks().filter((t) => t.columnId === selectedColumnId);
      const maxPosition = existingTasks.length > 0
        ? Math.max(...existingTasks.map((t) => t.position))
        : -1;

      addTask({
        ...taskData,
        columnId: selectedColumnId,
        position: maxPosition + 1,
      });
    }

    setTasks(getTasks());
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setSelectedColumnId(null);
  };

  const handleAddColumn = () => {
    const title = prompt("Enter column name:");
    if (title) {
      addColumn(title);
      setColumns(getColumns());
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column or another task
    const overColumn = columns.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let newColumnId = task.columnId;
    let newPosition = task.position;

    if (overColumn) {
      // Dropped directly on a column
      newColumnId = overColumn.id;
      const columnTasks = tasks.filter((t) => t.columnId === newColumnId);
      newPosition = columnTasks.length;
    } else if (overTask) {
      // Dropped on another task
      newColumnId = overTask.columnId;
      newPosition = overTask.position;
    }

    if (newColumnId !== task.columnId || newPosition !== task.position) {
      // Update task column and position
      updateTask(taskId, {
        columnId: newColumnId,
        position: newPosition,
      });

      // Refresh tasks
      setTasks(getTasks());
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Board Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-card border-b">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            ZenFocus AI
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Good morning! You're on a roll.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsSettingsOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>

          <Button
            onClick={handleAddColumn}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Dopamine Tracker */}
      <div className="px-8 py-6">
        <DopamineTracker />
      </div>

      {/* Columns Container */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
          <div className="flex gap-5 h-full py-2">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks.filter((task) => task.columnId === column.id)}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setSelectedColumnId(null);
        }}
        onSave={handleSaveTask}
        initialData={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description,
                notes: editingTask.notes,
              }
            : undefined
        }
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
