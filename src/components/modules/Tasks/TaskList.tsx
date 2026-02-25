"use client";

import { Task } from "@/types";
import { useEffect, useState } from "react";
import { TaskTable } from "./TaskTable";
import { ClipboardList, Database, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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

        const res = await fetch(
          `http://localhost:5001/api/v1/task/all?${params.toString()}`,
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
  }, [currentPage, searchTerm, refreshTrigger]);

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5001/api/v1/task/${task.id}`, {
        method: "DELETE",
      });
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
      const res = await fetch(`http://localhost:5001/api/v1/task/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !task.isActive }),
      });
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
      const res = await fetch(
        `http://localhost:5001/api/v1/task/${task.id}/progress`,
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
      const res = await fetch(`http://localhost:5001/api/v1/task/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetValue: newTarget }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Target updated successfully");
      setRefreshTrigger((p) => p + 1);
    } catch {
      toast.error("Failed to update target");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-3">
              <Database className="w-4 h-4 text-white animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-3 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-1 shadow-md">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            All Tasks
          </h1>
          <p className="text-gray-500 text-xs">
            Manage all assigned tasks ({totalTasks} total)
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                • Filtered by: &quot;{searchTerm}&quot;
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <Filter className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-xs font-medium text-gray-900">Filters</h2>
            </div>
            <div className="flex gap-2">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs font-medium text-gray-700">
                  Search Tasks
                </Label>
                <Input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-7 text-xs"
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
                    className="h-7 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
