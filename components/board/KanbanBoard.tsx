"use client";

import { useState } from "react";
import { Task, Column as ColumnType } from "@/lib/types";
import {
  getTasks,
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
import { Plus, Settings } from "lucide-react";
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
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>(() => getColumns());
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
    if (confirm("Delete this task?")) {
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
      updateTask(editingTask.id, taskData);
    } else if (selectedColumnId) {
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
    const title = prompt("New column name:");
    if (title?.trim()) {
      addColumn(title.trim());
      setColumns(getColumns());
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const overColumn = columns.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let newColumnId = task.columnId;
    let newPosition = task.position;

    if (overColumn) {
      newColumnId = overColumn.id;
      newPosition = tasks.filter((t) => t.columnId === newColumnId).length;
    } else if (overTask) {
      newColumnId = overTask.columnId;
      newPosition = overTask.position;
    }

    if (newColumnId !== task.columnId || newPosition !== task.position) {
      updateTask(taskId, { columnId: newColumnId, position: newPosition });
      setTasks(getTasks());
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-5 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Focus Coach</h1>
              <p className="text-sm text-muted-foreground mt-1">Minimal board for deep work planning.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="gap-2" size="sm">
                <Settings className="h-4 w-4" />
                Settings
              </Button>

              <Button onClick={handleAddColumn} className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-6 pt-6 md:px-8">
        <DopamineTracker />
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="mx-auto flex h-full w-full max-w-[1600px] gap-4 px-6 py-6 md:px-8">
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
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
