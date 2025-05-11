export type Priority = "low" | "medium" | "high";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Comment {
  id: string;
  text: string;
  timestamp: string;
  isVendor?: boolean;
  authorId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  completed: boolean;
  subTasks?: SubTask[];
  comments?: Comment[];
  progress: number;
  createdAt: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  assignedTo?: string;
  assignedAt?: string;
  completedAt?: string;
  budget?: number;
  eventId?: string;
  files?: FileUpload[];
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  createdAt: string;
  budget: Budget;
}

export interface Budget {
  total: number;
  spent: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  createdAt: string;
}

export interface CalendarIntegration {
  type: "google" | "outlook" | "apple";
  connected: boolean;
  lastSynced?: string;
}
