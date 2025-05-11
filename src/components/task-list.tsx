"use client";

import type React from "react";

import { useState } from "react";
import type { Task, SubTask, Vendor } from "@/types/todo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  MessageSquare,
  Plus,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Users,
  FileText,
  Upload,
  Paperclip,
} from "lucide-react";
import TaskForm from "@/components/task-form";
import SubTaskForm from "@/components/subtask-form";
import CommentSection from "@/components/comment-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskListProps {
  tasks: Task[];
  vendors?: Vendor[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddSubTask: (taskId: string, subTask: SubTask) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onAddComment: (taskId: string, comment: string, isVendor?: boolean) => void;
  onUpdateProgress: (taskId: string, progress: number) => void;
  onAssignToVendor?: (taskId: string, vendorId: string) => void;
}

export default function TaskList({
  tasks,
  vendors = [],
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onAddSubTask,
  onToggleSubTask,
  onAddComment,
  onUpdateProgress,
  onAssignToVendor,
}: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>(
    {}
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [addingSubTaskId, setAddingSubTaskId] = useState<string | null>(null);
  const [viewingCommentsTaskId, setViewingCommentsTaskId] = useState<
    string | null
  >(null);
  const [assigningVendorTaskId, setAssigningVendorTaskId] = useState<
    string | null
  >(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [uploadingFilesTaskId, setUploadingFilesTaskId] = useState<
    string | null
  >(null);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks({
      ...expandedTasks,
      [taskId]: !expandedTasks[taskId],
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const calculateTaskProgress = (task: Task) => {
    if (!task.subTasks || task.subTasks.length === 0) {
      return task.completed ? 100 : 0;
    }

    const completedSubTasks = task.subTasks.filter(
      (subTask) => subTask.completed
    ).length;
    return Math.round((completedSubTasks / task.subTasks.length) * 100);
  };

  const updateTaskProgressFromSubtasks = (task: Task) => {
    const progress = calculateTaskProgress(task);
    onUpdateProgress(task.id, progress);
  };

  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    onToggleSubTask(taskId, subTaskId);

    // Update the task progress after toggling a subtask
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTimeout(() => updateTaskProgressFromSubtasks(task), 0);
    }
  };

  const handleAddSubTask = (taskId: string, subTask: SubTask) => {
    onAddSubTask(taskId, subTask);
    setAddingSubTaskId(null);

    // Update the task progress after adding a subtask
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTimeout(
        () =>
          updateTaskProgressFromSubtasks({
            ...task,
            subTasks: [...(task.subTasks || []), subTask],
          }),
        0
      );
    }
  };

  const handleAssignVendor = () => {
    if (assigningVendorTaskId && selectedVendorId && onAssignToVendor) {
      onAssignToVendor(assigningVendorTaskId, selectedVendorId);
      setAssigningVendorTaskId(null);
      setSelectedVendorId("");
    }
  };

  const handleFileUpload = (
    taskId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // In a real app, you would upload these files to a server
    // For now, we'll just add them to the task's files array
    const newFiles = Array.from(files).map((file) => ({
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    }));

    const updatedTask = {
      ...task,
      files: [...(task.files || []), ...newFiles],
    };

    onUpdateTask(updatedTask);
    setUploadingFilesTaskId(null);
  };

  // Sort tasks by due date (closest first) and then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then sort by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    // If one has a due date and the other doesn't
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    // Finally sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-4">
      {sortedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground text-center mb-4">
              No tasks yet. Add your first task above!
            </p>
          </CardContent>
        </Card>
      ) : (
        sortedTasks.map((task) => (
          <Card
            key={task.id}
            className={cn(
              "transition-all duration-200",
              task.completed ? "opacity-70" : "",
              task.priority === "high" && !task.completed
                ? "border-l-4 border-l-red-500"
                : "",
              expandedTasks[task.id] ? "shadow-md" : ""
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="mt-1"
                  />
                  <div>
                    <CardTitle
                      className={cn(
                        "text-lg font-medium transition-all",
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      )}
                    >
                      {task.title}
                    </CardTitle>
                    {task.description && (
                      <CardDescription className="mt-1 text-sm">
                        {task.description}
                      </CardDescription>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.isRecurring && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Recurring
                    </Badge>
                  )}

                  {task.assignedTo && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            {vendors
                              .find((v) => v.id === task.assignedTo)
                              ?.name.split(" ")[0] || "Vendor"}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Assigned to:{" "}
                            {vendors.find((v) => v.id === task.assignedTo)
                              ?.name || "Vendor"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingTaskId(task.id)}
                      >
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteTask(task.id)}>
                        Delete Task
                      </DropdownMenuItem>
                      {onAssignToVendor && !task.assignedTo && (
                        <DropdownMenuItem
                          onClick={() => setAssigningVendorTaskId(task.id)}
                        >
                          Assign to Vendor
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setUploadingFilesTaskId(task.id)}
                      >
                        Upload Files
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(task.id)}
                  >
                    {expandedTasks[task.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {task.dueDate && (
                    <div
                      className={cn(
                        "flex items-center text-xs",
                        new Date(task.dueDate) < new Date() && !task.completed
                          ? "text-red-500 dark:text-red-400"
                          : "text-muted-foreground"
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(task.dueDate) < new Date() &&
                      !task.completed ? (
                        <span className="flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue:{" "}
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </span>
                      ) : (
                        format(new Date(task.dueDate), "MMM d, yyyy")
                      )}
                    </div>
                  )}

                  {task.subTasks && task.subTasks.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      {task.subTasks.filter((st) => st.completed).length}/
                      {task.subTasks.length} subtasks
                    </div>
                  )}

                  {task.budget && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">
                        ${task.budget.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {task.files && task.files.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <Paperclip className="h-3 w-3 inline mr-1" />
                      {task.files.length}{" "}
                      {task.files.length === 1 ? "file" : "files"}
                    </div>
                  )}
                </div>

                {task.comments && task.comments.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setViewingCommentsTaskId(task.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {task.comments.length}
                  </Button>
                )}
              </div>

              {/* Progress bar */}
              <Progress
                value={task.progress}
                className="h-1 mt-2"
                indicatorClassName={cn(
                  task.progress === 100 ? "bg-green-500" : "",
                  task.priority === "high" ? "bg-red-500" : "",
                  task.priority === "medium" ? "bg-yellow-500" : ""
                )}
              />
            </CardHeader>

            <Collapsible open={expandedTasks[task.id]}>
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <Accordion type="single" collapsible className="w-full">
                    {/* Subtasks section */}
                    <AccordionItem value="subtasks" className="border-b-0">
                      <AccordionTrigger className="py-2">
                        Subtasks{" "}
                        {task.subTasks &&
                          task.subTasks.length > 0 &&
                          `(${
                            task.subTasks.filter((st) => st.completed).length
                          }/${task.subTasks.length})`}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 mb-4">
                          {task.subTasks && task.subTasks.length > 0 ? (
                            task.subTasks.map((subTask) => (
                              <div
                                key={subTask.id}
                                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`subtask-${subTask.id}`}
                                    checked={subTask.completed}
                                    onCheckedChange={() =>
                                      handleToggleSubTask(task.id, subTask.id)
                                    }
                                  />
                                  <label
                                    htmlFor={`subtask-${subTask.id}`}
                                    className={cn(
                                      "text-sm",
                                      subTask.completed
                                        ? "line-through text-muted-foreground"
                                        : ""
                                    )}
                                  >
                                    {subTask.title}
                                  </label>
                                </div>

                                {subTask.dueDate && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(subTask.dueDate), "MMM d")}
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No subtasks yet.
                            </p>
                          )}
                        </div>

                        {addingSubTaskId === task.id ? (
                          <SubTaskForm
                            taskId={task.id}
                            onAddSubTask={handleAddSubTask}
                            onCancel={() => setAddingSubTaskId(null)}
                          />
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAddingSubTaskId(task.id)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subtask
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Comments section */}
                    <AccordionItem value="comments" className="border-b-0">
                      <AccordionTrigger className="py-2">
                        Comments{" "}
                        {task.comments &&
                          task.comments.length > 0 &&
                          `(${task.comments.length})`}
                      </AccordionTrigger>
                      <AccordionContent>
                        <CommentSection
                          taskId={task.id}
                          comments={task.comments || []}
                          onAddComment={onAddComment}
                          vendors={vendors}
                          assignedVendorId={task.assignedTo}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Files section */}
                    {task.files && task.files.length > 0 && (
                      <AccordionItem value="files" className="border-b-0">
                        <AccordionTrigger className="py-2">
                          Files{" "}
                          {task.files.length > 0 && `(${task.files.length})`}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {task.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(file.uploadedAt), "MMM d")}
                                  </span>
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUploadingFilesTaskId(task.id)}
                            className="w-full mt-4"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload More Files
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))
      )}

      {/* Edit Task Dialog */}
      <Dialog
        open={editingTaskId !== null}
        onOpenChange={(open) => !open && setEditingTaskId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTaskId && (
            <TaskForm
              onAddTask={onUpdateTask}
              existingTask={tasks.find((t) => t.id === editingTaskId)}
              vendors={vendors}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Comments Dialog */}
      <Dialog
        open={viewingCommentsTaskId !== null}
        onOpenChange={(open) => !open && setViewingCommentsTaskId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {viewingCommentsTaskId && (
            <CommentSection
              taskId={viewingCommentsTaskId}
              comments={
                tasks.find((t) => t.id === viewingCommentsTaskId)?.comments ||
                []
              }
              onAddComment={onAddComment}
              vendors={vendors}
              assignedVendorId={
                tasks.find((t) => t.id === viewingCommentsTaskId)?.assignedTo
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Vendor Dialog */}
      <Dialog
        open={assigningVendorTaskId !== null}
        onOpenChange={(open) => !open && setAssigningVendorTaskId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={selectedVendorId}
              onValueChange={setSelectedVendorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {vendor.name} - {vendor.service}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAssigningVendorTaskId(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignVendor} disabled={!selectedVendorId}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Files Dialog */}
      <Dialog
        open={uploadingFilesTaskId !== null}
        onOpenChange={(open) => !open && setUploadingFilesTaskId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="file-upload" className="text-sm font-medium">
                Select files to upload
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                onChange={(e) =>
                  uploadingFilesTaskId &&
                  handleFileUpload(uploadingFilesTaskId, e)
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setUploadingFilesTaskId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
