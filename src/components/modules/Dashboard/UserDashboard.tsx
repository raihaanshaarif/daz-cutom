"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Task, Country } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Shield,
  Activity,
  CheckCircle,
  Target,
  TrendingUp,
  Calendar,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Loading from "@/components/ui/Loading";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const UserDashboard = () => {
  const { authFetch, isLoading: isAuthLoading } = useAuthFetch();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    if (!userId || isAuthLoading) return;
    authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/user/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, authFetch, isAuthLoading]);

  useEffect(() => {
    if (!userId || isAuthLoading) return;
    authFetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/task/my?userId=${userId}&limit=100`,
    )
      .then((r) => r.json())
      .then((json) => {
        const data = json?.data || [];
        setTasks(data);
      })
      .catch(() => {});
  }, [userId, authFetch, isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading) return;
    authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/country?limit=1000`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.data || [];
        setCountries(list);
      })
      .catch(() => {});
  }, [authFetch, isAuthLoading]);

  if (!session || loading) return <Loading />;
  if (error || !user)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-sm">
        {error || "Could not load your profile."}
      </div>
    );

  // ── helpers ────────────────────────────────────────────────────────────────
  const contacts = user.contacts || [];
  const now = new Date();
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
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );
  const isWorkDay = (dd: Date) => dd.getDay() !== 5 && dd.getDay() !== 6;
  const dDate = (s: string) => new Date(s);

  const todayC = contacts.filter(
    (c) => dDate(c.createdAt).toDateString() === todayStr,
  );
  const yestC = contacts.filter(
    (c) => dDate(c.createdAt).toDateString() === yesterdayStr,
  );
  const weekC = contacts.filter((c) => {
    const cd = dDate(c.createdAt);
    return cd >= currSun && cd <= currThu;
  });
  const prevWeekC = contacts.filter((c) => {
    const cd = dDate(c.createdAt);
    return cd >= prevSun && cd <= prevThu;
  });
  const monthC = contacts.filter((c) => dDate(c.createdAt) >= monthStart);
  const prevMonthC = contacts.filter((c) => {
    const cd = dDate(c.createdAt);
    return cd >= prevMonthStart && cd <= prevMonthEnd;
  });

  const sc = (s: string) => contacts.filter((c) => c.status === s).length;
  const total = contacts.length;
  const responded =
    sc("RESPONDED") + sc("QUALIFIED") + sc("NEGOTIATING") + sc("CLOSED_WON");
  const won = sc("CLOSED_WON");
  const respRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const winRate = responded > 0 ? Math.round((won / responded) * 100) : 0;

  const earliest =
    contacts.length > 0
      ? new Date(Math.min(...contacts.map((c) => dDate(c.createdAt).getTime())))
      : now;
  const monthsDiff = Math.max(
    1,
    (now.getFullYear() - earliest.getFullYear()) * 12 +
      (now.getMonth() - earliest.getMonth()) +
      1,
  );
  const monthlyAvg = contacts.length / monthsDiff;

  const activeTasks = tasks.filter((t) => t.isActive);
  const hitToday = tasks.filter((t) => {
    const log = (t.dailyLogs || []).find(
      (l) => new Date(l.date).toDateString() === todayStr,
    );
    return log && log.achieved >= (log.targetValue || t.targetValue);
  }).length;

  const countryIdMap = Object.fromEntries(
    countries.map((ct) => [ct.id, ct.name]),
  );

  const pct = (n: number, denom: number) =>
    denom > 0 ? Math.round((n / denom) * 100) : 0;

  const STATUS_LABELS: Record<
    string,
    { label: string; bg: string; text: string; bar: string }
  > = {
    NEW: {
      label: "New",
      bg: "bg-muted",
      text: "text-gray-700",
      bar: "bg-gray-400",
    },
    CONTACTED: {
      label: "Contacted",
      bg: "bg-blue-500/100/20",
      text: "text-blue-700",
      bar: "bg-blue-400",
    },
    RESPONDED: {
      label: "Responded",
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
    NEGOTIATING: {
      label: "Negotiating",
      bg: "bg-orange-500/100/20",
      text: "text-orange-700",
      bar: "bg-orange-400",
    },
    CLOSED_WON: {
      label: "Won",
      bg: "bg-green-500/100/20",
      text: "text-green-700",
      bar: "bg-green-500/100/100",
    },
    // legacy CLOSED_LOST replaced by NOT_INTERESTED status
    NOT_INTERESTED: {
      label: "Not Interested",
      bg: "bg-red-500/100/20",
      text: "text-red-600",
      bar: "bg-red-400",
    },
  };

  // period range
  let rangeStart: Date | null = null,
    rangeEnd: Date | null = null;
  let prevRangeStart: Date | null = null,
    prevRangeEnd: Date | null = null;
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
    prevRangeEnd = new Date(selectedYear - 1, 11, 31, 23, 59, 59, 999);
    rangeLabel = String(selectedYear);
  } else if (customStart && customEnd) {
    rangeStart = new Date(customStart);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = new Date(customEnd);
    rangeEnd.setHours(23, 59, 59, 999);
    rangeLabel = `${customStart} → ${customEnd}`;
  }

  const inRange = (dateStr: string, s: Date | null, e: Date | null) => {
    if (!s || !e) return false;
    const dd = new Date(dateStr);
    return dd >= s && dd <= e;
  };

  const rangeC = contacts.filter((c) =>
    inRange(c.createdAt, rangeStart, rangeEnd),
  );
  const prevRC = contacts.filter((c) =>
    inRange(c.createdAt, prevRangeStart, prevRangeEnd),
  );
  const rTotal = rangeC.length;
  const rDelta = rTotal - prevRC.length;
  const rStatusCounts = Object.fromEntries(
    Object.keys(STATUS_LABELS).map((s) => [
      s,
      rangeC.filter((c) => c.status === s).length,
    ]),
  );
  const rResponded =
    (rStatusCounts["ENGAGED"] || 0) +
    (rStatusCounts["INTERESTED"] || 0) +
    (rStatusCounts["QUALIFIED"] || 0) +
    (rStatusCounts["CATALOG_SENT"] || 0) +
    (rStatusCounts["SAMPLE_REQUESTED"] || 0) +
    (rStatusCounts["SAMPLE_SENT"] || 0) +
    (rStatusCounts["PRICE_NEGOTIATION"] || 0) +
    (rStatusCounts["CLOSED_WON"] || 0) +
    (rStatusCounts["REPEAT_BUYER"] || 0) +
    (rStatusCounts["REENGAGED"] || 0);
  const rWon = rStatusCounts["CLOSED_WON"] || 0;
  const rRespRate = pct(rResponded, rTotal);
  const rWinRate = pct(rWon, rResponded);

  const [selY, selM] = selectedMonth.split("-").map(Number);
  const monthlyBuckets = Array.from({ length: 12 }, (_, i) => {
    const s = new Date(selectedYear, i, 1),
      e = new Date(selectedYear, i + 1, 0, 23, 59, 59, 999);
    return {
      month: i,
      count: contacts.filter((c) => {
        const dd = dDate(c.createdAt);
        return dd >= s && dd <= e;
      }).length,
    };
  });
  const maxMonthly = Math.max(1, ...monthlyBuckets.map((b) => b.count));

  const daysInMonth = new Date(selY, selM, 0).getDate();
  const weekBuckets = [1, 2, 3, 4].map((wk) => {
    const ds = (wk - 1) * 7 + 1,
      de = wk === 4 ? daysInMonth : wk * 7;
    const s = new Date(selY, selM - 1, ds),
      e = new Date(selY, selM - 1, de, 23, 59, 59, 999);
    return {
      wk,
      label: `Wk ${wk}`,
      days: `${ds}–${de}`,
      count: rangeC.filter((c) => {
        const dd = dDate(c.createdAt);
        return dd >= s && dd <= e;
      }).length,
    };
  });
  const maxWeekly = Math.max(1, ...weekBuckets.map((b) => b.count));

  const countryMap: Record<string, number> = {};
  rangeC.forEach((c) => {
    const k = c.country?.name || countryIdMap[c.countryId ?? -1] || "Unknown";
    countryMap[k] = (countryMap[k] || 0) + 1;
  });
  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const showAnalysis =
    periodMode !== "custom" || (!!customStart && !!customEnd);

  // ── Task Performance Report (logged-in user) ────────────────────────────
  const workDaysInRange: Date[] = [];
  if (rangeStart && rangeEnd) {
    const cursor = new Date(rangeStart);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= rangeEnd) {
      if (isWorkDay(cursor)) workDaysInRange.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  // Per-task target: targetValue × workDays vs actual contacts in period
  const myTaskRows = activeTasks.map((task) => ({
    task,
    taskTarget: task.targetValue * workDaysInRange.length,
  }));
  const myTotalContactTarget = myTaskRows.reduce((s, r) => s + r.taskTarget, 0);
  const myActualContacts = rTotal; // contacts created in selected period
  const myAchieveRate = pct(myActualContacts, myTotalContactTarget);

  const monthName = (m: number) =>
    new Date(2000, m).toLocaleString("default", { month: "short" });

  const Delta = ({ v }: { v: number }) =>
    v === 0 ? null : (
      <span
        className={`text-xs font-bold ${
          v > 0 ? "text-green-600" : "text-red-500"
        }`}
      >
        {v > 0 ? "↑" : "↓"}
        {Math.abs(v)}
      </span>
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/100/20 text-green-700 dark:text-green-400 border-green-200";
      case "INACTIVE":
        return "bg-yellow-500/100/20 text-yellow-700 dark:text-yellow-400 border-yellow-200";
      case "BLOCK":
        return "bg-red-500/100/20 text-red-700 dark:text-red-400 border-red-200";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Profile Header ── */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3 shadow-md">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
            <Badge className="bg-blue-500/100/20 text-blue-700 dark:text-blue-400 border-blue-200">
              <Shield className="w-3 h-3 mr-1" />
              {user.role.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* ── Daily Tasks ── */}
        {tasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-xl font-bold">MY TASKS</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-500/100/20 text-green-700 dark:text-green-400 rounded-full font-semibold">
                  {activeTasks.length} active
                </span>
                <span className="text-xs px-2 py-1 bg-blue-500/100/20 text-blue-700 dark:text-blue-400 rounded-full font-semibold">
                  {hitToday}/{tasks.length} hit today
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => {
                const logs = task.dailyLogs || [];
                const tl = logs.find(
                  (l) => new Date(l.date).toDateString() === todayStr,
                );
                const ta = tl?.achieved ?? 0,
                  tt = tl?.targetValue ?? task.targetValue;
                const tp =
                  tt > 0 ? Math.min(Math.round((ta / tt) * 100), 100) : 0;
                const td = ta >= tt && tt > 0;
                const yl = logs.find(
                  (l) => new Date(l.date).toDateString() === yesterdayStr,
                );
                const ya = yl?.achieved ?? 0,
                  yt = yl?.targetValue ?? task.targetValue;
                const yp =
                  yt > 0 ? Math.min(Math.round((ya / yt) * 100), 100) : 0;
                const yd = ya >= yt && yt > 0;
                const wl = logs.filter((l) => {
                  const dd = new Date(l.date);
                  return dd >= currSun && dd <= now && isWorkDay(dd);
                });
                const wa = wl.reduce((s, l) => s + (l.achieved || 0), 0);
                const wwd = Array.from(
                  {
                    length:
                      Math.floor(
                        (now.getTime() - currSun.getTime()) / 86400000,
                      ) + 1,
                  },
                  (_, i) => {
                    const dd = new Date(currSun);
                    dd.setDate(currSun.getDate() + i);
                    return dd;
                  },
                ).filter(isWorkDay).length;
                const wt = task.targetValue * Math.max(1, wwd),
                  wp = wt > 0 ? Math.min(Math.round((wa / wt) * 100), 100) : 0,
                  wd = wa >= wt;
                const last7 = Array.from({ length: 7 }, (_, i) => {
                  const dd = new Date(now);
                  dd.setDate(now.getDate() - (6 - i));
                  const ds = dd.toDateString();
                  const l = logs.find(
                    (x) => new Date(x.date).toDateString() === ds,
                  );
                  const ach = l?.achieved ?? 0,
                    tgt = l?.targetValue ?? task.targetValue;
                  const p =
                    tgt > 0 ? Math.min(Math.round((ach / tgt) * 100), 100) : 0;
                  return {
                    dd,
                    ach,
                    tgt,
                    p,
                    done: ach >= tgt && tgt > 0,
                    isToday: ds === todayStr,
                    hasLog: !!l,
                  };
                });
                return (
                  <Card key={task.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`shrink-0 w-2 h-2 rounded-full ${
                              task.isActive
                                ? "bg-green-500/100/100"
                                : "bg-gray-300"
                            }`}
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
                        <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium shrink-0 ml-2">
                          Target: {task.targetValue}/day
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
                        {[
                          {
                            label: "Today",
                            ach: ta,
                            tgt: tt,
                            p: tp,
                            done: td,
                            hasLog: !!tl,
                            color: "text-blue-600",
                            bar: "bg-blue-400",
                          },
                          {
                            label: "Yesterday",
                            ach: ya,
                            tgt: yt,
                            p: yp,
                            done: yd,
                            hasLog: !!yl,
                            color: "text-amber-500",
                            bar: "bg-amber-400",
                          },
                          {
                            label: "This Week",
                            ach: wa,
                            tgt: wt,
                            p: wp,
                            done: wd,
                            hasLog: wl.length > 0,
                            color: "text-purple-600",
                            bar: "bg-purple-400",
                          },
                          {
                            label: "Total",
                            ach: logs.reduce(
                              (s, l) => s + (l.achieved || 0),
                              0,
                            ),
                            tgt: task.targetValue,
                            p: 0,
                            done: false,
                            hasLog: logs.length > 0,
                            color: "text-teal-600",
                            bar: "bg-teal-400",
                          },
                        ].map(
                          ({
                            label,
                            ach,
                            tgt,
                            p: pp,
                            done,
                            hasLog: hl,
                            color,
                            bar,
                          }) => (
                            <div
                              key={label}
                              className={`p-3 ${done ? "bg-green-500/100/100/10" : ""}`}
                            >
                              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                {label}
                              </div>
                              <div className="flex items-end gap-1">
                                <span
                                  className={`text-xl font-bold ${
                                    done
                                      ? "text-green-600"
                                      : !hl
                                        ? "text-gray-300"
                                        : color
                                  }`}
                                >
                                  {ach}
                                </span>
                                {label !== "Total" && (
                                  <span className="text-xs text-gray-400 mb-0.5">
                                    / {tgt}
                                  </span>
                                )}
                                {label !== "Total" && (
                                  <span
                                    className={`text-xs font-bold ml-auto mb-0.5 ${
                                      done ? "text-green-600" : color
                                    }`}
                                  >
                                    {pp}%
                                  </span>
                                )}
                              </div>
                              {label !== "Total" && (
                                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      done ? "bg-green-500/100/100" : bar
                                    }`}
                                    style={{ width: `${pp}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="px-4 py-2.5 border-t border-border bg-muted/30">
                        <div className="flex items-end gap-1.5 h-10">
                          {last7.map(
                            (
                              {
                                dd,
                                ach,
                                tgt,
                                p: pp,
                                done,
                                isToday,
                                hasLog: hl,
                              },
                              i,
                            ) => (
                              <div
                                key={i}
                                className="flex-1 flex flex-col items-center gap-0.5"
                                title={`${dd.toLocaleDateString("default", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}: ${ach}/${tgt}`}
                              >
                                <div className="w-full flex flex-col justify-end h-7">
                                  <div
                                    className={`w-full rounded-sm transition-all ${
                                      !hl
                                        ? "bg-muted"
                                        : done
                                          ? "bg-green-500/100/100"
                                          : "bg-blue-400"
                                    } ${
                                      isToday
                                        ? "ring-1 ring-blue-500 ring-offset-1"
                                        : ""
                                    }`}
                                    style={{
                                      height: hl ? `${Math.max(pp, 8)}%` : "8%",
                                    }}
                                  />
                                </div>
                                <span
                                  className={`text-[9px] font-medium ${
                                    isToday ? "text-blue-600" : "text-gray-400"
                                  }`}
                                >
                                  {dd.toLocaleDateString("default", {
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
        )}

        {/* ── My Tasks ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-indigo-600 rounded flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xl font-bold">MY TASKS</h3>
            <span className="ml-auto text-xs text-gray-400">
              {tasks.length} assigned
            </span>
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-400 text-sm">
                No tasks assigned yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.map((task) => {
                const logs = task.dailyLogs || [];
                // today
                const tl = logs.find(
                  (l) => new Date(l.date).toDateString() === todayStr,
                );
                const ta = tl?.achieved ?? 0;
                const tt = tl?.targetValue ?? task.targetValue;
                const tp =
                  tt > 0 ? Math.min(Math.round((ta / tt) * 100), 100) : 0;
                const todayDone = ta >= tt && tt > 0;
                // this week
                const wl = logs.filter((l) => {
                  const dd = new Date(l.date);
                  return dd >= currSun && dd <= now && isWorkDay(dd);
                });
                const weekAch = wl.reduce((s, l) => s + (l.achieved || 0), 0);
                const wwd = Array.from(
                  {
                    length:
                      Math.floor(
                        (now.getTime() - currSun.getTime()) / 86400000,
                      ) + 1,
                  },
                  (_, i) => {
                    const dd = new Date(currSun);
                    dd.setDate(currSun.getDate() + i);
                    return dd;
                  },
                ).filter(isWorkDay).length;
                const weekTarget = task.targetValue * Math.max(1, wwd);
                const weekPct =
                  weekTarget > 0
                    ? Math.min(Math.round((weekAch / weekTarget) * 100), 100)
                    : 0;
                // all time
                const totalAch = logs.reduce(
                  (s, l) => s + (l.achieved || 0),
                  0,
                );
                // streak
                let streak = 0;
                const chk = new Date(now);
                chk.setDate(now.getDate() - 1);
                for (let i = 0; i < 60; i++) {
                  if (!isWorkDay(chk)) {
                    chk.setDate(chk.getDate() - 1);
                    continue;
                  }
                  const ds = chk.toDateString();
                  const l = logs.find(
                    (x) => new Date(x.date).toDateString() === ds,
                  );
                  if (l && l.achieved >= (l.targetValue || task.targetValue)) {
                    streak++;
                    chk.setDate(chk.getDate() - 1);
                  } else break;
                }

                return (
                  <Card
                    key={task.id}
                    className={`overflow-hidden border ${
                      todayDone ? "border-green-200 bg-green-500/100/10/30" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                task.isActive
                                  ? "bg-green-500/100/100"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className="text-sm font-semibold text-gray-800 truncate">
                              {task.title}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-gray-400 mt-0.5 ml-3.5 truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                            {task.targetValue}/day
                          </span>
                          {streak > 0 && (
                            <span className="text-[10px] font-bold text-orange-500">
                              🔥 {streak}d
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Today */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Today</span>
                          <span
                            className={`font-bold ${
                              todayDone
                                ? "text-green-600"
                                : tl
                                  ? "text-blue-600"
                                  : "text-gray-300"
                            }`}
                          >
                            {ta} / {tt}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              todayDone ? "bg-green-500/100/100" : "bg-blue-400"
                            }`}
                            style={{ width: `${tp}%` }}
                          />
                        </div>
                      </div>

                      {/* This Week */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">This Week</span>
                          <span className="font-semibold text-purple-600">
                            {weekAch} / {weekTarget}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-purple-400 transition-all"
                            style={{ width: `${weekPct}%` }}
                          />
                        </div>
                      </div>

                      {/* footer stats */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-[11px] text-gray-400">
                          All time:{" "}
                          <span className="font-semibold text-gray-600">
                            {totalAch.toLocaleString()}
                          </span>
                        </span>
                        {todayDone ? (
                          <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> Done today
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            {tp}% today
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Contact Stats ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xl font-bold">MY CONTACT STATS</h3>
          </div>

          {/* volume row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Today",
                value: todayC.length,
                sub: <Delta v={todayC.length - yestC.length} />,
                note: "vs yesterday",
                color: "text-blue-600",
              },
              {
                label: "Yesterday",
                value: yestC.length,
                sub: null,
                note: "",
                color: "text-sky-600",
              },
              {
                label: "This Week",
                value: weekC.length,
                sub: <Delta v={weekC.length - prevWeekC.length} />,
                note: "vs prev wk",
                color: "text-green-600",
              },
              {
                label: "Prev Week",
                value: prevWeekC.length,
                sub: null,
                note: "Sun – Thu",
                color: "text-indigo-500",
              },
              {
                label: "This Month",
                value: monthC.length,
                sub: <Delta v={monthC.length - prevMonthC.length} />,
                note: "vs last mo",
                color: "text-purple-600",
              },
              {
                label: "Lifetime",
                value: total,
                sub: null,
                note: `~${monthlyAvg.toFixed(1)}/mo avg`,
                color: "text-slate-700",
              },
            ].map(({ label, value, sub, note, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 px-3 text-center">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5">
                    {label}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1 h-4">
                    {sub}
                    {note && (
                      <span className="text-[10px] text-gray-400">{note}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-700">
                    Response Rate
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {respRate}%
                </div>
                <div className="w-full bg-green-500/100/20 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-green-500/100/100"
                    style={{ width: `${respRate}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {responded} of {total} replied
                </div>
              </CardContent>
            </Card>
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
                <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-amber-500"
                    style={{ width: `${winRate}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {won} won · {sc("CLOSED_WON")} lifetime
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700">
                    Active Deals
                  </span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {sc("RESPONDED") + sc("QUALIFIED") + sc("NEGOTIATING")}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {sc("RESPONDED") > 0 && (
                    <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">
                      {sc("RESPONDED")} resp
                    </span>
                  )}
                  {sc("QUALIFIED") > 0 && (
                    <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                      {sc("QUALIFIED")} qual
                    </span>
                  )}
                  {sc("NEGOTIATING") > 0 && (
                    <span className="text-[10px] bg-orange-500/100/20 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
                      {sc("NEGOTIATING")} neg
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
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
                  Over {monthsDiff} month{monthsDiff !== 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Lifetime Pipeline
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {total} total
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {Object.entries(STATUS_LABELS).map(
                  ([key, { label, bg, text, bar }]) => {
                    const count = contacts.filter(
                      (ct) => ct.status === key,
                    ).length;
                    return (
                      <div
                        key={key}
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
                        <div className="w-full bg-muted/40 rounded-full h-1 mt-1.5">
                          <div
                            className={`h-1 rounded-full ${bar}`}
                            style={{ width: `${pct(count, total)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {pct(count, total)}%
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Period Analysis ── */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <BarChart2 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Period Analysis
              </h2>
            </div>
            <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
              {(["monthly", "yearly", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPeriodMode(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                    periodMode === m
                      ? "bg-background text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {periodMode === "monthly" && (
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-1 rounded hover:bg-muted"
                    onClick={() => {
                      const [y, mo] = selectedMonth.split("-").map(Number);
                      const dd = new Date(y, mo - 2, 1);
                      setSelectedMonth(
                        `${dd.getFullYear()}-${String(
                          dd.getMonth() + 1,
                        ).padStart(2, "0")}`,
                      );
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    className="p-1 rounded hover:bg-muted"
                    onClick={() => {
                      const [y, mo] = selectedMonth.split("-").map(Number);
                      const dd = new Date(y, mo, 1);
                      setSelectedMonth(
                        `${dd.getFullYear()}-${String(
                          dd.getMonth() + 1,
                        ).padStart(2, "0")}`,
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
                    className="p-1 rounded hover:bg-muted"
                    onClick={() => setSelectedYear((y) => y - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-sm font-semibold px-3 py-1 bg-background border border-border rounded-md min-w-[64px] text-center">
                    {selectedYear}
                  </span>
                  <button
                    className="p-1 rounded hover:bg-muted"
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
                    className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              )}
            </div>
          </div>

          {!showAnalysis && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Please select a start and end date.
            </div>
          )}
          {showAnalysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Total",
                    value: rTotal,
                    sub:
                      periodMode !== "custom" ? (
                        <span
                          className={`text-xs font-semibold ${
                            rDelta > 0
                              ? "text-green-600"
                              : rDelta < 0
                                ? "text-red-500"
                                : "text-gray-400"
                          }`}
                        >
                          {rDelta > 0 ? "↑" : rDelta < 0 ? "↓" : "="}{" "}
                          {Math.abs(rDelta)} vs prev
                        </span>
                      ) : null,
                    icon: <Activity className="w-4 h-4 text-blue-400" />,
                  },
                  {
                    label: "Daily Avg",
                    value: (rangeStart && rangeEnd
                      ? rTotal /
                        Math.max(
                          1,
                          Math.round(
                            (rangeEnd.getTime() - rangeStart.getTime()) /
                              86400000,
                          ) + 1,
                        )
                      : 0
                    ).toFixed(1),
                    sub: <span className="text-xs text-gray-500">per day</span>,
                    icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
                  },
                  {
                    label: "Response Rate",
                    value: `${rRespRate}%`,
                    sub: (
                      <div className="w-full bg-green-500/100/20 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full bg-green-500/100/100"
                          style={{ width: `${rRespRate}%` }}
                        />
                      </div>
                    ),
                    icon: <CheckCircle className="w-4 h-4 text-green-400" />,
                  },
                  {
                    label: "Win Rate",
                    value: `${rWinRate}%`,
                    sub: (
                      <div className="w-full bg-amber-100 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full bg-amber-500"
                          style={{ width: `${rWinRate}%` }}
                        />
                      </div>
                    ),
                    icon: <Target className="w-4 h-4 text-amber-400" />,
                  },
                ].map(({ label, value, sub, icon }) => (
                  <Card
                    key={label}
                    className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-100"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-blue-700">
                          {label}
                        </span>
                        {icon}
                      </div>
                      <div className="text-3xl font-bold text-slate-800">
                        {value}
                      </div>
                      <div className="mt-1">{sub}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                        {rTotal} total
                      </span>
                    </div>
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
                                  height: `${Math.max(
                                    pct(count, maxMonthly),
                                    count > 0 ? 4 : 0,
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {monthName(month)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
                                  height: `${Math.max(
                                    pct(count, maxWeekly),
                                    count > 0 ? 4 : 0,
                                  )}%`,
                                }}
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
                    {periodMode === "custom" && (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <div className="text-5xl font-bold text-blue-600">
                          {rTotal}
                        </div>
                        <div className="text-sm text-gray-500">
                          contacts in range
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <span className="text-sm font-semibold text-gray-700 block mb-3">
                      Status Breakdown
                    </span>
                    {rTotal === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        No contacts
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {Object.entries(STATUS_LABELS).map(
                          ([key, { label, text, bar }]) => {
                            const c = rStatusCounts[key] || 0;
                            if (c === 0) return null;
                            return (
                              <div key={key}>
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className={`font-medium ${text}`}>
                                    {label}
                                  </span>
                                  <span className="text-gray-500">
                                    {c} ({pct(c, rTotal)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${bar}`}
                                    style={{ width: `${pct(c, rTotal)}%` }}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                {count} ({pct(count, rTotal)}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                style={{
                                  width: `${pct(count, topCountries[0][1])}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {periodMode !== "custom" && (
                  <Card>
                    <CardContent className="p-4">
                      <span className="text-sm font-semibold text-gray-700 block mb-3">
                        vs Previous Period
                      </span>
                      <div className="space-y-3">
                        {[
                          {
                            label: "Total",
                            curr: rTotal,
                            prev: prevRC.length,
                          },
                          {
                            label: "Responded+",
                            curr: rResponded,
                            prev: prevRC.filter((c) =>
                              [
                                "RESPONDED",
                                "QUALIFIED",
                                "NEGOTIATING",
                                "CLOSED_WON",
                              ].includes(c.status),
                            ).length,
                          },
                          {
                            label: "Won",
                            curr: rWon,
                            prev: prevRC.filter(
                              (c) => c.status === "CLOSED_WON",
                            ).length,
                          },
                          {
                            label: "Lost",
                            curr: rStatusCounts["NOT_INTERESTED"] || 0,
                            prev: prevRC.filter(
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
                                  className={`text-xs font-bold w-12 text-right ${
                                    diff > 0
                                      ? "text-green-600"
                                      : diff < 0
                                        ? "text-red-500"
                                        : "text-gray-400"
                                  }`}
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
              </div>

              {/* ── My Task Performance Report ── */}
              {workDaysInRange.length > 0 &&
                myTaskRows.length > 0 &&
                myTotalContactTarget > 0 && (
                  <Card className="border-orange-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-800">
                          My Task Performance —{" "}
                          <span className="text-gray-500 font-normal">
                            {rangeLabel}
                          </span>
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          {workDaysInRange.length} work day
                          {workDaysInRange.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* KPI banner */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          {
                            label: "Tasks",
                            value: myTaskRows.length,
                            color: "text-gray-700",
                          },
                          {
                            label: "Target",
                            value: myTotalContactTarget,
                            color: "text-indigo-600",
                          },
                          {
                            label: "Actual",
                            value: myActualContacts,
                            color: "text-blue-600",
                          },
                          {
                            label: "Achievement",
                            value: `${myAchieveRate}%`,
                            color:
                              myAchieveRate >= 100
                                ? "text-green-600"
                                : myAchieveRate >= 75
                                  ? "text-blue-600"
                                  : myAchieveRate >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600",
                          },
                        ].map(({ label, value, color }) => (
                          <div
                            key={label}
                            className="bg-muted/50 rounded-lg p-2 text-center"
                          >
                            <div className={`text-base font-bold ${color}`}>
                              {value}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Overall progress bar + status */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500">
                            Overall progress
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              myAchieveRate >= 100
                                ? "bg-green-500/100/20 text-green-700 dark:text-green-400"
                                : myAchieveRate >= 75
                                  ? "bg-blue-500/100/20 text-blue-700 dark:text-blue-400"
                                  : myAchieveRate >= 50
                                    ? "bg-yellow-500/100/20 text-yellow-700 dark:text-yellow-400"
                                    : "bg-red-500/100/20 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {myAchieveRate >= 100
                              ? "Excellent"
                              : myAchieveRate >= 75
                                ? "Good"
                                : myAchieveRate >= 50
                                  ? "Warning"
                                  : "At Risk"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              myAchieveRate >= 100
                                ? "bg-green-400"
                                : myAchieveRate >= 75
                                  ? "bg-blue-400"
                                  : myAchieveRate >= 50
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                            }`}
                            style={{
                              width: `${Math.min(myAchieveRate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Per-task target breakdown */}
                      <div className="space-y-2 pt-3 border-t border-border">
                        <span className="text-[10px] text-gray-400 font-medium block mb-1">
                          Per-task targets
                        </span>
                        {myTaskRows.map((row) => (
                          <div
                            key={row.task.id}
                            className="flex items-center gap-2"
                          >
                            <span className="text-[11px] font-medium text-gray-600 w-36 truncate shrink-0">
                              {row.task.title}
                            </span>
                            <span className="text-[10px] text-indigo-500">
                              {row.task.targetValue}/day ×{" "}
                              {workDaysInRange.length}d
                            </span>
                            <span className="text-[10px] font-semibold text-gray-700 ml-auto">
                              = {row.taskTarget} contacts
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </div>

        {/* ── Recent Contacts ── */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Recent Contacts
          </h2>
          <div className="bg-card/90 rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <div className="p-4 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Company",
                      "Status",
                      "Country",
                      "Created",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {contacts
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage,
                    )
                    .map((contact) => (
                      <tr key={contact.id} className="hover:bg-muted/30">
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
                                ? "bg-green-500/100/20 text-green-700 dark:text-green-400"
                                : contact.status === "PRICE_NEGOTIATION"
                                  ? "bg-yellow-500/100/20 text-yellow-700 dark:text-yellow-400"
                                  : contact.status === "ENGAGED"
                                    ? "bg-blue-500/100/20 text-blue-700 dark:text-blue-400"
                                    : contact.status === "CONTACTED"
                                      ? "bg-purple-500/100/20 text-purple-700 dark:text-purple-400"
                                      : contact.status === "NOT_INTERESTED"
                                        ? "bg-red-500/100/20 text-red-700 dark:text-red-400"
                                        : "bg-muted text-foreground"
                            }`}
                          >
                            {contact.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {contact.country?.name ||
                            countries.find((ct) => ct.id === contact.countryId)
                              ?.name ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {contacts.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No contacts found
                </div>
              )}
            </div>
            {contacts.length > itemsPerPage && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-gray-500">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    contacts.length,
                  )}
                  –{Math.min(currentPage * itemsPerPage, contacts.length)} of{" "}
                  {contacts.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={
                      currentPage >= Math.ceil(contacts.length / itemsPerPage)
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
  );
};

export default UserDashboard;
