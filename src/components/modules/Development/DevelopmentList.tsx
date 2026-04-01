"use client";

import { deleteDevelopmentSample } from "@/actions/create";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Buyer, DevelopmentSample } from "@/types";
import { ChevronLeft, Filter, Plus, TestTube, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DevelopmentTable } from "./DevelopmentTable";
import DevelopmentStats from "./DevelopmentStats";
import { ViewDetailsModal } from "./ViewDetailsModal";
import { EditModal } from "./EditModal";

export default function DevelopmentList() {
  const [samples, setSamples] = useState<DevelopmentSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSamples, setTotalSamples] = useState(0);
  const limit = 10;

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] =
    useState<DevelopmentSample | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = (session?.user as { role?: string })?.role ?? "";
  const router = useRouter();

  // Data for filters
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  const handleCreateSample = () => {
    router.push("/dashboard/development/create");
  };

  const clearAllFilters = () => {
    setSelectedStatus("all");
    setSelectedBuyer("all");
    setSelectedSeason("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchTerm]);

  // Fetch samples
  useEffect(() => {
    const fetchSamples = async () => {
      if (!userId || !userRole) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          search: debouncedSearch,
        });

        if (selectedStatus !== "all")
          queryParams.append("smsStatus", selectedStatus);
        if (selectedBuyer !== "all")
          queryParams.append("buyerId", selectedBuyer);
        if (selectedSeason !== "all")
          queryParams.append("seasonName", selectedSeason);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/development?${queryParams.toString()}`,
          {
            headers: {
              "user-id": userId.toString(),
              "user-role": userRole,
            },
            cache: "no-store",
          },
        );

        if (res.ok) {
          const result = await res.json();
          setSamples(result.data || []);
          setTotalSamples(result.pagination?.total || 0);
          setTotalPages(result.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch development samples:", error);
        toast.error("Failed to load development samples");
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [
    currentPage,
    debouncedSearch,
    selectedStatus,
    selectedBuyer,
    selectedSeason,
    refreshTrigger,
    userId,
    userRole,
  ]);

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const buyersRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`,
        );

        if (buyersRes.ok) {
          const buyersData = await buyersRes.json();
          setBuyers(
            Array.isArray(buyersData) ? buyersData : buyersData.data || [],
          );
        }
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditSample = (sample: DevelopmentSample) => {
    setSelectedSample(sample);
    setEditModalOpen(true);
  };

  const handleViewSample = (sample: DevelopmentSample) => {
    setSelectedSample(sample);
    setViewModalOpen(true);
  };

  const handleDeleteSample = async (sample: DevelopmentSample) => {
    if (
      confirm(`Are you sure you want to delete sample for ${sample.style}?`)
    ) {
      try {
        const result = await deleteDevelopmentSample(sample.id);
        if (result?.success) {
          toast.success("Sample deleted successfully");
          setRefreshTrigger((prev) => prev + 1);
        } else {
          toast.error(result?.message || "Failed to delete sample");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while deleting the sample");
      }
    }
  };

  if (loading && samples.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
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

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-110">
              <TestTube className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Development Manager
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400">
                Track and manage your {totalSamples} development samples
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
              onClick={handleCreateSample}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Sample
            </Button>
          </div>
        </div>

        {/* <DevelopmentStats /> */}

        <div className="space-y-8">
          {/* Header for Filter Section */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Search
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all"
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

          {/* Enhanced Filter Bar */}
          {showFilters && (
            <div className="flex flex-wrap items-end gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-64 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Search Style/Description
                </Label>
                <Input
                  placeholder="Enter style or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-indigo-500/20"
                />
              </div>

              <div className="w-56 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  SMS Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-indigo-500/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Status
                    </SelectItem>
                    <SelectItem value="PENDING" className="rounded-lg">
                      Pending
                    </SelectItem>
                    <SelectItem value="SUBMITTED" className="rounded-lg">
                      Submitted
                    </SelectItem>
                    <SelectItem value="APPROVED" className="rounded-lg">
                      Approved
                    </SelectItem>
                    <SelectItem value="DROPPED" className="rounded-lg">
                      Dropped
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-56 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Buyer
                </Label>
                <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-indigo-500/20">
                    <SelectValue placeholder="Select Buyer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Buyers
                    </SelectItem>
                    {buyers.map((buyer) => (
                      <SelectItem
                        key={buyer.id}
                        value={buyer.id.toString()}
                        className="rounded-lg"
                      >
                        {buyer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedStatus !== "all" ||
                selectedBuyer !== "all" ||
                searchTerm) && (
                <div className="space-y-2">
                  <div className="h-4" />
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="h-11 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 font-bold px-4 transition-all rounded-xl shadow-sm"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}

              <div className="ml-auto space-y-2 min-w-[140px]">
                <div className="h-4" />
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-100/80">
                  <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    {samples.length} / {totalSamples} Records
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Table Content */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/60 dark:shadow-none rounded-[32px] bg-white dark:bg-zinc-900 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
            <CardHeader className="pb-4 pt-8 px-8 border-b border-zinc-50 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Development Listings
                  </CardTitle>
                  <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                    Browse and manage all registered development samples
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <DevelopmentTable
                data={samples}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onEdit={handleEditSample}
                onView={handleViewSample}
                onDelete={handleDeleteSample}
              />
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <ViewDetailsModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedSample(null);
          }}
          sample={selectedSample}
        />

        <EditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedSample(null);
          }}
          sample={selectedSample}
          onSuccess={() => {
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>
    </div>
  );
}
