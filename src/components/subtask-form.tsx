"use client";

import type React from "react";

import { useState } from "react";
import type { SubTask } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface SubTaskFormProps {
  taskId: string;
  onAddSubTask: (taskId: string, subTask: SubTask) => void;
  onCancel: () => void;
}

export default function SubTaskForm({
  taskId,
  onAddSubTask,
  onCancel,
}: SubTaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      console.error("Title is required");
      return;
    }

    const newSubTask: SubTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      dueDate: dueDate?.toISOString(),
    };

    onAddSubTask(taskId, newSubTask);
    setTitle("");
    setDueDate(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Subtask title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
          required
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" type="button">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {dueDate && (
        <div className="text-xs text-muted-foreground">
          Due: {format(dueDate, "PPP")}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Add
        </Button>
      </div>
    </form>
  );
}
