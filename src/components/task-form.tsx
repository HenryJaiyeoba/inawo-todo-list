"use client";

import type React from "react";

import { useState } from "react";
import type { Task, Priority, Vendor } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TaskFormProps {
  onAddTask: (task: Task) => void;
  existingTask?: Task;
  vendors?: Vendor[];
  activeEventId?: string;
}

export default function TaskForm({
  onAddTask,
  existingTask,
  vendors = [],
  activeEventId,
}: TaskFormProps) {
  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(
    existingTask?.description || ""
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : undefined
  );
  const [priority, setPriority] = useState<Priority>(
    existingTask?.priority || "medium"
  );
  const [assignedTo, setAssignedTo] = useState<string | undefined>(
    existingTask?.assignedTo
  );
  const [budget, setBudget] = useState<number | undefined>(
    existingTask?.budget || undefined
  );
  const [isRecurring, setIsRecurring] = useState<boolean>(
    existingTask?.isRecurring || false
  );
  const [recurringPattern, setRecurringPattern] = useState<string>(
    existingTask?.recurringPattern || "weekly"
  );

  const suggestedDates = [
    new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newTask: Task = {
      id: existingTask?.id || Date.now().toString(),
      title,
      description,
      dueDate: dueDate?.toISOString(),
      priority,
      completed: existingTask?.completed || false,
      subTasks: existingTask?.subTasks || [],
      comments: existingTask?.comments || [],
      progress: existingTask?.progress || 0,
      createdAt: existingTask?.createdAt || new Date().toISOString(),
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      assignedTo,
      assignedAt: assignedTo
        ? existingTask?.assignedAt || new Date().toISOString()
        : undefined,
      budget,
      eventId: existingTask?.eventId || activeEventId,
      files: existingTask?.files || [],
    };

    onAddTask(newTask);

    // Reset form if it's a new task
    if (!existingTask) {
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setPriority("medium");
      setAssignedTo(undefined);
      setBudget(undefined);
      setIsRecurring(false);
    }
  };

  const selectSuggestedDate = (date: Date) => {
    setDueDate(date);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
          required
        />
      </div>

      <div>
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Select due date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
              <div className="p-3 border-t">
                <p className="text-sm font-medium mb-2">Suggested dates:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedDates.map((date, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => selectSuggestedDate(date)}
                      type="button"
                    >
                      <Clock className="mr-2 h-3 w-3" />
                      {format(date, "MMM d")}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Select
            value={priority}
            onValueChange={(value: Priority) => setPriority(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendor Assignment */}
      {vendors && vendors.length > 0 && (
        <div>
          <Select value={assignedTo || ""} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="Assign to vendor (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_assigned">Not assigned</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {vendor.name} - {vendor.service}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Budget for task */}
      <div>
        <Input
          type="number"
          placeholder="Budget for this task (optional)"
          value={budget || ""}
          onChange={(e) =>
            setBudget(e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full"
        />
      </div>

      {/* Recurring task option */}
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring-task"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring-task">Recurring task</Label>
      </div>

      {isRecurring && (
        <div>
          <Select value={recurringPattern} onValueChange={setRecurringPattern}>
            <SelectTrigger>
              <SelectValue placeholder="Recurring pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full">
        {existingTask ? "Update Task" : "Add Task"}
      </Button>
    </form>
  );
}
