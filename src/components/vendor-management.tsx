"use client";

import { useState } from "react";
import type { Vendor, Task } from "@/types/todo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, Mail, Phone, MapPin, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VendorManagementProps {
  vendors: Vendor[];
  tasks: Task[];
  onAddVendor: (vendor: Vendor) => void;
  onAssignTask: (taskId: string, vendorId: string) => void;
}

export default function VendorManagement({
  vendors,
  tasks,
  onAddVendor,
  onAssignTask,
}: VendorManagementProps) {
  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: "",
    service: "",
    email: "",
    phone: "",
    location: "",
    rating: 5,
  });
  const [assigningTask, setAssigningTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.service) return;

    const vendor: Vendor = {
      id: Date.now().toString(),
      name: newVendor.name,
      service: newVendor.service,
      email: newVendor.email || "",
      phone: newVendor.phone || "",
      location: newVendor.location || "",
      rating: newVendor.rating || 5,
      createdAt: new Date().toISOString(),
    };

    onAddVendor(vendor);
    setShowAddVendorDialog(false);
    setNewVendor({
      name: "",
      service: "",
      email: "",
      phone: "",
      location: "",
      rating: 5,
    });
  };

  const handleAssignTask = () => {
    if (selectedVendor && selectedTaskId) {
      onAssignTask(selectedTaskId, selectedVendor.id);
      setAssigningTask(false);
      setSelectedTaskId("");
    }
  };

  // Get tasks assigned to the selected vendor
  const getVendorTasks = (vendorId: string) => {
    return tasks.filter((task) => task.assignedTo === vendorId);
  };

  // Calculate vendor performance metrics
  const getVendorPerformance = (vendorId: string) => {
    const vendorTasks = getVendorTasks(vendorId);
    if (vendorTasks.length === 0) return { completion: 0, onTime: 0, total: 0 };

    const completedTasks = vendorTasks.filter((task) => task.completed).length;
    const completionRate = Math.round(
      (completedTasks / vendorTasks.length) * 100
    );

    // Calculate on-time completion rate
    const completedOnTime = vendorTasks.filter((task) => {
      if (!task.completed || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const completedDate = task.completedAt
        ? new Date(task.completedAt)
        : new Date();
      return completedDate <= dueDate;
    }).length;

    const onTimeRate =
      vendorTasks.length > 0
        ? Math.round((completedOnTime / vendorTasks.length) * 100)
        : 0;

    return {
      completion: completionRate,
      onTime: onTimeRate,
      total: vendorTasks.length,
    };
  };

  // Get unassigned tasks that can be assigned to vendors
  const unassignedTasks = tasks.filter(
    (task) => !task.assignedTo && !task.completed
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Management</h2>
        <Button onClick={() => setShowAddVendorDialog(true)}>Add Vendor</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Vendor List</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {vendors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground text-center mb-4">
                  No vendors yet. Add your first vendor!
                </p>
                <Button onClick={() => setShowAddVendorDialog(true)}>
                  Add Vendor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{vendor.name}</CardTitle>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < vendor.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <CardDescription>{vendor.service}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {vendor.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {vendor.phone}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {vendor.location}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">
                          Assigned Tasks
                        </span>
                        <span className="text-xs font-medium">
                          {getVendorTasks(vendor.id).length}
                        </span>
                      </div>
                      <Progress
                        value={getVendorPerformance(vendor.id).completion}
                        className="h-1"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setAssigningTask(true);
                        }}
                        disabled={unassignedTasks.length === 0}
                      >
                        Assign Task
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance</CardTitle>
              <CardDescription>
                Track how vendors are performing on assigned tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    No vendors to display performance metrics
                  </p>
                ) : (
                  vendors.map((vendor) => {
                    const performance = getVendorPerformance(vendor.id);
                    return (
                      <div key={vendor.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {vendor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{vendor.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {vendor.service}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {performance.total} tasks
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Task Completion</span>
                              <span className="text-sm font-medium">
                                {performance.completion}%
                              </span>
                            </div>
                            <Progress
                              value={performance.completion}
                              className="h-2"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">On-Time Delivery</span>
                              <span className="text-sm font-medium">
                                {performance.onTime}%
                              </span>
                            </div>
                            <Progress
                              value={performance.onTime}
                              className="h-2"
                              indicatorClassName={
                                performance.onTime > 70
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                          <div className="border rounded p-2">
                            <div className="text-2xl font-bold">
                              {performance.total}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Tasks
                            </div>
                          </div>
                          <div className="border rounded p-2">
                            <div className="text-2xl font-bold flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                              {Math.round(
                                performance.total *
                                  (performance.completion / 100)
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Completed
                            </div>
                          </div>
                          <div className="border rounded p-2">
                            <div className="text-2xl font-bold flex items-center justify-center">
                              <Clock className="h-5 w-5 text-amber-500 mr-1" />
                              {performance.total -
                                Math.round(
                                  performance.total *
                                    (performance.completion / 100)
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Pending
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <Dialog open={showAddVendorDialog} onOpenChange={setShowAddVendorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor Name</Label>
                <Input
                  id="vendor-name"
                  value={newVendor.name}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, name: e.target.value })
                  }
                  placeholder="Enter vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-service">Service</Label>
                <Input
                  id="vendor-service"
                  value={newVendor.service}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, service: e.target.value })
                  }
                  placeholder="e.g., Catering, Photography"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-email">Email</Label>
              <Input
                id="vendor-email"
                type="email"
                value={newVendor.email || ""}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, email: e.target.value })
                }
                placeholder="vendor@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-phone">Phone</Label>
                <Input
                  id="vendor-phone"
                  value={newVendor.phone || ""}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, phone: e.target.value })
                  }
                  placeholder="(123) 456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-location">Location</Label>
                <Input
                  id="vendor-location"
                  value={newVendor.location || ""}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, location: e.target.value })
                  }
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-rating">Rating</Label>
              <Select
                value={newVendor.rating?.toString() || "5"}
                onValueChange={(value) =>
                  setNewVendor({ ...newVendor, rating: Number.parseInt(value) })
                }
              >
                <SelectTrigger id="vendor-rating">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddVendorDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddVendor}>Add Vendor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Details Dialog */}
      {selectedVendor && !assigningTask && (
        <Dialog
          open={!!selectedVendor}
          onOpenChange={(open) => !open && setSelectedVendor(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedVendor.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedVendor.service}
                  </h3>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedVendor.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Badge variant="outline">
                  Added{" "}
                  {format(new Date(selectedVendor.createdAt), "MMM d, yyyy")}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{selectedVendor.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{selectedVendor.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{selectedVendor.location}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Assigned Tasks</h3>
                {getVendorTasks(selectedVendor.id).length === 0 ? (
                  <p className="text-muted-foreground">
                    No tasks assigned to this vendor yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getVendorTasks(selectedVendor.id).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-500" />
                          )}
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.dueDate &&
                                `Due: ${format(
                                  new Date(task.dueDate),
                                  "MMM d, yyyy"
                                )}`}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={
                            task.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {task.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setAssigningTask(true);
                }}
                disabled={unassignedTasks.length === 0}
              >
                Assign New Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Task Dialog */}
      {selectedVendor && assigningTask && (
        <Dialog
          open={assigningTask}
          onOpenChange={(open) => !open && setAssigningTask(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Task to {selectedVendor.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {unassignedTasks.length === 0 ? (
                <p className="text-muted-foreground">
                  No unassigned tasks available.
                </p>
              ) : (
                <>
                  <Select
                    value={selectedTaskId}
                    onValueChange={setSelectedTaskId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          <div className="flex items-center">
                            <div className="mr-2">
                              <div
                                className={`h-3 w-3 rounded-full ${
                                  task.priority === "high"
                                    ? "bg-red-500"
                                    : task.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              />
                            </div>
                            {task.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTaskId && (
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium">
                        {
                          unassignedTasks.find((t) => t.id === selectedTaskId)
                            ?.title
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {
                          unassignedTasks.find((t) => t.id === selectedTaskId)
                            ?.description
                        }
                      </p>
                      {unassignedTasks.find((t) => t.id === selectedTaskId)
                        ?.dueDate && (
                        <div className="flex items-center mt-2 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Due:{" "}
                          {format(
                            new Date(
                              unassignedTasks.find(
                                (t) => t.id === selectedTaskId
                              )?.dueDate ?? new Date()
                            ),
                            "MMM d, yyyy"
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssigningTask(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTask} disabled={!selectedTaskId}>
                Assign Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
