"use client";

import { useState } from "react";
import type { Event, Vendor, Task } from "@/types/todo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { Chart, ChartContainer, ChartLegend } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

interface BudgetUpdates {
  total?: number;
  spent?: number;
  categories?: BudgetCategory[];
}

interface BudgetTrackerProps {
  event?: Event;
  vendors?: Vendor[];
  tasks?: Task[];
  onUpdateBudget: (updates: BudgetUpdates) => void;
}

export default function BudgetTracker({
  event,
  vendors = [],
  tasks = [],
  onUpdateBudget,
}: BudgetTrackerProps) {
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<BudgetCategory>>({
    name: "",
    allocated: 0,
    spent: 0,
  });
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseDescription, setExpenseDescription] = useState("");

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Please select an event to view budget information.
        </p>
      </div>
    );
  }

  const budget = event.budget || { total: 0, spent: 0, categories: [] };
  const categories: BudgetCategory[] = budget.categories || [];

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.allocated) return;

    const category: BudgetCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      allocated: Number(newCategory.allocated),
      spent: Number(newCategory.spent || 0),
    };

    const updatedCategories = [...categories, category];
    const updatedTotal = updatedCategories.reduce(
      (sum, cat) => sum + cat.allocated,
      0
    );

    onUpdateBudget({
      total: updatedTotal,
      categories: updatedCategories,
    });

    setShowAddCategoryDialog(false);
    setNewCategory({
      name: "",
      allocated: 0,
      spent: 0,
    });
  };

  const handleAddExpense = () => {
    if (!expenseCategory || expenseAmount <= 0) return;

    const updatedCategories = categories.map((cat) => {
      if (cat.id === expenseCategory) {
        return {
          ...cat,
          spent: cat.spent + expenseAmount,
        };
      }
      return cat;
    });

    const updatedSpent = updatedCategories.reduce(
      (sum, cat) => sum + cat.spent,
      0
    );

    onUpdateBudget({
      spent: updatedSpent,
      categories: updatedCategories,
    });

    setShowAddExpenseDialog(false);
    setExpenseCategory("");
    setExpenseAmount(0);
    setExpenseDescription("");
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter((cat) => cat.id !== categoryId);
    const updatedTotal = updatedCategories.reduce(
      (sum, cat) => sum + cat.allocated,
      0
    );
    const updatedSpent = updatedCategories.reduce(
      (sum, cat) => sum + cat.spent,
      0
    );

    onUpdateBudget({
      total: updatedTotal,
      spent: updatedSpent,
      categories: updatedCategories,
    });
  };

  const totalBudget = budget.total || 0;
  const totalSpent = budget.spent || 0;
  const remainingBudget = totalBudget - totalSpent;
  const budgetProgress =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const categoryData = categories.map((cat) => ({
    name: cat.name,
    allocated: cat.allocated,
    spent: cat.spent,
    remaining: cat.allocated - cat.spent,
  }));

  const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Tracker</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddExpenseDialog(true)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button onClick={() => setShowAddCategoryDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalBudget.toLocaleString()}
            </div>
            <Progress value={budgetProgress} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetProgress}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{remainingBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0
                ? Math.round((remainingBudget / totalBudget) * 100)
                : 0}
              % of total budget
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Budget Categories</TabsTrigger>
          <TabsTrigger value="overview">Budget Overview</TabsTrigger>
          <TabsTrigger value="vendor">Vendor Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4 mt-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground text-center mb-4">
                  No budget categories yet. Add your first category!
                </p>
                <Button onClick={() => setShowAddCategoryDialog(true)}>
                  Add Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>{category.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      ₦{category.spent.toLocaleString()} of ₦
                      {category.allocated.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress
                        value={(category.spent / category.allocated) * 100}
                        className="h-2"
                        indicatorClassName={
                          category.spent > category.allocated
                            ? "bg-red-500"
                            : category.spent > category.allocated * 0.8
                            ? "bg-yellow-500"
                            : ""
                        }
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {Math.round(
                            (category.spent / category.allocated) * 100
                          )}
                          % spent
                        </span>
                        <span>
                          ₦
                          {(
                            category.allocated - category.spent
                          ).toLocaleString()}{" "}
                          remaining
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>
                  How your budget is distributed across categories
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer>
                  <Chart>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categories}
                          dataKey="allocated"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categories.map((entry, index) => (
                            <Cell
                              key={`cell-₦{index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border rounded-lg shadow">
                                  <p className="text-sm">
                                    {payload[0]?.name}: ₦
                                    {payload[0]?.value?.toLocaleString()}
                                  </p>
                                </div>
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
                      {categories.map((category, index) => (
                        <div
                          key={category.id}
                          className="flex items-center gap-1"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                      ))}
                    </div>
                  </ChartLegend>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Usage</CardTitle>
                <CardDescription>Spent vs. remaining budget</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer>
                  <Chart>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar
                          dataKey="spent"
                          stackId="a"
                          fill="#ef4444"
                          name="Spent"
                        />
                        <Bar
                          dataKey="remaining"
                          stackId="a"
                          fill="#10b981"
                          name="Remaining"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Chart>
                  <ChartLegend>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm">Spent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Remaining</span>
                      </div>
                    </div>
                  </ChartLegend>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Expenses</CardTitle>
              <CardDescription>Budget allocation by vendor</CardDescription>
            </CardHeader>
            <CardContent>
              {vendors.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  No vendors added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {vendors.map((vendor) => {
                    const vendorTasks = tasks.filter(
                      (task) => task.assignedTo === vendor.id
                    );
                    const vendorBudget = vendorTasks.reduce(
                      (sum, task) => sum + (task.budget || 0),
                      0
                    );

                    return (
                      <div
                        key={vendor.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.service}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            ₦{vendorBudget.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vendorTasks.length}{" "}
                            {vendorTasks.length === 1 ? "task" : "tasks"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g., Venue, Catering, Decorations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-budget">Allocated Budget (₦)</Label>
              <Input
                id="category-budget"
                type="number"
                value={newCategory.allocated || ""}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    allocated: Number(e.target.value),
                  })
                }
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-spent">Already Spent (₦)</Label>
              <Input
                id="category-spent"
                type="number"
                value={newCategory.spent || ""}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    spent: Number(e.target.value),
                  })
                }
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog
        open={showAddExpenseDialog}
        onOpenChange={setShowAddExpenseDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expense-category">Category</Label>
              <Select
                value={expenseCategory}
                onValueChange={setExpenseCategory}
              >
                <SelectTrigger id="expense-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount (₦)</Label>
              <Input
                id="expense-amount"
                type="number"
                value={expenseAmount || ""}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-description">
                Description (Optional)
              </Label>
              <Input
                id="expense-description"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="e.g., Deposit payment, Final invoice"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddExpenseDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={!expenseCategory || expenseAmount <= 0}
            >
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
