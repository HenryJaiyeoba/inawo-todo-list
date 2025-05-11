"use client";

import { useState } from "react";
import type { Task, Event } from "@/types/todo";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, isSameDay } from "date-fns";
import TaskForm from "@/components/task-form";
import { CalendarPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  event?: Event; // Added prop
}

export default function CalendarView({
  tasks,
  onUpdateTask,
  event, // Added prop
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);

  // Custom day render to show tasks on calendar
  const renderDay = (day: Date) => {
    if (!day) return null;

    const tasksOnDay = tasks.filter(
      (task) => task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
    const hasHighPriority = tasksOnDay.some(
      (task) => task.priority === "high" && !task.completed
    );

    return (
      <div className="relative">
        <div>{day.getDate()}</div>
        {tasksOnDay.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div
              className={cn(
                "h-1 w-1 rounded-full",
                hasHighPriority ? "bg-red-500" : "bg-primary"
              )}
            />
          </div>
        )}
      </div>
    );
  };

  const tasksOnSelectedDate = selectedDate
    ? tasks.filter(
        (task) =>
          task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            components={{
              Day: ({ day, ...props }) => (
                <button {...props} className={cn(props.className, "relative")}>
                  {day ? (
                    renderDay(day)
                  ) : (
                    <div className="relative">{props.children}</div>
                  )}
                </button>
              ),
            }}
          />

          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setShowAddTaskDialog(true)}
              className="w-full"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add Task for{" "}
              {selectedDate
                ? format(selectedDate, "MMM d, yyyy")
                : "Selected Date"}
            </Button>
          </div>
        </div>

        <div className="md:w-1/2">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-4">
                Tasks for{" "}
                {selectedDate
                  ? format(selectedDate, "MMMM d, yyyy")
                  : "Selected Date"}
              </h3>

              {tasksOnSelectedDate.length > 0 ? (
                <div className="space-y-2">
                  {tasksOnSelectedDate.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => setViewingTaskId(task.id)}
                    >
                      <div className="flex items-center gap-2">
                        {task.completed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div
                            className={cn(
                              "h-3 w-3 rounded-full",
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            task.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          )}
                        >
                          {task.title}
                        </span>
                      </div>

                      <Badge variant="outline">{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No tasks scheduled for this date.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Task for{" "}
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Selected Date"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            onAddTask={(task) => {
              onUpdateTask(task);
              setShowAddTaskDialog(false);
            }}
            existingTask={{
              id: Date.now().toString(),
              title: "",
              description: "",
              dueDate: selectedDate?.toISOString(),
              priority: "medium",
              completed: false,
              subTasks: [],
              comments: [],
              progress: 0,
              createdAt: new Date().toISOString(),
              isRecurring: false,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog
        open={viewingTaskId !== null}
        onOpenChange={(open) => !open && setViewingTaskId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {viewingTaskId && (
            <TaskForm
              onAddTask={(updatedTask) => {
                onUpdateTask(updatedTask);
                setViewingTaskId(null);
              }}
              existingTask={tasks.find((t) => t.id === viewingTaskId)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
