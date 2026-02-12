"use client";

import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; notes: string }) => void;
  initialData?: { title: string; description: string; notes: string };
}

export default function TaskModal({ isOpen, onClose, onSave, initialData }: TaskModalProps) {
  const formKey = useMemo(
    () => `${isOpen}-${initialData?.title ?? "new"}-${initialData?.description ?? ""}`,
    [isOpen, initialData?.title, initialData?.description]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!title) return;
    onSave({ title, description, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update task details." : "Add a new task to your board."}
          </DialogDescription>
        </DialogHeader>

        <form key={formKey} onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" defaultValue={initialData?.title ?? ""} placeholder="Enter task title..." required autoFocus />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={initialData?.description ?? ""} placeholder="What needs to be done?" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={initialData?.notes ?? ""} placeholder="Additional context..." rows={4} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
