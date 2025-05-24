"use client";

import { useState, useEffect } from "react";
import type {
  Task,
  SubTask,
  Event,
  Vendor,
  BudgetCategory,
} from "@/types/todo";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";
import CalendarView from "@/components/calendar-view";
import ProgressDashboard from "@/components/progress-dashboard";
import VendorManagement from "@/components/vendor-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Calendar,
  BarChart2,
  Bell,
  Users,
  Briefcase,
  FileText,
  Trash2,
} from "lucide-react";
import NotificationSettings from "@/components/notification-settings";
import TaskTemplates from "@/components/task-templates";
import BudgetTracker from "@/components/budget-tracker";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ThemeToggler from "./theme-toggler";

const initialEvents: Event[] = [
  {
    id: "event-1",
    name: "Wedding Ceremony",
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Grand Plaza Hotel",
    description: "A beautiful wedding ceremony with 150 guests",
    createdAt: new Date().toISOString(),
    budget: {
      total: 500000,
      spent: 350000,
      categories: [
        {
          id: "cat-1",
          name: "Venue",
          allocated: 10000,
          spent: 2500,
        },
        {
          id: "cat-2",
          name: "Catering",
          allocated: 8000,
          spent: 2000,
        },
        {
          id: "cat-3",
          name: "Photography",
          allocated: 3000,
          spent: 500,
        },
      ],
    },
  },
];

const initialVendors: Vendor[] = [
  {
    id: "vendor-1",
    name: "Elite Catering",
    service: "Catering",
    email: "info@elitecatering.com",
    phone: "(555) 123-4567",
    location: "New York, NY",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "vendor-2",
    name: "Bloom Floral Design",
    service: "Florist",
    email: "bloom@floraldesign.com",
    phone: "(555) 987-6543",
    location: "New York, NY",
    rating: 4,
    createdAt: new Date().toISOString(),
  },
];

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Book venue",
    description: "Finalize contract with Grand Plaza Hotel",
    priority: "high",
    completed: true,
    progress: 100,
    createdAt: new Date().toISOString(),
    eventId: "event-1",
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    subTasks: [
      {
        id: "subtask-1",
        title: "Tour venue",
        completed: true,
      },
      {
        id: "subtask-2",
        title: "Review contract",
        completed: true,
      },
    ],
    comments: [
      {
        id: "comment-1",
        text: "Deposit has been paid",
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "task-2",
    title: "Hire photographer",
    description: "Find and book a professional photographer",
    priority: "medium",
    completed: false,
    progress: 50,
    createdAt: new Date().toISOString(),
    eventId: "event-1",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "vendor-2",
    assignedAt: new Date().toISOString(),
    subTasks: [
      {
        id: "subtask-3",
        title: "Research photographers",
        completed: true,
      },
      {
        id: "subtask-4",
        title: "Schedule meetings",
        completed: false,
      },
    ],
  },
];

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("tasks");
      return savedTasks ? JSON.parse(savedTasks) : initialTasks;
    }
    return initialTasks;
  });

  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [activeEvent, setActiveEvent] = useState<string>(
    initialEvents[0]?.id || ""
  );

  const [activeTab, setActiveTab] = useState("tasks");
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const eventTasks = tasks.filter((task) => task.eventId === activeEvent);

  const addTask = (task: Task) => {
    const taskWithEvent = {
      ...task,
      eventId: task.eventId || activeEvent,
    };
    setTasks([...tasks, taskWithEvent]);

    toast("Task added", {
      description: "Your task has been added successfully.",
    });
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));

    toast("Task deleted", {
      description: "Your task has been deleted.",
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const completed = !task.completed;

          if (task.assignedTo && completed) {
            toast("Task completed", {
              description: `Notification sent to ${
                vendors.find((v) => v.id === task.assignedTo)?.name || "vendor"
              }.`,
            });
          }

          return { ...task, completed };
        }
        return task;
      })
    );
  };

  const addSubTask = (taskId: string, subTask: SubTask) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subTasks: [...(task.subTasks || []), subTask],
          };
        }
        return task;
      })
    );
  };

  const toggleSubTaskCompletion = (taskId: string, subTaskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subTasks: task.subTasks?.map((subTask) => {
              if (subTask.id === subTaskId) {
                return { ...subTask, completed: !subTask.completed };
              }
              return subTask;
            }),
          };
        }
        return task;
      })
    );
  };

  const addComment = (taskId: string, comment: string, isVendor = false) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newComment = {
            id: Date.now().toString(),
            text: comment,
            timestamp: new Date().toISOString(),
            isVendor,
            authorId: isVendor ? task.assignedTo : "user-1",
          };

          return {
            ...task,
            comments: [...(task.comments || []), newComment],
          };
        }
        return task;
      })
    );

    if (isVendor) {
      toast("New vendor comment", {
        description: "A vendor has commented on your task.",
      });
    }
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, progress };
        }
        return task;
      })
    );
  };

  const assignTaskToVendor = (taskId: string, vendorId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            assignedTo: vendorId,
            assignedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );

    toast("Task assigned", {
      description: `Task assigned to ${
        vendors.find((v) => v.id === vendorId)?.name || "vendor"
      }.`,
    });
  };

  const addVendor = (vendor: Vendor) => {
    setVendors([...vendors, vendor]);

    toast("Vendor added", {
      description: `${vendor.name} has been added to your vendors.`,
    });
  };

  const addEvent = (event: Event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setEvents([...events, newEvent]);
    setActiveEvent(newEvent.id);

    toast("Event created", {
      description: `${event.name} has been created.`,
    });
  };

  const deleteEvent = (eventId: string) => {
    if (events.length <= 1) {
      toast("Cannot delete event", {
        description:
          "You must have at least one event. Create a new event before deleting this one.",
      });
      return;
    }

    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);

    const updatedTasks = tasks.filter((task) => task.eventId !== eventId);
    setTasks(updatedTasks);

    setActiveEvent(updatedEvents[0].id);

    toast("Event deleted", {
      description: "The event and all associated tasks have been deleted.",
    });
  };

  const applyTemplate = (templateTasks: Task[]) => {
    const tasksWithEvent = templateTasks.map((task) => ({
      ...task,
      eventId: activeEvent,
    }));

    setTasks([...tasks, ...tasksWithEvent]);
    setShowTemplates(false);

    toast("Template applied", {
      description: `${templateTasks.length} tasks have been added to your event.`,
    });
  };

  interface BudgetUpdates {
    total?: number;
    spent?: number;
    categories?: BudgetCategory[];
  }

  const updateBudget = (eventId: string, budgetUpdates: BudgetUpdates) => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          return {
            ...event,
            budget: {
              ...event.budget,
              ...budgetUpdates,
            },
          };
        }
        return event;
      })
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Event Planner
          </h1>
          {activeEvent && (
            <div className="text-sm text-muted-foreground mt-1">
              Event:{" "}
              {events.find((e) => e.id === activeEvent)?.name ||
                "No event selected"}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ThemeToggler />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotificationSettings(true)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              <Button
                variant={event.id === activeEvent ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveEvent(event.id)}
                className="whitespace-nowrap pr-8"
              >
                {event.name}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-6 rounded-l-none opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventToDelete(event.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the event and remove all associated tasks from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEventToDelete(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (eventToDelete) {
                          deleteEvent(eventToDelete);
                          setEventToDelete(null);
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newEvent = {
                id: Date.now().toString(),
                name: `New Event ${events.length + 1}`,
                date: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                location: "To be determined",
                description: "New event description",
                createdAt: new Date().toISOString(),
                budget: {
                  total: 10000,
                  spent: 0,
                  categories: [],
                },
              };
              addEvent(newEvent);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="tasks"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="tasks" className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <TaskForm
                onAddTask={addTask}
                vendors={vendors}
                activeEventId={activeEvent}
              />
            </CardContent>
          </Card>

          <TaskList
            tasks={eventTasks}
            vendors={vendors}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onToggleTask={toggleTaskCompletion}
            onAddSubTask={addSubTask}
            onToggleSubTask={toggleSubTaskCompletion}
            onAddComment={addComment}
            onUpdateProgress={updateTaskProgress}
            onAssignToVendor={assignTaskToVendor}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="pt-6">
              <CalendarView
                tasks={eventTasks}
                onUpdateTask={updateTask}
                event={events.find((e) => e.id === activeEvent)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardContent className="pt-6">
              <VendorManagement
                vendors={vendors}
                tasks={eventTasks}
                onAddVendor={addVendor}
                onAssignTask={assignTaskToVendor}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardContent className="pt-6">
              <BudgetTracker
                event={events.find((e) => e.id === activeEvent)}
                vendors={vendors}
                tasks={eventTasks}
                onUpdateBudget={(updates) => updateBudget(activeEvent, updates)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent className="pt-6">
              <ProgressDashboard
                tasks={eventTasks}
                vendors={vendors}
                event={events.find((e) => e.id === activeEvent)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showNotificationSettings && (
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {showTemplates && (
        <TaskTemplates
          onClose={() => setShowTemplates(false)}
          onApplyTemplate={applyTemplate}
        />
      )}

      <Dialog
        open={eventToDelete !== null}
        onOpenChange={(open) => !open && setEventToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete &quot;
              {events.find((e) => e.id === eventToDelete)?.name}&quot;?
            </p>
            <p className="text-destructive mt-2">
              This will also delete all tasks associated with this event.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (eventToDelete) {
                  deleteEvent(eventToDelete);
                  setEventToDelete(null);
                }
              }}
            >
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
