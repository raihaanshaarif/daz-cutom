"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  User as UserIcon,
  Shield,
  Activity,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskRefresh, setTaskRefresh] = useState(0);
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const userId = searchParams.get("id");

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5001/api/v1/user/${userId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      try {
        const res = await fetch(
          `http://localhost:5001/api/v1/task/my?userId=${userId}&limit=100`,
        );
        const json = await res.json();
        const data = json?.data || json || [];
        setTasks(Array.isArray(data) ? data : []);
      } catch {
        // silently ignore
      }
    };
    fetchTasks();
  }, [userId, taskRefresh]);

  const handleUpdateTarget = async (task: Task) => {
    const newTargetStr = prompt(
      `Enter new daily target for "${task.title}" (current: ${task.targetValue}):`,
    );
    if (newTargetStr === null) return;
    const newTarget = Number(newTargetStr);
    if (isNaN(newTarget) || newTarget <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5001/api/v1/task/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetValue: newTarget }),
      });
      if (!res.ok) throw new Error("Failed");
      setTaskRefresh((p) => p + 1);
    } catch {
      alert("Failed to update target.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "INACTIVE":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "BLOCK":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "BLOCK":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "USER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mb-3">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-gray-500 text-sm">Error: {error}</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mb-3">
              <UserIcon className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-sm">User not found</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User List
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-md">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              {user.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className={getStatusColor(user.status)}>
                {getStatusIcon(user.status)}
                <span className="ml-1">{user.status}</span>
              </Badge>
              <Badge className={getRoleColor(user.role)}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          {/* Profile Picture & Quick Stats */}
          <div className="space-y-12">
            {/* TARGETS */}
            {tasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">TARGETS</h3>
                </div>
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const todayStr = new Date().toDateString();
                    const todayLog = (task.dailyLogs || []).find(
                      (log) => new Date(log.date).toDateString() === todayStr,
                    );
                    const todayAchieved = todayLog?.achieved || 0;
                    const todayTarget =
                      todayLog?.targetValue || task.targetValue;
                    const todayPct =
                      todayTarget > 0
                        ? Math.min(
                            Math.round((todayAchieved / todayTarget) * 100),
                            100,
                          )
                        : 0;

                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
                    thirtyDaysAgo.setHours(0, 0, 0, 0);
                    const isWorkingDay = (d: Date) =>
                      d.getDay() !== 5 && d.getDay() !== 6; // exclude Fri & Sat
                    const thirtyDayLogs = (task.dailyLogs || []).filter(
                      (log) => {
                        const d = new Date(log.date);
                        return d >= thirtyDaysAgo && isWorkingDay(d);
                      },
                    );
                    const thirtyDayAchieved = thirtyDayLogs.reduce(
                      (sum, log) => sum + (log.achieved || 0),
                      0,
                    );
                    // Count working days (excl. Fri & Sat) in last 30 calendar days
                    const workingDaysIn30 = Array.from(
                      { length: 30 },
                      (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return d;
                      },
                    ).filter(isWorkingDay).length;
                    const thirtyDayTarget = task.targetValue * workingDaysIn30;
                    const thirtyDayPct =
                      thirtyDayTarget > 0
                        ? Math.min(
                            Math.round(
                              (thirtyDayAchieved / thirtyDayTarget) * 100,
                            ),
                            100,
                          )
                        : 0;
                    const thirtyDayRemaining = Math.max(
                      thirtyDayTarget - thirtyDayAchieved,
                      0,
                    );
                    const thirtyDayComplete =
                      thirtyDayAchieved >= thirtyDayTarget;

                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 6);
                    weekAgo.setHours(0, 0, 0, 0);
                    const weeklyLogs = (task.dailyLogs || []).filter(
                      (log) => new Date(log.date) >= weekAgo,
                    );
                    const weeklyAchieved = weeklyLogs.reduce(
                      (sum, log) => sum + (log.achieved || 0),
                      0,
                    );
                    const weeklyTarget = task.targetValue * 5;
                    const weeklyPct =
                      weeklyTarget > 0
                        ? Math.min(
                            Math.round((weeklyAchieved / weeklyTarget) * 100),
                            100,
                          )
                        : 0;
                    const weeklyRemaining = Math.max(
                      weeklyTarget - weeklyAchieved,
                      0,
                    );
                    const weeklyComplete = weeklyAchieved >= weeklyTarget;

                    const yesterdayDate = new Date();
                    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                    const yesterdayStr = yesterdayDate.toDateString();
                    const yesterdayLog = (task.dailyLogs || []).find(
                      (log) =>
                        new Date(log.date).toDateString() === yesterdayStr,
                    );
                    const yesterdayAchieved = yesterdayLog?.achieved || 0;
                    const yesterdayTarget =
                      yesterdayLog?.targetValue || task.targetValue;
                    const yesterdayPct =
                      yesterdayTarget > 0
                        ? Math.min(
                            Math.round(
                              (yesterdayAchieved / yesterdayTarget) * 100,
                            ),
                            100,
                          )
                        : 0;
                    const yesterdayComplete =
                      yesterdayAchieved >= yesterdayTarget;

                    return (
                      <div
                        key={task.id}
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
                      >
                        {/* Card 1 — Task Info + Today's Progress */}
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4 border-b border-gray-100">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`ml-2 shrink-0 inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                                    task.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {task.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                            <div className="p-4 bg-blue-50/40">
                              <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <TrendingUp className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-blue-700">
                                  Today&apos;s Progress
                                </span>
                              </div>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs text-gray-500">
                                  {todayAchieved} / {todayTarget} achieved today
                                </span>
                                <span className="text-xs font-bold text-blue-600">
                                  {todayPct}%
                                </span>
                              </div>
                              <div className="w-full bg-blue-100 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                                  style={{ width: `${todayPct}%` }}
                                />
                              </div>
                              {!todayLog && (
                                <p className="text-xs text-gray-400 mt-1 italic">
                                  No log entry for today yet
                                </p>
                              )}
                            </div>{" "}
                            {isAdmin && (
                              <div className="px-4 pb-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-7 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => handleUpdateTarget(task)}
                                >
                                  Update Target
                                </Button>
                              </div>
                            )}{" "}
                          </CardContent>
                        </Card>

                        {/* Card 2 — Yesterday's Progress */}
                        <Card className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-amber-700">
                                Yesterday&apos;s Progress
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">
                                {yesterdayAchieved} / {yesterdayTarget}{" "}
                                yesterday
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  yesterdayComplete
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {yesterdayPct}%
                              </span>
                            </div>
                            <div className="w-full bg-amber-100 rounded-full h-2 mb-4">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  yesterdayComplete
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : "bg-gradient-to-r from-amber-400 to-amber-600"
                                }`}
                                style={{ width: `${yesterdayPct}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-amber-50 rounded p-1.5">
                                <div className="text-xs text-gray-500">
                                  Target
                                </div>
                                <div className="text-sm font-bold text-amber-600">
                                  {yesterdayTarget}
                                </div>
                              </div>
                              <div className="bg-yellow-50 rounded p-1.5">
                                <div className="text-xs text-gray-500">
                                  Achieved
                                </div>
                                <div className="text-sm font-bold text-yellow-600">
                                  {yesterdayAchieved}
                                </div>
                              </div>
                              <div
                                className={`rounded p-1.5 ${
                                  yesterdayComplete
                                    ? "bg-green-50"
                                    : "bg-orange-50"
                                }`}
                              >
                                <div className="text-xs text-gray-500">Gap</div>
                                <div
                                  className={`text-sm font-bold ${
                                    yesterdayComplete
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {yesterdayComplete ? (
                                    <TrendingUp className="w-4 h-4 mx-auto" />
                                  ) : (
                                    yesterdayTarget - yesterdayAchieved
                                  )}
                                </div>
                              </div>
                            </div>
                            {!yesterdayLog && (
                              <p className="text-xs text-gray-400 mt-2 italic">
                                No log entry for yesterday
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        {/* Card 4 — Weekly Progress */}
                        <Card className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-purple-700">
                                This Week&apos;s Progress
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">
                                {weeklyAchieved} / {weeklyTarget} this week
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  weeklyComplete
                                    ? "text-green-600"
                                    : "text-purple-600"
                                }`}
                              >
                                {weeklyPct}%
                              </span>
                            </div>
                            <div className="w-full bg-purple-100 rounded-full h-2 mb-4">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  weeklyComplete
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : "bg-gradient-to-r from-purple-400 to-purple-600"
                                }`}
                                style={{ width: `${weeklyPct}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-purple-50 rounded p-1.5">
                                <div className="text-xs text-gray-500">
                                  W.Target
                                </div>
                                <div className="text-sm font-bold text-purple-600">
                                  {weeklyTarget}
                                </div>
                              </div>
                              <div className="bg-violet-50 rounded p-1.5">
                                <div className="text-xs text-gray-500">
                                  Achieved
                                </div>
                                <div className="text-sm font-bold text-violet-600">
                                  {weeklyAchieved}
                                </div>
                              </div>
                              <div
                                className={`rounded p-1.5 ${
                                  weeklyRemaining === 0
                                    ? "bg-green-50"
                                    : "bg-orange-50"
                                }`}
                              >
                                <div className="text-xs text-gray-500">
                                  Remaining
                                </div>
                                <div
                                  className={`text-sm font-bold ${
                                    weeklyRemaining === 0
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {weeklyRemaining === 0 ? (
                                    <TrendingUp className="w-4 h-4 mx-auto" />
                                  ) : (
                                    weeklyRemaining
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {weeklyLogs.length} log
                              {weeklyLogs.length !== 1 ? "s" : ""} this week
                            </p>
                          </CardContent>
                        </Card>

                        {/* Card 4 — Last 30 Days Progress */}
                        <Card className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-1.5 mb-3">
                              <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-teal-700">
                                Last 30 Days
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">
                                {thirtyDayAchieved} / {thirtyDayTarget}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  thirtyDayComplete
                                    ? "text-green-600"
                                    : "text-teal-600"
                                }`}
                              >
                                {thirtyDayPct}%
                              </span>
                            </div>
                            <div className="w-full bg-teal-100 rounded-full h-2 mb-4">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  thirtyDayComplete
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : "bg-gradient-to-r from-teal-400 to-teal-600"
                                }`}
                                style={{ width: `${thirtyDayPct}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-teal-50 rounded p-1.5">
                                <div className="text-xs text-gray-500">
                                  Target
                                </div>
                                <div className="text-sm font-bold text-teal-600">
                                  {thirtyDayTarget}
                                </div>
                              </div>
                              <div className="bg-cyan-50 rounded p-1.5">
                                <div className="text-xs text-gray-500">
                                  Achieved
                                </div>
                                <div className="text-sm font-bold text-cyan-600">
                                  {thirtyDayAchieved}
                                </div>
                              </div>
                              <div
                                className={`rounded p-1.5 ${
                                  thirtyDayRemaining === 0
                                    ? "bg-green-50"
                                    : "bg-orange-50"
                                }`}
                              >
                                <div className="text-xs text-gray-500">
                                  Remaining
                                </div>
                                <div
                                  className={`text-sm font-bold ${
                                    thirtyDayRemaining === 0
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {thirtyDayRemaining === 0 ? (
                                    <TrendingUp className="w-4 h-4 mx-auto" />
                                  ) : (
                                    thirtyDayRemaining
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {thirtyDayLogs.length} log
                              {thirtyDayLogs.length !== 1 ? "s" : ""} ·{" "}
                              {workingDaysIn30} working days (excl. Fri &amp;
                              Sat)
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h3 className="text-xl font-bold"> STATS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-9 gap-1">
              {/* Today's Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      return (
                        contactDate.toDateString() === today.toDateString()
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Today&apos;s Contacts
                  </div>
                </CardContent>
              </Card>

              {/* This Week's Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const weekAgo = new Date(
                        today.getTime() - 7 * 24 * 60 * 60 * 1000,
                      );
                      return contactDate >= weekAgo;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Week Contacts
                  </div>
                </CardContent>
              </Card>

              {/* This Month's Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const monthAgo = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                      return contactDate >= monthAgo;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Month Contacts
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Average Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {(() => {
                      const contacts = user.contacts || [];
                      if (contacts.length === 0) return 0;

                      const earliestDate = new Date(
                        Math.min(
                          ...contacts.map((c) =>
                            new Date(c.createdAt).getTime(),
                          ),
                        ),
                      );
                      const today = new Date();
                      const monthsDiff = Math.max(
                        1,
                        (today.getFullYear() - earliestDate.getFullYear()) *
                          12 +
                          (today.getMonth() - earliestDate.getMonth()) +
                          1,
                      );
                      const average = contacts.length / monthsDiff;
                      return average.toFixed(1);
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Monthly Average
                  </div>
                </CardContent>
              </Card>

              {/* Lifetime Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-indigo-600">
                    {user.contacts?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Lifetime Contacts
                  </div>
                </CardContent>
              </Card>

              {/* This Month Responded Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-teal-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const monthAgo = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                      return (
                        contactDate >= monthAgo &&
                        contact.status === "RESPONDED"
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Month Responded
                  </div>
                </CardContent>
              </Card>

              {/* This Month Negotiating Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-amber-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const monthAgo = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                      return (
                        contactDate >= monthAgo &&
                        contact.status === "NEGOTIATING"
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Month Negotiating
                  </div>
                </CardContent>
              </Card>

              {/* This Year Won Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-emerald-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const yearStart = new Date(today.getFullYear(), 0, 1);
                      return (
                        contactDate >= yearStart &&
                        contact.status === "CLOSED_WON"
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Year Won
                  </div>
                </CardContent>
              </Card>

              {/* Lifetime Won Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-cyan-600">
                    {user.contacts?.filter(
                      (contact) => contact.status === "CLOSED_WON",
                    ).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Lifetime Won</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Contacts Table */}
        <div className="mt-8">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mb-2 shadow-md">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
              Recent Contacts
            </h2>
            <p className="text-gray-500 text-sm">
              Latest contacts added by this user (showing up to 40)
            </p>
          </div>

          <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.contacts
                      ?.sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage,
                      )
                      .map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {contact.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {contact.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {contact.company}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                contact.status === "CLOSED_WON"
                                  ? "bg-green-100 text-green-800"
                                  : contact.status === "NEGOTIATING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : contact.status === "RESPONDED"
                                      ? "bg-blue-100 text-blue-800"
                                      : contact.status === "CONTACTED"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {contact.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {contact.country?.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {(!user.contacts || user.contacts.length === 0) && (
                  <div className="text-center py-8">
                    <UserIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No contacts found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {user.contacts && user.contacts.length > itemsPerPage && (
                <div className="flex items-center justify-end space-x-2 py-4 border-t border-gray-200">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      user.contacts.length,
                    )}{" "}
                    to{" "}
                    {Math.min(currentPage * itemsPerPage, user.contacts.length)}{" "}
                    of {user.contacts.length} contacts
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage >=
                        Math.ceil(user.contacts.length / itemsPerPage)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
