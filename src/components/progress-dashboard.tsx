"use client";

import type { Task, Vendor, Event } from "@/types/todo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipItem,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

interface ProgressDashboardProps {
  tasks: Task[];
  vendors?: Vendor[];
  event?: Event;
}

export default function ProgressDashboard({
  tasks,
  vendors,
  event,
}: ProgressDashboardProps) {
  // Calculate overall progress
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate priority breakdown
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high"
  ).length;
  const mediumPriorityTasks = tasks.filter(
    (task) => task.priority === "medium"
  ).length;
  const lowPriorityTasks = tasks.filter(
    (task) => task.priority === "low"
  ).length;

  // Calculate completion by priority
  const highPriorityCompleted = tasks.filter(
    (task) => task.priority === "high" && task.completed
  ).length;
  const mediumPriorityCompleted = tasks.filter(
    (task) => task.priority === "medium" && task.completed
  ).length;
  const lowPriorityCompleted = tasks.filter(
    (task) => task.priority === "low" && task.completed
  ).length;

  const highPriorityProgress =
    highPriorityTasks > 0
      ? Math.round((highPriorityCompleted / highPriorityTasks) * 100)
      : 0;
  const mediumPriorityProgress =
    mediumPriorityTasks > 0
      ? Math.round((mediumPriorityCompleted / mediumPriorityTasks) * 100)
      : 0;
  const lowPriorityProgress =
    lowPriorityTasks > 0
      ? Math.round((lowPriorityCompleted / lowPriorityTasks) * 100)
      : 0;

  // Prepare data for charts
  const priorityData = [
    { name: "High", value: highPriorityTasks },
    { name: "Medium", value: mediumPriorityTasks },
    { name: "Low", value: lowPriorityTasks },
  ];

  const completionData = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: totalTasks - completedTasks },
  ];

  // Weekly task data
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyData = daysOfWeek.map((day) => {
    const tasksOnDay = tasks.filter(
      (task) => task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
    const completedOnDay = tasksOnDay.filter((task) => task.completed).length;

    return {
      name: format(day, "EEE"),
      total: tasksOnDay.length,
      completed: completedOnDay,
    };
  });

  // Colors for charts
  const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#6366f1"];
  const COMPLETION_COLORS = ["#10b981", "#e5e7eb"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed, {totalTasks - completedTasks} pending
            </p>
            <Progress value={overallProgress} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTasks}</div>
            <p className="text-xs text-muted-foreground">
              {highPriorityCompleted} completed,{" "}
              {highPriorityTasks - highPriorityCompleted} pending
            </p>
            <Progress
              value={highPriorityProgress}
              className="h-1 mt-2"
              indicatorClassName="bg-red-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediumPriorityTasks}</div>
            <p className="text-xs text-muted-foreground">
              {mediumPriorityCompleted} completed,{" "}
              {mediumPriorityTasks - mediumPriorityCompleted} pending
            </p>
            <Progress
              value={mediumPriorityProgress}
              className="h-1 mt-2"
              indicatorClassName="bg-yellow-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowPriorityTasks}</div>
            <p className="text-xs text-muted-foreground">
              {lowPriorityCompleted} completed,{" "}
              {lowPriorityTasks - lowPriorityCompleted} pending
            </p>
            <Progress
              value={lowPriorityProgress}
              className="h-1 mt-2"
              indicatorClassName="bg-green-500"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Task Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Task Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer>
                  <Chart>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={weeklyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <ChartTooltipContent>
                                  <ChartTooltipItem
                                    label={`${payload[0].payload.name}`}
                                    value={`${payload[0].value} total tasks`}
                                    color="#6366f1"
                                  />
                                  <ChartTooltipItem
                                    label="Completed"
                                    value={`${payload[1].value} tasks`}
                                    color="#10b981"
                                  />
                                </ChartTooltipContent>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="total" fill="#6366f1" />
                        <Bar dataKey="completed" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Chart>
                  <ChartLegend>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-indigo-500" />
                        <span className="text-sm">Total Tasks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Completed</span>
                      </div>
                    </div>
                  </ChartLegend>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer>
                    <Chart>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {priorityData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltipContent>
                                    <ChartTooltipItem
                                      label={payload[0].name}
                                      value={`${payload[0].value} tasks`}
                                      color={
                                        COLORS[
                                          priorityData.findIndex(
                                            (item) =>
                                              item.name === payload[0].name
                                          )
                                        ]
                                      }
                                    />
                                  </ChartTooltipContent>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Chart>
                    <ChartLegend>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <span className="text-sm">High</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                          <span className="text-sm">Medium</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span className="text-sm">Low</span>
                        </div>
                      </div>
                    </ChartLegend>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer>
                    <Chart>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={completionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {completionData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  COMPLETION_COLORS[
                                    index % COMPLETION_COLORS.length
                                  ]
                                }
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltipContent>
                                    <ChartTooltipItem
                                      label={payload[0].name}
                                      value={`${payload[0].value} tasks`}
                                      color={
                                        COMPLETION_COLORS[
                                          completionData.findIndex(
                                            (item) =>
                                              item.name === payload[0].name
                                          )
                                        ]
                                      }
                                    />
                                  </ChartTooltipContent>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Chart>
                    <ChartLegend>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span className="text-sm">Completed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                          <span className="text-sm">Pending</span>
                        </div>
                      </div>
                    </ChartLegend>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
