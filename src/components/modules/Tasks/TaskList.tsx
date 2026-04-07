"use client";

import { Task } from "@/types";
import { useEffect, useState } from "react";
import { TaskTable } from "./TaskTable";
import { ClipboardList, Filter, X, Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskList() {
  const { authFetch } = useAuthFetch();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });
        if (searchTerm) params.append("search", searchTerm);

        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/task/all?${params.toString()}`,
          { cache: "no-store" },
        );
        const json = await res.json();
        const data = json?.data || json || [];
        const pagination = json?.pagination;

        setTasks(Array.isArray(data) ? data : []);
        setTotalPages(pagination?.totalPages || 1);
        setTotalTasks(
          pagination?.total || (Array.isArray(data) ? data.length : 0),
        );
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [currentPage, searchTerm, refreshTrigger, authFetch]);

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/task/${task.id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Task deleted");
      setRefreshTrigger((p) => p + 1);
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleToggleActive = async (task: Task) => {
    const action = task.isActive ? "disable" : "re-enable";
    if (!confirm(`Are you sure you want to ${action} task "${task.title}"?`))
      return;
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/task/${task.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !task.isActive }),
        },
      );
      if (!res.ok) throw new Error("Toggle failed");
      toast.success(`Task ${action}d successfully`);
      setRefreshTrigger((p) => p + 1);
    } catch {
      toast.error(`Failed to ${action} task`);
    }
  };

  const handleUpdateProgress = async (task: Task) => {
    const achievedStr = prompt(
      `Enter today's achieved value for "${task.title}" (target: ${task.targetValue}):`,
    );
    if (achievedStr === null) return;
    const achieved = Number(achievedStr);
    if (isNaN(achieved) || achieved < 0) {
      toast.error("Invalid value");
      return;
    }
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/task/${task.id}/progress`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ achieved, date: new Date().toISOString() }),
        },
      );
      if (!res.ok) throw new Error("Update failed");
      toast.success("Progress updated");
      setRefreshTrigger((p) => p + 1);
    } catch {
      toast.error("Failed to update progress");
    }
  };

  const handleUpdateTarget = async (task: Task) => {
    const newTargetStr = prompt(
      `Enter new daily target for "${task.title}" (current: ${task.targetValue}):`,
    );
    if (newTargetStr === null) return;
    const newTarget = Number(newTargetStr);
    if (isNaN(newTarget) || newTarget <= 0) {
      toast.error("Invalid target value");
      return;
    }
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/task/${task.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetValue: newTarget }),
        },
      );
      if (!res.ok) throw new Error("Update failed");
      toast.success("Target updated successfully");
      setRefreshTrigger((p) => p + 1);
    } catch {
      toast.error("Failed to update target");
    }
  };

  if (loading) {
    if (tasks.length === 0) {
      return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-8 px-4">
          <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-[600px] w-full rounded-[32px]" />
          </div>
        </div>
      );
    }
  }
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Task List
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400">
                Manage assigned tasks · {totalTasks} records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-11 px-5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => router.push("/dashboard/tasks/create-task")}
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Search
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
            >
              {showFilters ? (
                <>
                  <X className="w-3.5 h-3.5 mr-2" />
                  Hide Filters
                </>
              ) : (
                <>
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Show Filters
                </>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-end gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="w-72 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Search
                </Label>
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm"
                />
              </div>

              {searchTerm && (
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    variant="outline"
                    size="sm"
                    className="h-11 px-3"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <div className="ml-auto space-y-2 min-w-[140px]">
                <div className="h-4" />
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-100/80">
                  <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    {tasks.length} / {totalTasks} Records
                  </span>
                </div>
              </div>
            </div>
          )}

          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/60 dark:shadow-none rounded-[32px] bg-white dark:bg-zinc-900 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
            <CardHeader className="pb-4 pt-8 px-8 border-b border-zinc-50 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Task Management
                  </CardTitle>
                  <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                    Browse and manage all tasks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <TaskTable
                data={tasks}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                onUpdateProgress={handleUpdateProgress}
                onUpdateTarget={handleUpdateTarget}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                showAssignedBy={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
