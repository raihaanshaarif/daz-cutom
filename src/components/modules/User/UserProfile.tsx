"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, Task, Country } from "@/types";
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
  Calendar,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const UserProfile = () => {
  const { authFetch } = useAuthFetch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskRefresh, setTaskRefresh] = useState(0);
  const [countries, setCountries] = useState<Country[]>([]);
  const itemsPerPage = 10;

  // Period analysis state
  type PeriodMode = "monthly" | "yearly" | "custom";
  const [periodMode, setPeriodMode] = useState<PeriodMode>("monthly");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

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
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/user/${userId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const responseData = await response.json();
        setUser(responseData?.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, authFetch]);

  useEffect(() => {
    authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/country?limit=1000`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.data || [];
        setCountries(list);
      })
      .catch(() => {});
  }, [authFetch]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/task/my?userId=${userId}&limit=100`,
        );
        const json = await res.json();
        const data = json?.data || [];
        setTasks(data);
      } catch {
        // silently ignore
      }
    };
    fetchTasks();
  }, [userId, taskRefresh, authFetch]);

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
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/task/${task.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetValue: newTarget }),
        },
      );
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
        return "bg-muted text-foreground border-border";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMMERCIAL":
        return "bg-green-100 text-green-800 border-green-200";
      case "MERCHANDISER":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "USER":
        return "bg-muted text-foreground border-border";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
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
      <div className="min-h-screen bg-background py-2 px-4">
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
    <div className="min-h-screen bg-background py-2 px-4">
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
            <h1 className="text-2xl font-semibold text-foreground mb-2">
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

            {/* ── DAILY TASKS DASHBOARD ── */}
            {tasks.length > 0 &&
              (() => {
                const now = new Date();
                const todayStr = now.toDateString();

                const yest = new Date(now);
                yest.setDate(now.getDate() - 1);
                const yesterdayStr = yest.toDateString();

                // this week Sun–Thu
                const dow = now.getDay();
                const wkSun = new Date(now);
                wkSun.setDate(now.getDate() - dow);
                wkSun.setHours(0, 0, 0, 0);

                // this month
                const monthStart = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  1,
                );

                const isWorkDay = (d: Date) =>
                  d.getDay() !== 5 && d.getDay() !== 6;

                // overall summary
                const activeTasks = tasks.filter((t) => t.isActive);
                const hitToday = tasks.filter((t) => {
                  const log = (t.dailyLogs || []).find(
                    (l) => new Date(l.date).toDateString() === todayStr,
                  );
                  return (
                    log && log.achieved >= (log.targetValue || t.targetValue)
                  );
                }).length;

                return (
                  <div className="space-y-3">
                    {/* section header */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                        <Target className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">DAILY TASKS</h3>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          {activeTasks.length} active
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                          {hitToday}/{tasks.length} hit today
                        </span>
                      </div>
                    </div>

                    {/* per-task cards */}
                    <div className="space-y-3">
                      {tasks.map((task) => {
                        const logs = task.dailyLogs || [];

                        // today
                        const todayLog = logs.find(
                          (l) => new Date(l.date).toDateString() === todayStr,
                        );
                        const todayAch = todayLog?.achieved ?? 0;
                        const todayTgt =
                          todayLog?.targetValue ?? task.targetValue;
                        const todayPct =
                          todayTgt > 0
                            ? Math.min(
                                Math.round((todayAch / todayTgt) * 100),
                                100,
                              )
                            : 0;
                        const todayDone = todayAch >= todayTgt;

                        // yesterday
                        const yestLog = logs.find(
                          (l) =>
                            new Date(l.date).toDateString() === yesterdayStr,
                        );
                        const yestAch = yestLog?.achieved ?? 0;
                        const yestTgt =
                          yestLog?.targetValue ?? task.targetValue;
                        const yestPct =
                          yestTgt > 0
                            ? Math.min(
                                Math.round((yestAch / yestTgt) * 100),
                                100,
                              )
                            : 0;
                        const yestDone = yestAch >= yestTgt;

                        // this week (Sun–today, working days)
                        const weekLogs = logs.filter((l) => {
                          const d = new Date(l.date);
                          return d >= wkSun && d <= now && isWorkDay(d);
                        });
                        const weekAch = weekLogs.reduce(
                          (s, l) => s + (l.achieved || 0),
                          0,
                        );
                        const weekWorkDays = Array.from(
                          {
                            length:
                              Math.floor(
                                (now.getTime() - wkSun.getTime()) / 86400000,
                              ) + 1,
                          },
                          (_, i) => {
                            const d = new Date(wkSun);
                            d.setDate(wkSun.getDate() + i);
                            return d;
                          },
                        ).filter(isWorkDay).length;
                        const weekTgt =
                          task.targetValue * Math.max(1, weekWorkDays);
                        const weekPct =
                          weekTgt > 0
                            ? Math.min(
                                Math.round((weekAch / weekTgt) * 100),
                                100,
                              )
                            : 0;
                        const weekDone = weekAch >= weekTgt;

                        // this month
                        const monthLogs = logs.filter((l) => {
                          const d = new Date(l.date);
                          return d >= monthStart && isWorkDay(d);
                        });
                        const monthAch = monthLogs.reduce(
                          (s, l) => s + (l.achieved || 0),
                          0,
                        );
                        const monthWorkDays = Array.from(
                          {
                            length:
                              Math.floor(
                                (now.getTime() - monthStart.getTime()) /
                                  86400000,
                              ) + 1,
                          },
                          (_, i) => {
                            const d = new Date(monthStart);
                            d.setDate(monthStart.getDate() + i);
                            return d;
                          },
                        ).filter(isWorkDay).length;
                        const monthTgt =
                          task.targetValue * Math.max(1, monthWorkDays);
                        const monthPct =
                          monthTgt > 0
                            ? Math.min(
                                Math.round((monthAch / monthTgt) * 100),
                                100,
                              )
                            : 0;
                        const monthDone = monthAch >= monthTgt;

                        // consecutive streak (working days going back from yesterday)
                        let streak = 0;
                        {
                          const check = new Date(yest);
                          for (let i = 0; i < 60; i++) {
                            if (!isWorkDay(check)) {
                              check.setDate(check.getDate() - 1);
                              continue;
                            }
                            const dStr = check.toDateString();
                            const l = logs.find(
                              (x) => new Date(x.date).toDateString() === dStr,
                            );
                            if (
                              l &&
                              l.achieved >= (l.targetValue || task.targetValue)
                            ) {
                              streak++;
                              check.setDate(check.getDate() - 1);
                            } else {
                              break;
                            }
                          }
                        }

                        // last 7 days mini bars
                        const last7 = Array.from({ length: 7 }, (_, i) => {
                          const d = new Date(now);
                          d.setDate(now.getDate() - (6 - i));
                          const dStr = d.toDateString();
                          const l = logs.find(
                            (x) => new Date(x.date).toDateString() === dStr,
                          );
                          const ach = l?.achieved ?? 0;
                          const tgt = l?.targetValue ?? task.targetValue;
                          const p =
                            tgt > 0
                              ? Math.min(Math.round((ach / tgt) * 100), 100)
                              : 0;
                          const done = ach >= tgt && tgt > 0;
                          const isToday = dStr === todayStr;
                          return { d, ach, tgt, p, done, isToday, hasLog: !!l };
                        });

                        return (
                          <Card key={task.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              {/* task header */}
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`shrink-0 w-2 h-2 rounded-full ${task.isActive ? "bg-green-500" : "bg-gray-300"}`}
                                  />
                                  <span className="text-sm font-semibold text-gray-800 truncate">
                                    {task.title}
                                  </span>
                                  {task.description && (
                                    <span className="text-xs text-gray-400 truncate hidden sm:block">
                                      — {task.description}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  {streak > 0 && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">
                                      🔥 {streak}d streak
                                    </span>
                                  )}
                                  <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                                    Target: {task.targetValue}/day
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                                  >
                                    {task.isActive ? "Active" : "Inactive"}
                                  </span>
                                  {isAdmin && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-[10px] px-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                      onClick={() => handleUpdateTarget(task)}
                                    >
                                      Edit Target
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* KPI row */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                                {/* Today */}
                                <div
                                  className={`p-3 ${todayDone ? "bg-green-50/50" : ""}`}
                                >
                                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                    Today
                                  </div>
                                  <div className="flex items-end gap-1">
                                    <span
                                      className={`text-xl font-bold ${todayDone ? "text-green-600" : !todayLog ? "text-gray-300" : "text-blue-600"}`}
                                    >
                                      {todayAch}
                                    </span>
                                    <span className="text-xs text-gray-400 mb-0.5">
                                      / {todayTgt}
                                    </span>
                                    <span
                                      className={`text-xs font-bold ml-auto mb-0.5 ${todayDone ? "text-green-600" : "text-blue-500"}`}
                                    >
                                      {todayPct}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                    <div
                                      className={`h-1.5 rounded-full ${todayDone ? "bg-green-500" : "bg-blue-400"}`}
                                      style={{ width: `${todayPct}%` }}
                                    />
                                  </div>
                                  {!todayLog && (
                                    <p className="text-[10px] text-gray-300 mt-1 italic">
                                      No log yet
                                    </p>
                                  )}
                                </div>

                                {/* Yesterday */}
                                <div
                                  className={`p-3 ${yestDone ? "bg-green-50/30" : ""}`}
                                >
                                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                    Yesterday
                                  </div>
                                  <div className="flex items-end gap-1">
                                    <span
                                      className={`text-xl font-bold ${yestDone ? "text-green-600" : !yestLog ? "text-gray-300" : "text-amber-500"}`}
                                    >
                                      {yestAch}
                                    </span>
                                    <span className="text-xs text-gray-400 mb-0.5">
                                      / {yestTgt}
                                    </span>
                                    <span
                                      className={`text-xs font-bold ml-auto mb-0.5 ${yestDone ? "text-green-600" : "text-amber-500"}`}
                                    >
                                      {yestPct}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                    <div
                                      className={`h-1.5 rounded-full ${yestDone ? "bg-green-500" : "bg-amber-400"}`}
                                      style={{ width: `${yestPct}%` }}
                                    />
                                  </div>
                                  {!yestLog && (
                                    <p className="text-[10px] text-gray-300 mt-1 italic">
                                      No log
                                    </p>
                                  )}
                                </div>

                                {/* This Week */}
                                <div
                                  className={`p-3 ${weekDone ? "bg-green-50/30" : ""}`}
                                >
                                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                    This Week
                                  </div>
                                  <div className="flex items-end gap-1">
                                    <span
                                      className={`text-xl font-bold ${weekDone ? "text-green-600" : "text-purple-600"}`}
                                    >
                                      {weekAch}
                                    </span>
                                    <span className="text-xs text-gray-400 mb-0.5">
                                      / {weekTgt}
                                    </span>
                                    <span
                                      className={`text-xs font-bold ml-auto mb-0.5 ${weekDone ? "text-green-600" : "text-purple-500"}`}
                                    >
                                      {weekPct}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                    <div
                                      className={`h-1.5 rounded-full ${weekDone ? "bg-green-500" : "bg-purple-400"}`}
                                      style={{ width: `${weekPct}%` }}
                                    />
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {weekLogs.length} log
                                    {weekLogs.length !== 1 ? "s" : ""}
                                  </p>
                                </div>

                                {/* This Month */}
                                <div
                                  className={`p-3 ${monthDone ? "bg-green-50/30" : ""}`}
                                >
                                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                    This Month
                                  </div>
                                  <div className="flex items-end gap-1">
                                    <span
                                      className={`text-xl font-bold ${monthDone ? "text-green-600" : "text-teal-600"}`}
                                    >
                                      {monthAch}
                                    </span>
                                    <span className="text-xs text-gray-400 mb-0.5">
                                      / {monthTgt}
                                    </span>
                                    <span
                                      className={`text-xs font-bold ml-auto mb-0.5 ${monthDone ? "text-green-600" : "text-teal-500"}`}
                                    >
                                      {monthPct}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                    <div
                                      className={`h-1.5 rounded-full ${monthDone ? "bg-green-500" : "bg-teal-400"}`}
                                      style={{ width: `${monthPct}%` }}
                                    />
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {monthLogs.length} log
                                    {monthLogs.length !== 1 ? "s" : ""} ·{" "}
                                    {monthWorkDays} work days
                                  </p>
                                </div>
                              </div>

                              {/* last 7 days mini chart */}
                              <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                                <div className="flex items-end gap-1.5 h-10">
                                  {last7.map(
                                    (
                                      { d, ach, tgt, p, done, isToday, hasLog },
                                      i,
                                    ) => (
                                      <div
                                        key={i}
                                        className="flex-1 flex flex-col items-center gap-0.5"
                                        title={`${d.toLocaleDateString("default", { weekday: "short", month: "short", day: "numeric" })}: ${ach}/${tgt}`}
                                      >
                                        <div className="w-full flex flex-col justify-end h-7">
                                          <div
                                            className={`w-full rounded-sm transition-all ${
                                              !hasLog
                                                ? "bg-gray-200"
                                                : done
                                                  ? "bg-green-500"
                                                  : "bg-blue-400"
                                            } ${isToday ? "ring-1 ring-blue-500 ring-offset-1" : ""}`}
                                            style={{
                                              height: hasLog
                                                ? `${Math.max(p, 8)}%`
                                                : "8%",
                                            }}
                                          />
                                        </div>
                                        <span
                                          className={`text-[9px] font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}
                                        >
                                          {d.toLocaleDateString("default", {
                                            weekday: "narrow",
                                          })}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            {/* ── CONTACT STATS DASHBOARD ── */}
            {(() => {
              const contacts = user.contacts || [];
              const now = new Date();

              // ── date boundaries ──────────────────────────────────────────
              const todayStr = now.toDateString();
              const yest = new Date(now);
              yest.setDate(now.getDate() - 1);
              const yesterdayStr = yest.toDateString();

              const dow = now.getDay();
              const currSun = new Date(now);
              currSun.setDate(now.getDate() - dow);
              currSun.setHours(0, 0, 0, 0);
              const currThu = new Date(currSun);
              currThu.setDate(currSun.getDate() + 4);
              currThu.setHours(23, 59, 59, 999);

              const prevSun = new Date(currSun);
              prevSun.setDate(currSun.getDate() - 7);
              const prevThu = new Date(prevSun);
              prevThu.setDate(prevSun.getDate() + 4);
              prevThu.setHours(23, 59, 59, 999);

              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const prevMonthStart = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1,
              );
              const prevMonthEnd = new Date(
                now.getFullYear(),
                now.getMonth(),
                0,
                23,
                59,
                59,
                999,
              );
              const yearStart = new Date(now.getFullYear(), 0, 1);

              // ── volume buckets ────────────────────────────────────────────
              const d = (s: string) => new Date(s);
              const todayC = contacts.filter(
                (c) => d(c.createdAt).toDateString() === todayStr,
              );
              const yesterdayC = contacts.filter(
                (c) => d(c.createdAt).toDateString() === yesterdayStr,
              );
              const thisWeekC = contacts.filter((c) => {
                const cd = d(c.createdAt);
                return cd >= currSun && cd <= currThu;
              });
              const prevWeekC = contacts.filter((c) => {
                const cd = d(c.createdAt);
                return cd >= prevSun && cd <= prevThu;
              });
              const thisMonthC = contacts.filter(
                (c) => d(c.createdAt) >= monthStart,
              );
              const prevMonthC = contacts.filter((c) => {
                const cd = d(c.createdAt);
                return cd >= prevMonthStart && cd <= prevMonthEnd;
              });

              // monthly avg
              const earliest =
                contacts.length > 0
                  ? new Date(
                      Math.min(
                        ...contacts.map((c) => d(c.createdAt).getTime()),
                      ),
                    )
                  : now;
              const monthsDiff = Math.max(
                1,
                (now.getFullYear() - earliest.getFullYear()) * 12 +
                  (now.getMonth() - earliest.getMonth()) +
                  1,
              );
              const monthlyAvg = contacts.length / monthsDiff;

              // ── deltas ───────────────────────────────────────────────────
              const dayDelta = todayC.length - yesterdayC.length;
              const weekDelta = thisWeekC.length - prevWeekC.length;
              const monthDelta = thisMonthC.length - prevMonthC.length;

              // ── status counts ─────────────────────────────────────────────
              const sc = (s: string | string[]) =>
                contacts.filter((c) =>
                  Array.isArray(s) ? s.includes(c.status) : c.status === s,
                ).length;
              const total = contacts.length;
              const newCount = sc("NOT_CONTACTED");
              const contacted = sc("CONTACTED");
              const responded = sc([
                "ENGAGED",
                "INTERESTED",
                "QUALIFIED",
                "CATALOG_SENT",
                "SAMPLE_REQUESTED",
                "SAMPLE_SENT",
                "PRICE_NEGOTIATION",
                "CLOSED_WON",
                "REPEAT_BUYER",
                "REENGAGED",
              ]);
              const qualified = sc("QUALIFIED");
              const negotiating = sc("PRICE_NEGOTIATION");
              const wonLifetime = sc("CLOSED_WON");
              const lostLifetime = sc("CLOSED_LOST");
              const activeDeals = responded + qualified + negotiating;
              const responseRate =
                total > 0
                  ? Math.round(
                      ((responded + qualified + negotiating + wonLifetime) /
                        total) *
                        100,
                    )
                  : 0;
              const winRate =
                responded + qualified + negotiating + wonLifetime > 0
                  ? Math.round(
                      (wonLifetime /
                        (responded + qualified + negotiating + wonLifetime)) *
                        100,
                    )
                  : 0;

              // this month quality
              const tmResponded = thisMonthC.filter((c) =>
                [
                  "ENGAGED",
                  "INTERESTED",
                  "QUALIFIED",
                  "CATALOG_SENT",
                  "SAMPLE_REQUESTED",
                  "SAMPLE_SENT",
                  "PRICE_NEGOTIATION",
                  "CLOSED_WON",
                  "REPEAT_BUYER",
                  "REENGAGED",
                ].includes(c.status),
              ).length;
              const tmQualified = thisMonthC.filter(
                (c) => c.status === "QUALIFIED",
              ).length;
              const tmNegotiating = thisMonthC.filter(
                (c) => c.status === "PRICE_NEGOTIATION",
              ).length;
              const tmWon = thisMonthC.filter(
                (c) => c.status === "CLOSED_WON",
              ).length;
              const tmLost = thisMonthC.filter(
                (c) => c.status === "NOT_INTERESTED",
              ).length;

              // this year won
              const thisYearWon = contacts.filter(
                (c) => d(c.createdAt) >= yearStart && c.status === "CLOSED_WON",
              ).length;

              const pct = (n: number, den: number) =>
                den > 0 ? Math.round((n / den) * 100) : 0;

              const Delta = ({ v }: { v: number }) =>
                v === 0 ? null : (
                  <span
                    className={`text-xs font-bold ${v > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {v > 0 ? "↑" : "↓"}
                    {Math.abs(v)}
                  </span>
                );

              return (
                <div className="space-y-3">
                  {/* section header */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">CONTACT STATS</h3>
                  </div>

                  {/* ── Volume Row ── */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Today */}
                    <Card>
                      <CardContent className="pt-4 pb-3 px-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {todayC.length}
                        </div>
                        <div className="text-xs font-medium text-gray-700 mt-0.5">
                          Today
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 h-4">
                          <Delta v={dayDelta} />
                          <span className="text-[10px] text-gray-400">
                            vs yesterday
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Yesterday */}
                    <Card>
                      <CardContent className="pt-4 pb-3 px-3 text-center">
                        <div className="text-2xl font-bold text-sky-600">
                          {yesterdayC.length}
                        </div>
                        <div className="text-xs font-medium text-gray-700 mt-0.5">
                          Yesterday
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 h-4">
                          <span className="text-[10px] text-gray-400">
                            &nbsp;
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    {/* This Week */}
                    <Card>
                      <CardContent className="pt-4 pb-3 px-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {thisWeekC.length}
                        </div>
                        <div className="text-xs font-medium text-gray-700 mt-0.5">
                          This Week
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 h-4">
                          <Delta v={weekDelta} />
                          <span className="text-[10px] text-gray-400">
                            vs prev wk
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Prev Week */}
                    <Card>
                      <CardContent className="pt-4 pb-3 px-3 text-center">
                        <div className="text-2xl font-bold text-indigo-500">
                          {prevWeekC.length}
                        </div>
                        <div className="text-xs font-medium text-gray-700 mt-0.5">
                          Prev Week
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 h-4">
                          <span className="text-[10px] text-gray-400">
                            Sun – Thu
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    {/* This Month */}
                    <Card>
                      <CardContent className="pt-4 pb-3 px-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {thisMonthC.length}
                        </div>
                        <div className="text-xs font-medium text-gray-700 mt-0.5">
                          This Month
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 h-4">
                          <Delta v={monthDelta} />
                          <span className="text-[10px] text-gray-400">
                            vs last mo
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Lifetime */}
                    <Card>
                      <CardContent className="pt-4 pb-3 px-3 text-center">
                        <div className="text-2xl font-bold text-slate-700">
                          {total}
                        </div>
                        <div className="text-xs font-medium text-gray-700 mt-0.5">
                          Lifetime
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 h-4">
                          <span className="text-[10px] text-gray-400">
                            ~{monthlyAvg.toFixed(1)}/mo avg
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* ── KPI Cards ── */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Response Rate */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-green-700">
                            Response Rate
                          </span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {responseRate}%
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {responded + qualified + negotiating + wonLifetime} of{" "}
                          {total} replied
                        </div>
                        <div className="w-full bg-green-100 rounded-full h-1.5 mt-2">
                          <div
                            className="h-1.5 rounded-full bg-green-500"
                            style={{ width: `${responseRate}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Win Rate */}
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-amber-700">
                            Win Rate
                          </span>
                          <Target className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {winRate}%
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {wonLifetime} won · {thisYearWon} this year
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2">
                          <div
                            className="h-1.5 rounded-full bg-amber-500"
                            style={{ width: `${winRate}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Active Deals */}
                    <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-700">
                            Active Deals
                          </span>
                          <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {activeDeals}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {responded > 0 && (
                            <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">
                              {responded} resp
                            </span>
                          )}
                          {qualified > 0 && (
                            <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                              {qualified} qual
                            </span>
                          )}
                          {negotiating > 0 && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                              {negotiating} neg
                            </span>
                          )}
                          {activeDeals === 0 && (
                            <span className="text-[10px] text-gray-400">
                              No active deals
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Monthly Average */}
                    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-purple-700">
                            Monthly Avg
                          </span>
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {monthlyAvg.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          contacts / month
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Over {monthsDiff} month
                          {monthsDiff !== 1 ? "s" : ""}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* ── Pipeline Funnel ── */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          Lifetime Pipeline
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          {total} total contacts
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {(
                          [
                            {
                              label: "New",
                              count: newCount,
                              bg: "bg-gray-100",
                              text: "text-gray-700",
                              bar: "bg-gray-400",
                            },
                            {
                              label: "Contacted",
                              count: contacted,
                              bg: "bg-blue-100",
                              text: "text-blue-700",
                              bar: "bg-blue-400",
                            },
                            {
                              label: "Engaged+",
                              count: responded,
                              bg: "bg-sky-100",
                              text: "text-sky-700",
                              bar: "bg-sky-400",
                            },
                            {
                              label: "Qualified",
                              count: qualified,
                              bg: "bg-violet-100",
                              text: "text-violet-700",
                              bar: "bg-violet-400",
                            },
                            {
                              label: "Negotiating",
                              count: negotiating,
                              bg: "bg-orange-100",
                              text: "text-orange-700",
                              bar: "bg-orange-400",
                            },
                            {
                              label: "Won",
                              count: wonLifetime,
                              bg: "bg-green-100",
                              text: "text-green-700",
                              bar: "bg-green-500",
                            },
                            {
                              label: "Lost",
                              count: lostLifetime,
                              bg: "bg-red-100",
                              text: "text-red-600",
                              bar: "bg-red-400",
                            },
                          ] as {
                            label: string;
                            count: number;
                            bg: string;
                            text: string;
                            bar: string;
                          }[]
                        ).map(({ label, count, bg, text, bar }) => (
                          <div
                            key={label}
                            className={`${bg} rounded-lg p-2.5 text-center`}
                          >
                            <div className={`text-xl font-bold ${text}`}>
                              {count}
                            </div>
                            <div
                              className={`text-[11px] font-medium ${text} leading-tight`}
                            >
                              {label}
                            </div>
                            <div className="w-full bg-white/60 rounded-full h-1 mt-1.5">
                              <div
                                className={`h-1 rounded-full ${bar}`}
                                style={{ width: `${pct(count, total)}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {pct(count, total)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* ── This Month Quality Breakdown ── */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          This Month Quality
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          {thisMonthC.length} added this month
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {(
                          [
                            {
                              label: "Engaged+",
                              count: tmResponded,
                              color: "text-sky-600",
                              bg: "bg-sky-50",
                            },
                            {
                              label: "Qualified",
                              count: tmQualified,
                              color: "text-violet-600",
                              bg: "bg-violet-50",
                            },
                            {
                              label: "Price Negotiation",
                              count: tmNegotiating,
                              color: "text-orange-600",
                              bg: "bg-orange-50",
                            },
                            {
                              label: "Won",
                              count: tmWon,
                              color: "text-green-600",
                              bg: "bg-green-50",
                            },
                            {
                              label: "Not Interested",
                              count: tmLost,
                              color: "text-red-500",
                              bg: "bg-red-50",
                            },
                          ] as {
                            label: string;
                            count: number;
                            color: string;
                            bg: string;
                          }[]
                        ).map(({ label, count, color, bg }) => (
                          <div
                            key={label}
                            className={`${bg} rounded-lg p-3 text-center`}
                          >
                            <div className={`text-xl font-bold ${color}`}>
                              {count}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {label}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {pct(count, thisMonthC.length)}% of month
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── PERIOD ANALYSIS ── */}
        {user &&
          (() => {
            const contacts = user.contacts || [];

            // ── helpers ────────────────────────────────────────────────────
            const STATUS_LABELS: Record<
              string,
              { label: string; bg: string; text: string; bar: string }
            > = {
              NOT_CONTACTED: {
                label: "New",
                bg: "bg-gray-100",
                text: "text-gray-700",
                bar: "bg-gray-400",
              },
              CONTACTED: {
                label: "Contacted",
                bg: "bg-blue-100",
                text: "text-blue-700",
                bar: "bg-blue-400",
              },
              ENGAGED: {
                label: "Engaged",
                bg: "bg-sky-100",
                text: "text-sky-700",
                bar: "bg-sky-400",
              },
              QUALIFIED: {
                label: "Qualified",
                bg: "bg-violet-100",
                text: "text-violet-700",
                bar: "bg-violet-400",
              },
              PRICE_NEGOTIATION: {
                label: "Negotiating",
                bg: "bg-orange-100",
                text: "text-orange-700",
                bar: "bg-orange-400",
              },
              CLOSED_WON: {
                label: "Won",
                bg: "bg-green-100",
                text: "text-green-700",
                bar: "bg-green-500",
              },
              NOT_INTERESTED: {
                label: "Not Interested",
                bg: "bg-red-100",
                text: "text-red-600",
                bar: "bg-red-400",
              },
            };
            const pct2 = (n: number, d: number) =>
              d > 0 ? Math.round((n / d) * 100) : 0;

            const monthName = (m: number) =>
              new Date(2000, m).toLocaleString("default", { month: "short" });

            // ── compute for selected period ────────────────────────────────
            let rangeStart: Date | null = null;
            let rangeEnd: Date | null = null;
            let prevRangeStart: Date | null = null;
            let prevRangeEnd: Date | null = null;
            let rangeLabel = "";

            if (periodMode === "monthly") {
              const [y, m] = selectedMonth.split("-").map(Number);
              rangeStart = new Date(y, m - 1, 1);
              rangeEnd = new Date(y, m, 0, 23, 59, 59, 999);
              prevRangeStart = new Date(y, m - 2, 1);
              prevRangeEnd = new Date(y, m - 1, 0, 23, 59, 59, 999);
              rangeLabel = new Date(y, m - 1).toLocaleString("default", {
                month: "long",
                year: "numeric",
              });
            } else if (periodMode === "yearly") {
              rangeStart = new Date(selectedYear, 0, 1);
              rangeEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
              prevRangeStart = new Date(selectedYear - 1, 0, 1);
              prevRangeEnd = new Date(
                selectedYear - 1,
                11,
                31,
                23,
                59,
                59,
                999,
              );
              rangeLabel = String(selectedYear);
            } else {
              if (customStart && customEnd) {
                rangeStart = new Date(customStart);
                rangeStart.setHours(0, 0, 0, 0);
                rangeEnd = new Date(customEnd);
                rangeEnd.setHours(23, 59, 59, 999);
                rangeLabel = `${customStart} → ${customEnd}`;
              }
            }

            const inRange = (
              dateStr: string,
              s: Date | null,
              e: Date | null,
            ) => {
              if (!s || !e) return false;
              const d = new Date(dateStr);
              return d >= s && d <= e;
            };

            const rangeContacts = contacts.filter((c) =>
              inRange(c.createdAt, rangeStart, rangeEnd),
            );
            const prevContacts = contacts.filter((c) =>
              inRange(c.createdAt, prevRangeStart, prevRangeEnd),
            );
            const total = rangeContacts.length;
            const prevTotal = prevContacts.length;
            const delta = total - prevTotal;

            // status breakdown for range
            const statusCounts = Object.fromEntries(
              Object.keys(STATUS_LABELS).map((s) => [
                s,
                rangeContacts.filter((c) => c.status === s).length,
              ]),
            );
            const wonCount = statusCounts["CLOSED_WON"] || 0;
            const respondedUp =
              (statusCounts["RESPONDED"] || 0) +
              (statusCounts["QUALIFIED"] || 0) +
              (statusCounts["NEGOTIATING"] || 0) +
              wonCount;
            const respRate = pct2(respondedUp, total);
            const winRate = pct2(wonCount, respondedUp);

            // ── monthly buckets (for yearly view) ─────────────────────────
            const monthlyBuckets = Array.from({ length: 12 }, (_, i) => {
              const s = new Date(selectedYear, i, 1);
              const e = new Date(selectedYear, i + 1, 0, 23, 59, 59, 999);
              const c = contacts.filter((ct) => {
                const d = new Date(ct.createdAt);
                return d >= s && d <= e;
              }).length;
              return { month: i, count: c };
            });
            const maxMonthly = Math.max(
              1,
              ...monthlyBuckets.map((b) => b.count),
            );

            // ── weekly buckets (for monthly view) ─────────────────────────
            const [selY, selM] = selectedMonth.split("-").map(Number);
            const daysInMonth = new Date(selY, selM, 0).getDate();
            const weekBuckets = [1, 2, 3, 4].map((wk) => {
              const dayStart = (wk - 1) * 7 + 1;
              const dayEnd = wk === 4 ? daysInMonth : wk * 7;
              const s = new Date(selY, selM - 1, dayStart);
              const e = new Date(selY, selM - 1, dayEnd, 23, 59, 59, 999);
              const c = rangeContacts.filter((ct) => {
                const d = new Date(ct.createdAt);
                return d >= s && d <= e;
              });
              return {
                wk,
                label: `Wk ${wk}`,
                days: `${dayStart}–${dayEnd}`,
                count: c.length,
                contacts: c,
              };
            });
            const maxWeekly = Math.max(1, ...weekBuckets.map((b) => b.count));

            // ── top countries ─────────────────────────────────────────────
            // country might not be eager-loaded; fall back to countryId lookup
            const countryIdMap = Object.fromEntries(
              countries.map((ct) => [ct.id, ct.name]),
            );
            const countryMap: Record<string, number> = {};
            rangeContacts.forEach((c) => {
              const k =
                c.country?.name || countryIdMap[c.countryId ?? -1] || "Unknown";
              countryMap[k] = (countryMap[k] || 0) + 1;
            });
            const topCountries = Object.entries(countryMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);

            const showAnalysis =
              periodMode !== "custom" || (!!customStart && !!customEnd);

            return (
              <div className="mt-8">
                {/* header + controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                      <BarChart2 className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Period Analysis
                    </h2>
                  </div>

                  {/* mode tabs */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                    {(["monthly", "yearly", "custom"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPeriodMode(m)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                          periodMode === m
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* period picker */}
                  <div className="flex items-center gap-2">
                    {periodMode === "monthly" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => {
                            const [y, mo] = selectedMonth
                              .split("-")
                              .map(Number);
                            const d = new Date(y, mo - 2, 1);
                            setSelectedMonth(
                              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                            );
                          }}
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-500" />
                        </button>
                        <input
                          type="month"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => {
                            const [y, mo] = selectedMonth
                              .split("-")
                              .map(Number);
                            const d = new Date(y, mo, 1);
                            setSelectedMonth(
                              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                            );
                          }}
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    )}
                    {periodMode === "yearly" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => setSelectedYear((y) => y - 1)}
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-500" />
                        </button>
                        <span className="text-sm font-semibold px-3 py-1 bg-white border border-gray-200 rounded-md min-w-[64px] text-center">
                          {selectedYear}
                        </span>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => setSelectedYear((y) => y + 1)}
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    )}
                    {periodMode === "custom" && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {!showAnalysis && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    Please select a start and end date to view analysis.
                  </div>
                )}

                {showAnalysis && (
                  <div className="space-y-4">
                    {/* ── Top KPI row ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Total */}
                      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-100">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-blue-700">
                              Total Contacts
                            </span>
                            <Activity className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="text-3xl font-bold text-slate-800 mt-1">
                            {total}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {rangeLabel}
                          </div>
                          {periodMode !== "custom" && (
                            <div
                              className={`text-xs font-semibold mt-1 ${delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-gray-400"}`}
                            >
                              {delta > 0 ? "↑" : delta < 0 ? "↓" : "="}{" "}
                              {Math.abs(delta)} vs prev period ({prevTotal})
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Daily average */}
                      <Card className="bg-gradient-to-br from-slate-50 to-purple-50 border-purple-100">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-purple-700">
                              Daily Avg
                            </span>
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="text-3xl font-bold text-slate-800 mt-1">
                            {rangeStart && rangeEnd
                              ? (
                                  total /
                                  Math.max(
                                    1,
                                    Math.round(
                                      (rangeEnd.getTime() -
                                        rangeStart.getTime()) /
                                        86400000,
                                    ) + 1,
                                  )
                                ).toFixed(1)
                              : "—"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            contacts / day
                          </div>
                        </CardContent>
                      </Card>

                      {/* Response rate */}
                      <Card className="bg-gradient-to-br from-slate-50 to-green-50 border-green-100">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-green-700">
                              Response Rate
                            </span>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="text-3xl font-bold text-slate-800 mt-1">
                            {respRate}%
                          </div>
                          <div className="w-full bg-green-100 rounded-full h-1.5 mt-2">
                            <div
                              className="h-1.5 rounded-full bg-green-500"
                              style={{ width: `${respRate}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {respondedUp} of {total} replied
                          </div>
                        </CardContent>
                      </Card>

                      {/* Win rate */}
                      <Card className="bg-gradient-to-br from-slate-50 to-amber-50 border-amber-100">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-amber-700">
                              Win Rate
                            </span>
                            <Target className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="text-3xl font-bold text-slate-800 mt-1">
                            {winRate}%
                          </div>
                          <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2">
                            <div
                              className="h-1.5 rounded-full bg-amber-500"
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {wonCount} won of {respondedUp} replied
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* ── Chart + status split row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Bar chart */}
                      <Card className="lg:col-span-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-gray-700">
                              {periodMode === "yearly"
                                ? `Month-by-Month — ${selectedYear}`
                                : periodMode === "monthly"
                                  ? `Week-by-Week — ${rangeLabel}`
                                  : `Contacts — ${rangeLabel}`}
                            </span>
                            <span className="text-xs text-gray-400">
                              {total} total
                            </span>
                          </div>

                          {/* yearly: month bars */}
                          {periodMode === "yearly" && (
                            <div className="flex items-end gap-1.5 h-36">
                              {monthlyBuckets.map(({ month, count }) => (
                                <div
                                  key={month}
                                  className="flex-1 flex flex-col items-center gap-1"
                                >
                                  <span className="text-[10px] font-bold text-gray-700">
                                    {count > 0 ? count : ""}
                                  </span>
                                  <div className="w-full flex flex-col justify-end h-24">
                                    <div
                                      className="w-full rounded-t bg-gradient-to-t from-blue-500 to-indigo-400 transition-all"
                                      style={{
                                        height: `${Math.max(pct2(count, maxMonthly), count > 0 ? 4 : 0)}%`,
                                      }}
                                      title={`${monthName(month)}: ${count}`}
                                    />
                                  </div>
                                  <span className="text-[10px] text-gray-400">
                                    {monthName(month)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* monthly: week bars */}
                          {periodMode === "monthly" && (
                            <div className="flex items-end gap-3 h-36">
                              {weekBuckets.map(({ wk, label, days, count }) => (
                                <div
                                  key={wk}
                                  className="flex-1 flex flex-col items-center gap-1"
                                >
                                  <span className="text-[11px] font-bold text-gray-700">
                                    {count > 0 ? count : ""}
                                  </span>
                                  <div className="w-full flex flex-col justify-end h-24">
                                    <div
                                      className="w-full rounded-t bg-gradient-to-t from-purple-500 to-violet-400 transition-all"
                                      style={{
                                        height: `${Math.max(pct2(count, maxWeekly), count > 0 ? 4 : 0)}%`,
                                      }}
                                      title={`${label}: ${count}`}
                                    />
                                  </div>
                                  <span className="text-[10px] text-gray-500 font-medium">
                                    {label}
                                  </span>
                                  <span className="text-[9px] text-gray-400">
                                    {days}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* custom: single bar */}
                          {periodMode === "custom" && (
                            <div className="flex flex-col items-center justify-center h-32 gap-2">
                              <div className="text-5xl font-bold text-blue-600">
                                {total}
                              </div>
                              <div className="text-sm text-gray-500">
                                contacts in selected range
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Status breakdown */}
                      <Card>
                        <CardContent className="p-4">
                          <span className="text-sm font-semibold text-gray-700 block mb-3">
                            Status Breakdown
                          </span>
                          {total === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-xs">
                              No contacts in this period
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {Object.entries(STATUS_LABELS).map(
                                ([key, { label, text, bar }]) => {
                                  const c = statusCounts[key] || 0;
                                  if (c === 0) return null;
                                  return (
                                    <div key={key}>
                                      <div className="flex justify-between text-xs mb-0.5">
                                        <span className={`font-medium ${text}`}>
                                          {label}
                                        </span>
                                        <span className="text-gray-500">
                                          {c} ({pct2(c, total)}%)
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${bar}`}
                                          style={{
                                            width: `${pct2(c, total)}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* ── Top Countries + Comparison row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Top Countries */}
                      <Card>
                        <CardContent className="p-4">
                          <span className="text-sm font-semibold text-gray-700 block mb-3">
                            Top Countries
                          </span>
                          {topCountries.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-xs">
                              No data
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {topCountries.map(([country, count], i) => (
                                <div key={country}>
                                  <div className="flex justify-between text-xs mb-0.5">
                                    <span className="font-medium text-gray-700">
                                      <span className="text-gray-400 mr-1">
                                        #{i + 1}
                                      </span>
                                      {country}
                                    </span>
                                    <span className="text-gray-500">
                                      {count} ({pct2(count, total)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                      style={{
                                        width: `${pct2(count, topCountries[0][1])}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Period vs Prev Period comparison */}
                      {periodMode !== "custom" && (
                        <Card>
                          <CardContent className="p-4">
                            <span className="text-sm font-semibold text-gray-700 block mb-3">
                              vs Previous Period
                            </span>
                            <div className="space-y-3">
                              {[
                                {
                                  label: "Total Contacts",
                                  curr: total,
                                  prev: prevTotal,
                                },
                                {
                                  label: "Responded+",
                                  curr: respondedUp,
                                  prev: prevContacts.filter((c) =>
                                    [
                                      "ENGAGED",
                                      "INTERESTED",
                                      "QUALIFIED",
                                      "CATALOG_SENT",
                                      "SAMPLE_REQUESTED",
                                      "SAMPLE_SENT",
                                      "PRICE_NEGOTIATION",
                                      "CLOSED_WON",
                                      "REPEAT_BUYER",
                                      "REENGAGED",
                                    ].includes(c.status),
                                  ).length,
                                },
                                {
                                  label: "Won",
                                  curr: wonCount,
                                  prev: prevContacts.filter(
                                    (c) => c.status === "CLOSED_WON",
                                  ).length,
                                },
                                {
                                  label: "Lost",
                                  curr: statusCounts["NOT_INTERESTED"] || 0,
                                  prev: prevContacts.filter(
                                    (c) => c.status === "NOT_INTERESTED",
                                  ).length,
                                },
                              ].map(({ label, curr, prev }) => {
                                const diff = curr - prev;
                                return (
                                  <div
                                    key={label}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-xs text-gray-600 w-28">
                                      {label}
                                    </span>
                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                      <span className="text-xs text-gray-400">
                                        prev: {prev}
                                      </span>
                                      <span className="text-sm font-bold text-gray-800 w-8 text-right">
                                        {curr}
                                      </span>
                                      <span
                                        className={`text-xs font-bold w-12 text-right ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-gray-400"}`}
                                      >
                                        {diff > 0 ? "↑" : diff < 0 ? "↓" : "="}
                                        {diff !== 0 ? Math.abs(diff) : ""}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* custom: summary card */}
                      {periodMode === "custom" && (
                        <Card>
                          <CardContent className="p-4">
                            <span className="text-sm font-semibold text-gray-700 block mb-3">
                              Quality Summary
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(STATUS_LABELS).map(
                                ([key, { label, bg, text }]) => {
                                  const c = statusCounts[key] || 0;
                                  return (
                                    <div
                                      key={key}
                                      className={`${bg} rounded-lg p-2.5 text-center`}
                                    >
                                      <div
                                        className={`text-lg font-bold ${text}`}
                                      >
                                        {c}
                                      </div>
                                      <div
                                        className={`text-[11px] font-medium ${text}`}
                                      >
                                        {label}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* Recent Contacts Table */}
        <div className="mt-8">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mb-2 shadow-md">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
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
                                  : contact.status === "PRICE_NEGOTIATION"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : contact.status === "ENGAGED"
                                      ? "bg-blue-100 text-blue-800"
                                      : contact.status === "CONTACTED"
                                        ? "bg-purple-100 text-purple-800"
                                        : contact.status === "NOT_INTERESTED"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {contact.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {contact.country?.name ||
                              countries.find(
                                (ct) => ct.id === contact.countryId,
                              )?.name ||
                              "N/A"}
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
