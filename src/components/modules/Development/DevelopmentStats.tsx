"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
import { DevelopmentStats as DevelopmentStatsType } from "@/types";

export default function DevelopmentStats() {
  const [stats, setStats] = useState<DevelopmentStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/development/stats`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch development statistics");
        }
        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse shadow-sm"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-100 bg-red-50">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground">
            No statistics available
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusStats = [
    {
      label: "Pending",
      value: stats.statusCounts.PENDING || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      label: "Submitted",
      value: stats.statusCounts.SUBMITTED || 0,
      icon: Layers,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Approved",
      value: stats.statusCounts.APPROVED || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      label: "Dropped",
      value: stats.statusCounts.DROPPED || 0,
      icon: XCircle,
      color: "text-rose-600",
      bgColor: "bg-rose-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Samples
            </CardTitle>
            <Package className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">
              {stats.totalSamples}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Samples across all seasons
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {stats.totalSamples > 0
                ? (
                    ((stats.statusCounts.APPROVED || 0) / stats.totalSamples) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully approved samples
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Seasons
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {stats.seasonCounts ? Object.keys(stats.seasonCounts).length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active collection seasons
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tracking
            </CardTitle>
            <Layers className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {(stats.statusCounts.PENDING || 0) +
                (stats.statusCounts.SUBMITTED || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Samples in pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex items-center p-4 rounded-xl border transition-all hover:shadow-md ${stat.bgColor} border-transparent`}
                >
                  <div className={`p-2.5 rounded-lg bg-white shadow-sm mr-4`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
