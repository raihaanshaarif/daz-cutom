"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  Beaker,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Users,
  Timer,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { DevelopmentTable } from "@/components/modules/Development/DevelopmentTable";
import { DevelopmentSample, Buyer } from "@/types";
import { useRouter } from "next/navigation";

export default function DevelopmentReportPage() {
  const router = useRouter();
  const [selectedBuyer, setSelectedBuyer] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [samples, setSamples] = useState<DevelopmentSample[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalSamples: 0,
    approvedSamples: 0,
    pendingSamples: 0,
    rejectedSamples: 0,
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const buyersRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`,
        );
        const buyersData = await buyersRes.json();
        setBuyers(Array.isArray(buyersData) ? buyersData : []);
      } catch (err) {
        console.error("Failed to fetch buyers:", err);
      }
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchSamples = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "1000",
        });
        if (selectedBuyer !== "all") params.append("buyerId", selectedBuyer);
        if (selectedStatus !== "all") params.append("status", selectedStatus);
        if (selectedSeason !== "all") params.append("season", selectedSeason);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/development/samples?${params.toString()}`,
        );
        const result = await res.json();
        const samplesData = result.data || [];
        setSamples(samplesData);

        setMetrics({
          totalSamples: samplesData.length,
          approvedSamples: samplesData.filter(
            (s: DevelopmentSample) => s.smsStatus === "APPROVED",
          ).length,
          pendingSamples: samplesData.filter(
            (s: DevelopmentSample) => s.smsStatus === "PENDING",
          ).length,
          rejectedSamples: samplesData.filter(
            (s: DevelopmentSample) => s.smsStatus === "DROPPED",
          ).length,
        });
      } catch (err) {
        console.error("Failed to fetch samples:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, [selectedBuyer, selectedStatus, selectedSeason]);

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1600px] mx-auto w-full bg-zinc-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
            <FlaskConical className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 uppercase ">
              Development Report
            </h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2 mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Sample tracking and approval analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-semibold gap-2"
            onClick={() => typeof window !== "undefined" && window.print()}
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button
            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 uppercase tracking-wider gap-2"
            onClick={() => router.push("/dashboard/development/create")}
          >
            <Plus className="w-5 h-5" />
            New Sample
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mr-2">
              <Filter className="h-4 w-4" />
              Quick Filters:
            </div>

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-none h-11 focus:ring-1 focus:ring-indigo-500 transition-all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-zinc-400" />
                    <SelectValue placeholder="Buyer" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-zinc-100">
                  <SelectItem
                    value="all"
                    className="font-bold uppercase tracking-tighter italic"
                  >
                    All Partners
                  </SelectItem>
                  {buyers.map((buyer) => (
                    <SelectItem
                      key={buyer.id}
                      value={buyer.id.toString()}
                      className="font-medium"
                    >
                      {buyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-none h-11 focus:ring-1 focus:ring-indigo-500 transition-all">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-zinc-400" />
                    <SelectValue placeholder="All Lifecycle Stages" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-zinc-100">
                  <SelectItem
                    value="all"
                    className="font-bold uppercase tracking-tighter italic"
                  >
                    All Lifecycle Stages
                  </SelectItem>
                  {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="font-medium"
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-none h-11 focus:ring-1 focus:ring-indigo-500 transition-all">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <SelectValue placeholder="Full Seasonal Range" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-zinc-100">
                  <SelectItem
                    value="all"
                    className="font-bold uppercase tracking-tighter italic"
                  >
                    Full Seasonal Range
                  </SelectItem>
                  {Array.from(new Set(samples.map((s) => s.seasonYear)))
                    .filter(Boolean)
                    .map((year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="font-medium"
                      >
                        {year}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 text-xs font-bold uppercase tracking-tighter italic"
                onClick={() => {
                  setSelectedBuyer("all");
                  setSelectedStatus("all");
                  setSelectedSeason("all");
                }}
              >
                Reset Operations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1.5 bg-indigo-600 w-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest ">
              Total Samples
            </CardTitle>
            <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:scale-110 transition-transform">
              <Beaker className="w-5 h-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-black text-zinc-900 tracking-tight ">
              {metrics.totalSamples}
            </div>
            <p className="text-xs text-zinc-400 mt-2 font-semibold uppercase tracking-wider">
              Active R&D Queue
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1.5 bg-emerald-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest ">
              Approved
            </CardTitle>
            <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-black text-emerald-600 tracking-tight ">
              {metrics.approvedSamples}
            </div>
            <p className="text-xs text-emerald-600/70 mt-2 font-semibold uppercase tracking-wider font-mono italic">
              Success Rate:{" "}
              {metrics.totalSamples > 0
                ? (
                    (metrics.approvedSamples / metrics.totalSamples) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1.5 bg-amber-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest ">
              Pending
            </CardTitle>
            <div className="p-2.5 bg-amber-50 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-black text-amber-600 tracking-tight ">
              {metrics.pendingSamples}
            </div>
            <p className="text-xs text-amber-600/70 mt-2 font-semibold tracking-wider italic font-mono uppercase">
              Awaiting Feedback
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <div className="h-1.5 bg-rose-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest italic">
              Dropped
            </CardTitle>
            <div className="p-2.5 bg-rose-50 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-black text-rose-600 tracking-tight italic">
              {metrics.rejectedSamples}
            </div>
            <p className="text-xs text-rose-600/70 mt-2 font-semibold tracking-wider uppercase italic font-mono">
              Operations Halted
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-zinc-100">
        <div className="bg-white px-8 py-8 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight italic">
                Technical Documentation
              </h3>
              <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                {samples.length} / {metrics.totalSamples} Active Records
              </p>
            </div>
          </div>
        </div>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs italic animate-pulse">
                Syncing technical data...
              </p>
            </div>
          ) : samples.length > 0 ? (
            <div className="relative overflow-x-auto">
              <DevelopmentTable data={samples} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
              <div className="p-6 bg-zinc-50 rounded-full mb-2">
                <FlaskConical className="w-12 h-12 text-zinc-200" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 uppercase italic">
                No Data Points Detected
              </h4>
              <p className="text-zinc-400 max-w-[280px] text-sm font-medium">
                Adjust your operation parameters or clear filters to track
                active developments.
              </p>
              <Button
                variant="link"
                className="text-indigo-600 font-bold uppercase tracking-widest italic mt-2"
                onClick={() => {
                  setSelectedBuyer("all");
                  setSelectedStatus("all");
                  setSelectedSeason("all");
                }}
              >
                Clear Parameters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
