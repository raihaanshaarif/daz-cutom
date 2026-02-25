"use client";

import { Task } from "@/types";
import { useEffect, useState } from "react";
import { TaskTable } from "./TaskTable";
import { ClipboardList, Database } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function MyTaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchMyTasks = async () => {
      setLoading(true);
      try {
        const userId = session?.user?.id;
        if (!userId) {
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          userId: userId.toString(),
        });

        const res = await fetch(
          `http://localhost:5001/api/v1/task/my?${params.toString()}`,
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
    fetchMyTasks();
  }, [currentPage, refreshTrigger, session]);

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
      toast.success("Progress updated successfully");
      setRefreshTrigger((p) => p + 1);
    } catch {
      toast.error("Failed to update progress");
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
            <p className="text-gray-500 text-sm">Loading your tasks...</p>
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
            My Tasks
          </h1>
          <p className="text-gray-500 text-xs">
            Tasks assigned to you ({totalTasks} total)
          </p>
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
              showAssignedBy={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
