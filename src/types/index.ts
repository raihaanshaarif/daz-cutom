export interface User {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "BLOCK";
  phone?: string;
  picture?: string | null;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  contacts: Contact[];
}

export interface Country {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  designation?: string;
  company: string;
  domain?: string;
  country?: Country;
  companyLinkedin?: string;
  personalLinkedin?: string;
  status:
    | "NEW"
    | "CONTACTED"
    | "RESPONDED"
    | "QUALIFIED"
    | "NEGOTIATING"
    | "CLOSED_WON"
    | "CLOSED_LOST";
  note?: string;
  authorId: number;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  designation?: string;
  company: string;
  domain?: string;
  country?: number;
  companyLinkedin?: string;
  personalLinkedin?: string;
  status: Contact["status"];
  note?: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PerformanceMetrics {
  totalLeadsToday: number;
  leadsByEmployee: Array<{
    employeeId: number;
    employeeName: string;
    leadsCount: number;
  }>;
  leadsByStatus: Record<Contact["status"], number>;
  conversionRate: number;
}

export type TaskStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface TaskDailyLog {
  id: number;
  taskId: number;
  date: string;
  targetValue: number;
  achieved: number;
  performance?: number;
  status: TaskStatus;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  targetValue: number;
  assignedById: number;
  assignedToId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy?: User;
  assignedTo?: User;
  dailyLogs?: TaskDailyLog[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  targetValue: number;
  assignedToId: number;
}
