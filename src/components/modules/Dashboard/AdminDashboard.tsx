"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Contact, Country, Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  TrendingUp,
  Target,
  CheckCircle,
  ChevronRight,
  Shield,
  BarChart2,
  Calendar,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";
import Loading from "@/components/ui/Loading";

interface UserWithTasks extends User {
  tasks?: Task[];
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserWithTasks[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    const load = async () => {
      try {
        const [userData, contactData, countryData] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user`).then((r) =>
            r.json(),
          ),
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/contact?limit=10000`).then(
            (r) => r.json(),
          ),
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/country?limit=1000`).then(
            (r) => r.json(),
          ),
        ]);

        const userList: UserWithTasks[] = Array.isArray(userData)
          ? userData
          : [];

        // Fetch tasks for every user in parallel
        const taskResults = await Promise.all(
          userList.map((u) =>
            fetch(
              `${process.env.NEXT_PUBLIC_BASE_API}/task/my?userId=${u.id}&limit=100`,
            ).then((r) => r.json()),
          ),
        );
        userList.forEach((u, i) => {
          const json = taskResults[i];
          u.tasks = Array.isArray(json)
            ? json
            : Array.isArray(json?.data)
              ? json.data
              : [];
        });

        setUsers(userList);

        const contacts = Array.isArray(contactData)
          ? contactData
          : Array.isArray(contactData?.data)
            ? contactData.data
            : [];
        setAllContacts(contacts);

        const list = Array.isArray(countryData)
          ? countryData
          : Array.isArray(countryData?.data)
            ? countryData.data
            : [];
        setCountries(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading />;

  const now = new Date();
  const todayStr = now.toDateString();
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
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const isWorkDay = (d: Date) => d.getDay() !== 5 && d.getDay() !== 6;
  const countryIdMap = Object.fromEntries(countries.map((c) => [c.id, c.name]));

  const dDate = (s: string) => new Date(s);

  // system-wide counts
  const totalContacts = allContacts.length;
  const todayContacts = allContacts.filter(
    (c) => dDate(c.createdAt).toDateString() === todayStr,
  ).length;
  const weekContacts = allContacts.filter((c) => {
    const cd = dDate(c.createdAt);
    return cd >= currSun && cd <= currThu;
  }).length;
  const prevWeekContacts = allContacts.filter((c) => {
    const cd = dDate(c.createdAt);
    return cd >= prevSun && cd <= prevThu;
  }).length;
  const monthContacts = allContacts.filter(
    (c) => dDate(c.createdAt) >= monthStart,
  ).length;
  const yearContacts = allContacts.filter(
    (c) => dDate(c.createdAt) >= yearStart,
  ).length;
  const wonContacts = allContacts.filter(
    (c) => c.status === "CLOSED_WON",
  ).length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const weekDelta = weekContacts - prevWeekContacts;

  const STATUS_LABELS = [
    "NOT_CONTACTED",
    "CONTACTED",
    "FOLLOW_UP_SENT",
    "ENGAGED",
    "INTERESTED",
    "QUALIFIED",
    "PRICE_NEGOTIATION",
    "CLOSED_WON",
    "REPEAT_BUYER",
    "NOT_INTERESTED",
    "INVALID",
    "DO_NOT_CONTACT",
  ];
  const statusBarColors: Record<string, string> = {
    NOT_CONTACTED: "bg-gray-400",
    CONTACTED: "bg-blue-400",
    FOLLOW_UP_SENT: "bg-blue-300",
    ENGAGED: "bg-green-400",
    INTERESTED: "bg-indigo-400",
    QUALIFIED: "bg-violet-400",
    PRICE_NEGOTIATION: "bg-orange-400",
    CLOSED_WON: "bg-green-500/100/100",
    REPEAT_BUYER: "bg-green-600",
    NOT_INTERESTED: "bg-red-400",
    INVALID: "bg-rose-400",
    DO_NOT_CONTACT: "bg-black text-white",
  };
  const pct = (n: number, denom: number) =>
    denom > 0 ? Math.round((n / denom) * 100) : 0;

  // top countries system-wide
  const countryMap: Record<string, number> = {};
  allContacts.forEach((c) => {
    const k = c.country?.name || countryIdMap[c.countryId ?? -1] || "Unknown";
    countryMap[k] = (countryMap[k] || 0) + 1;
  });
  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // per-user stats
  const userStats = users
    .map((u) => {
      const uc = allContacts.filter((c) => c.authorId === u.id);
      const todayC = uc.filter(
        (c) => dDate(c.createdAt).toDateString() === todayStr,
      ).length;
      const weekC = uc.filter((c) => {
        const cd = dDate(c.createdAt);
        return cd >= currSun && cd <= currThu;
      }).length;
      const prevWkC = uc.filter((c) => {
        const cd = dDate(c.createdAt);
        return cd >= prevSun && cd <= prevThu;
      }).length;
      const monthC = uc.filter((c) => dDate(c.createdAt) >= monthStart).length;
      const wonC = uc.filter((c) => c.status === "CLOSED_WON").length;
      const respC = uc.filter((c) =>
        ["RESPONDED", "QUALIFIED", "NEGOTIATING", "CLOSED_WON"].includes(
          c.status,
        ),
      ).length;
      const respRate = pct(respC, uc.length);
      const winRate = pct(wonC, respC);

      const tasks = u.tasks || [];
      const taskHitToday = tasks.filter((t) => {
        const log = (t.dailyLogs || []).find(
          (l) => new Date(l.date).toDateString() === todayStr,
        );
        return log && log.achieved >= (log.targetValue || t.targetValue);
      }).length;

      // streak
      let streak = 0;
      if (tasks.length > 0) {
        const check = new Date(now);
        check.setDate(now.getDate() - 1);
        for (let i = 0; i < 60; i++) {
          if (!isWorkDay(check)) {
            check.setDate(check.getDate() - 1);
            continue;
          }
          const dStr = check.toDateString();
          const allHit = tasks.every((t) => {
            const l = (t.dailyLogs || []).find(
              (x) => new Date(x.date).toDateString() === dStr,
            );
            return l && l.achieved >= (l.targetValue || t.targetValue);
          });
          if (allHit && tasks.length > 0) {
            streak++;
            check.setDate(check.getDate() - 1);
          } else break;
        }
      }

      return {
        user: u,
        todayC,
        weekC,
        prevWkC,
        monthC,
        wonC,
        respRate,
        winRate,
        taskHitToday,
        totalTasks: tasks.length,
        streak,
        total: uc.length,
      };
    })
    .sort((a, b) => b.monthC - a.monthC);

  // ── period range ──────────────────────────────────────────────────────────
  const [selY, selM] = selectedMonth.split("-").map(Number);
  let rangeStart: Date | null = null,
    rangeEnd: Date | null = null;
  let prevRangeStart: Date | null = null,
    prevRangeEnd: Date | null = null;
  let rangeLabel = "";
  if (periodMode === "monthly") {
    rangeStart = new Date(selY, selM - 1, 1);
    rangeEnd = new Date(selY, selM, 0, 23, 59, 59, 999);
    prevRangeStart = new Date(selY, selM - 2, 1);
    prevRangeEnd = new Date(selY, selM - 1, 0, 23, 59, 59, 999);
    rangeLabel = new Date(selY, selM - 1).toLocaleString("default", {
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
  const showPeriod = periodMode !== "custom" || (!!customStart && !!customEnd);
  const inRange = (s: string, rs: Date | null, re: Date | null) => {
    if (!rs || !re) return false;
    const dd = new Date(s);
    return dd >= rs && dd <= re;
  };
  const rangeC = allContacts.filter((c) =>
    inRange(c.createdAt, rangeStart, rangeEnd),
  );
  const prevRC = allContacts.filter((c) =>
    inRange(c.createdAt, prevRangeStart, prevRangeEnd),
  );
  const rTotal = rangeC.length;
  const rDelta = rTotal - prevRC.length;
  const rResponded = rangeC.filter((c) =>
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
  const rWon = rangeC.filter((c) => c.status === "CLOSED_WON").length;
  const rRespRate = pct(rResponded, rTotal);
  const rWinRate = pct(rWon, rResponded);

  // monthly bar buckets (yearly mode)
  const monthlyBuckets = Array.from({ length: 12 }, (_, i) => {
    const s = new Date(selectedYear, i, 1),
      e = new Date(selectedYear, i + 1, 0, 23, 59, 59, 999);
    return {
      month: i,
      count: allContacts.filter((c) => {
        const dd = dDate(c.createdAt);
        return dd >= s && dd <= e;
      }).length,
    };
  });
  const maxMonthly = Math.max(1, ...monthlyBuckets.map((b) => b.count));
  // weekly bar buckets (monthly mode)
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
  const monthName = (m: number) =>
    new Date(2000, m).toLocaleString("default", { month: "short" });

  // top countries in period
  const periodCountryMap: Record<string, number> = {};
  rangeC.forEach((c) => {
    const k = c.country?.name || countryIdMap[c.countryId ?? -1] || "Unknown";
    periodCountryMap[k] = (periodCountryMap[k] || 0) + 1;
  });
  const topPeriodCountries = Object.entries(periodCountryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const rStatusCounts = Object.fromEntries(
    STATUS_LABELS.map((s) => [s, rangeC.filter((c) => c.status === s).length]),
  );

  // per-user period count for leaderboard
  const leaderboard = [...userStats]
    .map((row) => ({
      ...row,
      periodC: showPeriod
        ? allContacts.filter(
            (c) =>
              c.authorId === row.user.id &&
              inRange(c.createdAt, rangeStart, rangeEnd),
          ).length
        : 0,
    }))
    .sort((a, b) => b.periodC - a.periodC);

  // ── Task Failure Report ───────────────────────────────────────────────────
  // Enumerate every work-day (Sun–Thu) in the selected period
  const workDaysInRange: Date[] = [];
  if (rangeStart && rangeEnd) {
    const cursor = new Date(rangeStart);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= rangeEnd) {
      if (isWorkDay(cursor)) workDaysInRange.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  interface TaskRow {
    task: Task;
    taskTarget: number; // targetValue × workDays
  }
  interface UserFailReport {
    user: UserWithTasks;
    rows: TaskRow[];
    totalContactTarget: number;
    actualContacts: number;
    achieveRate: number;
  }

  const taskFailureReport: UserFailReport[] = users
    .filter((u) => (u.tasks || []).length > 0)
    .map((u) => {
      const activeTasks = (u.tasks || []).filter((t) => t.isActive);
      const rows: TaskRow[] = activeTasks.map((task) => ({
        task,
        taskTarget: task.targetValue * workDaysInRange.length,
      }));
      const totalContactTarget = rows.reduce((s, r) => s + r.taskTarget, 0);
      const actualContacts = allContacts.filter(
        (c) =>
          c.authorId === u.id && inRange(c.createdAt, rangeStart, rangeEnd),
      ).length;
      return {
        user: u,
        rows,
        totalContactTarget,
        actualContacts,
        achieveRate: pct(actualContacts, totalContactTarget),
      };
    })
    .filter((r) => r.totalContactTarget > 0)
    .sort((a, b) => a.achieveRate - b.achieveRate);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-500/100/20 text-purple-700 dark:text-purple-400";
      case "ADMIN":
        return "bg-blue-500/100/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-muted text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Expression Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              System-wide Expression activity overview
            </p>
          </div>
        </div>

        {/* ── System KPIs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            {
              label: "Total Users",
              value: users.length,
              sub: `${activeUsers} active`,
              color: "text-indigo-600",
              icon: <Users className="w-4 h-4 text-indigo-400" />,
            },
            {
              label: "Active Users",
              value: activeUsers,
              sub: `${users.length - activeUsers} inactive`,
              color: "text-green-600",
              icon: <Activity className="w-4 h-4 text-green-400" />,
            },
            {
              label: "Today",
              value: todayContacts,
              sub: "contacts added",
              color: "text-blue-600",
              icon: <Activity className="w-4 h-4 text-blue-400" />,
            },
            {
              label: "This Week",
              value: weekContacts,
              sub: (
                <span
                  className={`text-xs font-bold ${
                    weekDelta > 0
                      ? "text-green-600"
                      : weekDelta < 0
                        ? "text-red-500"
                        : "text-gray-400"
                  }`}
                >
                  {weekDelta > 0 ? "↑" : weekDelta < 0 ? "↓" : "="}
                  {Math.abs(weekDelta)} vs prev
                </span>
              ),
              color: "text-green-600",
              icon: <TrendingUp className="w-4 h-4 text-green-400" />,
            },
            {
              label: "This Month",
              value: monthContacts,
              sub: "contacts",
              color: "text-purple-600",
              icon: <Activity className="w-4 h-4 text-purple-400" />,
            },
            {
              label: "This Year",
              value: yearContacts,
              sub: "contacts",
              color: "text-teal-600",
              icon: <Activity className="w-4 h-4 text-teal-400" />,
            },
            {
              label: "Total Contacts",
              value: totalContacts,
              sub: "lifetime",
              color: "text-slate-700",
              icon: <Users className="w-4 h-4 text-slate-400" />,
            },
            {
              label: "Total Won",
              value: wonContacts,
              sub: "closed won",
              color: "text-emerald-600",
              icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
            },
          ].map(({ label, value, sub, color, icon }) => (
            <Card key={label}>
              <CardContent className="p-3 text-center">
                <div className="flex justify-center mb-1">{icon}</div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-[11px] font-medium text-gray-600">
                  {label}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Pipeline + Top Countries ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  System Pipeline
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {totalContacts} total
                </span>
              </div>
              <div className="space-y-2">
                {STATUS_LABELS.map((key) => {
                  const count = allContacts.filter(
                    (c) => c.status === key,
                  ).length;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-gray-700">
                          {key.replace("_", " ")}
                        </span>
                        <span className="text-gray-500">
                          {count} ({pct(count, totalContacts)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusBarColors[key]}`}
                          style={{ width: `${pct(count, totalContacts)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Top Countries (All Users)
                </span>
              </div>
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
                          <span className="text-gray-400 mr-1">#{i + 1}</span>
                          {country}
                        </span>
                        <span className="text-gray-500">
                          {count} ({pct(count, totalContacts)}%)
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
              {showPeriod && rangeLabel && (
                <span className="text-sm text-gray-400 font-medium">
                  — {rangeLabel}
                </span>
              )}
            </div>
            {/* mode tabs */}
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
            {/* period picker */}
            <div className="flex items-center gap-2">
              {periodMode === "monthly" && (
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-1 rounded hover:bg-muted"
                    onClick={() => {
                      const [y, mo] = selectedMonth.split("-").map(Number);
                      const dd = new Date(y, mo - 2, 1);
                      setSelectedMonth(
                        `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`,
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
                        `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`,
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

          {!showPeriod ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Select a start and end date.
            </div>
          ) : (
            <div className="space-y-4">
              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Total Contacts",
                    value: rTotal,
                    sub:
                      periodMode !== "custom" ? (
                        <span
                          className={`text-xs font-semibold ${rDelta > 0 ? "text-green-600" : rDelta < 0 ? "text-red-500" : "text-gray-400"}`}
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
                    sub: (
                      <span className="text-xs text-gray-500">
                        contacts / day
                      </span>
                    ),
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

              {/* bar chart + status + top countries */}
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
                                  height: `${Math.max(pct(count, maxMonthly), count > 0 ? 4 : 0)}%`,
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
                                  height: `${Math.max(pct(count, maxWeekly), count > 0 ? 4 : 0)}%`,
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
                        {STATUS_LABELS.map((key) => {
                          const c = rStatusCounts[key] || 0;
                          if (c === 0) return null;
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className="font-medium text-gray-700">
                                  {key.replace("_", " ")}
                                </span>
                                <span className="text-gray-500">
                                  {c} ({pct(c, rTotal)}%)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${statusBarColors[key]}`}
                                  style={{ width: `${pct(c, rTotal)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* top countries + vs prev */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <span className="text-sm font-semibold text-gray-700 block mb-3">
                      Top Countries — {rangeLabel}
                    </span>
                    {topPeriodCountries.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-xs">
                        No data
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {topPeriodCountries.map(([country, count], i) => (
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
                                  width: `${pct(count, topPeriodCountries[0][1])}%`,
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
                          { label: "Total", curr: rTotal, prev: prevRC.length },
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
                            label: "Not Interested",
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
              </div>

              {/* per-user contribution in period */}
              {rTotal > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <span className="text-sm font-semibold text-gray-700 block mb-3">
                      User Contribution — {rangeLabel}
                    </span>
                    <div className="space-y-2">
                      {leaderboard
                        .filter((r) => r.periodC > 0)
                        .map((row, i) => (
                          <div
                            key={row.user.id}
                            className="flex items-center gap-3"
                          >
                            <span className="text-xs text-gray-400 w-5 text-right">
                              #{i + 1}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {row.user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-gray-700 w-28 truncate">
                              {row.user.name}
                            </span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500"
                                style={{
                                  width: `${pct(row.periodC, rTotal)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-8 text-right">
                              {row.periodC}
                            </span>
                            <span className="text-[10px] text-gray-400 w-8 text-right">
                              {pct(row.periodC, rTotal)}%
                            </span>
                          </div>
                        ))}
                      {leaderboard.every((r) => r.periodC === 0) && (
                        <div className="text-center py-4 text-gray-400 text-xs">
                          No activity in this period
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── Task Failure / Performance Report ── */}
              {workDaysInRange.length > 0 && taskFailureReport.length > 0 && (
                <Card className="border-orange-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold text-gray-800">
                        Task Performance Report —{" "}
                        <span className="text-gray-500 font-normal">
                          {rangeLabel}
                        </span>
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        {workDaysInRange.length} work day
                        {workDaysInRange.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Summary table */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-gray-500">
                            <th className="text-left py-1 pr-3 font-medium">
                              User
                            </th>
                            <th className="text-center py-1 px-2 font-medium">
                              Tasks
                            </th>
                            <th className="text-center py-1 px-2 font-medium">
                              Work Days
                            </th>
                            <th className="text-center py-1 px-2 font-medium text-indigo-600">
                              Target
                            </th>
                            <th className="text-center py-1 px-2 font-medium text-blue-600">
                              Actual
                            </th>
                            <th className="text-center py-1 px-2 font-medium">
                              Achievement
                            </th>
                            <th className="text-center py-1 px-2 font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {taskFailureReport.map((report) => {
                            const ar = report.achieveRate;
                            const statusLabel =
                              ar >= 100
                                ? "Excellent"
                                : ar >= 75
                                  ? "Good"
                                  : ar >= 50
                                    ? "Warning"
                                    : "At Risk";
                            const statusColor =
                              ar >= 100
                                ? "bg-green-500/100/20 text-green-700 dark:text-green-400"
                                : ar >= 75
                                  ? "bg-blue-500/100/20 text-blue-700 dark:text-blue-400"
                                  : ar >= 50
                                    ? "bg-yellow-500/100/20 text-yellow-700 dark:text-yellow-400"
                                    : "bg-red-500/100/20 text-red-700 dark:text-red-400";
                            const barColor =
                              ar >= 100
                                ? "bg-green-400"
                                : ar >= 75
                                  ? "bg-blue-400"
                                  : ar >= 50
                                    ? "bg-yellow-400"
                                    : "bg-red-400";
                            return (
                              <tr
                                key={report.user.id}
                                className="hover:bg-muted/50"
                              >
                                <td className="py-2 pr-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                      {report.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-gray-700 truncate max-w-[100px]">
                                      {report.user.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-2 text-gray-600">
                                  {report.rows.length}
                                </td>
                                <td className="text-center py-2 px-2 text-gray-600">
                                  {workDaysInRange.length}
                                </td>
                                <td className="text-center py-2 px-2 font-medium text-indigo-600">
                                  {report.totalContactTarget}
                                </td>
                                <td className="text-center py-2 px-2 font-medium text-blue-600">
                                  {report.actualContacts}
                                </td>
                                <td className="text-center py-2 px-2">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-16 bg-muted rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full ${barColor}`}
                                        style={{
                                          width: `${Math.min(ar, 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="font-bold text-gray-700">
                                      {ar}%
                                    </span>
                                  </div>
                                </td>
                                <td className="text-center py-2 px-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Per-task target breakdown */}
                    <div className="space-y-3">
                      {taskFailureReport.map((report) => (
                        <div key={report.user.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {report.user.name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {report.actualContacts} /{" "}
                              {report.totalContactTarget} contacts
                            </span>
                          </div>
                          {report.rows.map((row) => (
                            <div
                              key={row.task.id}
                              className="flex items-center gap-2 mb-1"
                            >
                              <span className="text-[10px] text-gray-500 w-32 truncate shrink-0">
                                {row.task.title}
                              </span>
                              <span className="text-[10px] text-indigo-500 shrink-0">
                                {row.task.targetValue}/day ×{" "}
                                {workDaysInRange.length}d = {row.taskTarget}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* ── Leaderboard ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Leaderboard</h3>
            {showPeriod && rangeLabel && (
              <span className="text-sm text-gray-400">
                sorted by {rangeLabel}
              </span>
            )}
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {[
                        "#",
                        "User",
                        "Status",
                        "Today",
                        "This Week",
                        "Prev Week",
                        "Month",
                        showPeriod ? rangeLabel || "Period" : null,
                        "Tasks",
                        "Response%",
                        "Won",
                        "Actions",
                      ]
                        .filter(Boolean)
                        .map((h) => (
                          <th
                            key={h as string}
                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                              showPeriod && h === (rangeLabel || "Period")
                                ? "text-blue-600 bg-blue-500/100/10"
                                : "text-gray-500"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaderboard.map((row, i) => {
                      const wkDelta = row.weekC - row.prevWkC;
                      return (
                        <tr
                          key={row.user.id}
                          className={`hover:bg-blue-500/100/100/10 transition-colors ${
                            i === 0
                              ? "bg-amber-50/40"
                              : i === 1
                                ? "bg-muted/30"
                                : i === 2
                                  ? "bg-orange-500/100/100/10"
                                  : ""
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-sm font-bold ${
                                i === 0
                                  ? "text-amber-500"
                                  : i === 1
                                    ? "text-gray-500"
                                    : i === 2
                                      ? "text-orange-400"
                                      : "text-gray-400"
                              }`}
                            >
                              {i === 0
                                ? "🥇"
                                : i === 1
                                  ? "🥈"
                                  : i === 2
                                    ? "🥉"
                                    : `#${i + 1}`}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {row.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-800">
                                  {row.user.name}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {row.user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Badge
                                className={`${getRoleColor(
                                  row.user.role,
                                )} text-[10px] px-1.5 py-0.5`}
                              >
                                {row.user.role.replace("_", " ")}
                              </Badge>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  row.user.status === "ACTIVE"
                                    ? "bg-green-500/100/100"
                                    : row.user.status === "BLOCK"
                                      ? "bg-red-500/100/100"
                                      : "bg-yellow-400"
                                }`}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`text-sm font-bold ${
                                row.todayC > 0
                                  ? "text-blue-600"
                                  : "text-gray-300"
                              }`}
                            >
                              {row.todayC}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-sm font-bold ${
                                  row.weekC > 0
                                    ? "text-green-600"
                                    : "text-gray-300"
                                }`}
                              >
                                {row.weekC}
                              </span>
                              {wkDelta !== 0 && (
                                <span
                                  className={`text-[10px] font-bold ${
                                    wkDelta > 0
                                      ? "text-green-500"
                                      : "text-red-400"
                                  }`}
                                >
                                  {wkDelta > 0 ? "↑" : "↓"}
                                  {Math.abs(wkDelta)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-500">
                              {row.prevWkC}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`text-sm font-bold ${
                                row.monthC > 0
                                  ? "text-purple-600"
                                  : "text-gray-300"
                              }`}
                            >
                              {row.monthC}
                            </span>
                          </td>
                          {showPeriod && (
                            <td className="px-4 py-3 whitespace-nowrap text-center bg-blue-500/100/100/10">
                              <div className="flex flex-col items-center gap-0.5">
                                <span
                                  className={`text-sm font-bold ${row.periodC > 0 ? "text-blue-600" : "text-gray-300"}`}
                                >
                                  {row.periodC}
                                </span>
                                {rTotal > 0 && row.periodC > 0 && (
                                  <span className="text-[10px] text-blue-400">
                                    {pct(row.periodC, rTotal)}%
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            {row.totalTasks > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-xs font-semibold text-gray-700">
                                  {row.taskHitToday}/{row.totalTasks}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  hit today
                                </span>
                                {row.streak > 0 && (
                                  <span className="text-[10px] text-orange-500 font-bold">
                                    🔥{row.streak}d
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`text-sm font-bold ${
                                  row.respRate > 50
                                    ? "text-green-600"
                                    : row.respRate > 20
                                      ? "text-amber-500"
                                      : "text-gray-500"
                                }`}
                              >
                                {row.respRate}%
                              </span>
                              <div className="w-12 bg-muted rounded-full h-1">
                                <div
                                  className="h-1 rounded-full bg-green-400"
                                  style={{ width: `${row.respRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`text-sm font-bold ${
                                row.wonC > 0
                                  ? "text-emerald-600"
                                  : "text-gray-300"
                              }`}
                            >
                              {row.wonC}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() =>
                                router.push(
                                  `/dashboard/user/user-profile?id=${row.user.id}`,
                                )
                              }
                            >
                              View <ChevronRight className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No users found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Today's Activity Per User ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Today&apos;s Activity</h3>
            <span className="ml-auto text-sm text-gray-500">
              {new Date().toLocaleDateString("default", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {userStats
              .filter((r) => r.user.status === "ACTIVE")
              .map((row) => {
                const taskPctToday =
                  row.totalTasks > 0
                    ? pct(row.taskHitToday, row.totalTasks)
                    : null;
                return (
                  <Card
                    key={row.user.id}
                    className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                      row.todayC > 0 ? "border-green-200" : ""
                    }`}
                    onClick={() =>
                      router.push(
                        `/dashboard/user/user-profile?id=${row.user.id}`,
                      )
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {row.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">
                            {row.user.name}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {row.user.email}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 ml-auto" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-500/100/10 rounded-lg p-2">
                          <div
                            className={`text-lg font-bold ${
                              row.todayC > 0 ? "text-blue-600" : "text-gray-300"
                            }`}
                          >
                            {row.todayC}
                          </div>
                          <div className="text-[10px] text-gray-500">Today</div>
                        </div>
                        <div className="bg-green-500/100/10 rounded-lg p-2">
                          <div
                            className={`text-lg font-bold ${
                              row.weekC > 0 ? "text-green-600" : "text-gray-300"
                            }`}
                          >
                            {row.weekC}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            This Wk
                          </div>
                        </div>
                        <div className="bg-purple-500/100/10 rounded-lg p-2">
                          <div
                            className={`text-lg font-bold ${
                              row.monthC > 0
                                ? "text-purple-600"
                                : "text-gray-300"
                            }`}
                          >
                            {row.monthC}
                          </div>
                          <div className="text-[10px] text-gray-500">Month</div>
                        </div>
                      </div>
                      {row.totalTasks > 0 && taskPctToday !== null && (
                        <div className="mt-2.5">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Tasks today</span>
                            <span>
                              {row.taskHitToday}/{row.totalTasks} hit
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                taskPctToday === 100
                                  ? "bg-green-500/100/100"
                                  : "bg-indigo-400"
                              }`}
                              style={{ width: `${taskPctToday}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {row.streak > 0 && (
                        <div className="mt-2 text-[11px] font-semibold text-orange-500">
                          🔥 {row.streak}-day streak
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
