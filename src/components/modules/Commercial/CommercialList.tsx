"use client";

import { Commercial, Pagination } from "@/types";
import { useEffect, useState } from "react";
import { CommercialTable } from "./CommercialTable";
import { EditCommercialForm } from "./EditCommercialForm";
import { ViewCommercialModal } from "./ViewCommercialModal";
import { FileText, Plus, ChevronLeft, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommercialList() {
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCommercials, setTotalCommercials] = useState(0);
  const limit = 10;

  // Filter states
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("all");
  const [selectedDocumentStatus, setSelectedDocumentStatus] =
    useState<string>("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [allCommercialsCache, setAllCommercialsCache] = useState<Commercial[]>(
    [],
  );
  const [allCommercialsPagination, setAllCommercialsPagination] =
    useState<Pagination | null>(null);
  const router = useRouter();

  // Edit modal state
  const [editingCommercial, setEditingCommercial] = useState<Commercial | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // View modal state
  const [viewCommercial, setViewCommercial] = useState<Commercial | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCreateCommercial = () => {
    router.push("/dashboard/commercial/create-invoice");
  };

  const clearAllFilters = () => {
    setSelectedDate("");
    setSelectedPeriod("all");
    setSelectedPaymentStatus("all");
    setSelectedDocumentStatus("all");
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchCommercials = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });
        if (selectedPaymentStatus && selectedPaymentStatus !== "all") {
          params.append("paymentStatus", selectedPaymentStatus);
        }
        if (selectedDocumentStatus && selectedDocumentStatus !== "all") {
          params.append("documentStatus", selectedDocumentStatus);
        }
        if (selectedDate) {
          params.append("bookingDate", selectedDate);
        }
        if (selectedPeriod && selectedPeriod !== "all") {
          params.append("period", selectedPeriod);
        }

        const queryString = params.toString();
        console.log("API call with params:", queryString);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/commercial?${queryString}`,
          {
            cache: "no-store",
          },
        );
        const { data, pagination } = await res.json();
        console.log("API response data:", data);
        console.log("Number of commercials returned:", data?.length || 0);

        const filteredData = data || [];

        setCommercials(filteredData);
        setTotalPages(pagination?.totalPages || 1);
        setTotalCommercials(pagination?.total || 0);

        // Cache all commercials data when no filters are applied
        if (
          selectedPeriod === "all" &&
          !selectedDate &&
          selectedPaymentStatus === "all" &&
          selectedDocumentStatus === "all"
        ) {
          setAllCommercialsCache(filteredData);
          setAllCommercialsPagination(pagination);
        }
      } catch (error) {
        console.error("Failed to fetch commercials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommercials();
  }, [
    currentPage,
    selectedPaymentStatus,
    selectedDocumentStatus,
    selectedDate,
    selectedPeriod,
    refreshTrigger,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
    setLoading(true);
  };

  const handleEditCommercial = (commercial: Commercial) => {
    setEditingCommercial(commercial);
    setIsEditModalOpen(true);
  };

  const handleViewCommercial = (commercial: Commercial) => {
    setViewCommercial(commercial);
    setIsViewModalOpen(true);
  };

  const handleDeleteCommercial = async (commercial: Commercial) => {
    if (
      confirm(
        `Are you sure you want to delete commercial record for ${commercial.invoiceNo}?`,
      )
    ) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/commercial/${commercial.id}`,
          {
            method: "DELETE",
          },
        );

        if (res.ok) {
          toast.success("Commercial record deleted successfully!");
          setRefreshTrigger((prev) => prev + 1);
        } else {
          toast.error("Failed to delete commercial record");
        }
      } catch (error) {
        console.error("Failed to delete commercial record:", error);
        toast.error("An error occurred while deleting the record");
      }
    }
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedPeriod("all");
    setSelectedPaymentStatus("all");
    setSelectedDocumentStatus("all");
    setCurrentPage(1);
  };

  const handleEditSuccess = () => {
    // Refresh the commercials list by triggering a refetch
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCommercial(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewCommercial(null);
  };

  if (loading && commercials.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
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

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Commercial List
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400">
                Manage and track financial invoices across {totalCommercials}{" "}
                records
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
              onClick={handleCreateCommercial}
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Commercial
            </Button>
          </div>
        </div>

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

          {/* Quick Filters Card */}
          {showFilters && (
            <div className="flex flex-wrap items-end gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-56 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Payment Status
                </Label>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={(val) => {
                    setSelectedPaymentStatus(val);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-emerald-500/20">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Payments
                    </SelectItem>
                    <SelectItem
                      value="PAID"
                      className="rounded-lg text-emerald-600 font-medium"
                    >
                      Paid
                    </SelectItem>
                    <SelectItem
                      value="UNPAID"
                      className="rounded-lg text-red-600 font-medium"
                    >
                      Unpaid
                    </SelectItem>
                    <SelectItem
                      value="PARTIAL"
                      className="rounded-lg text-amber-600 font-medium"
                    >
                      Partial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-56 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Document Status
                </Label>
                <Select
                  value={selectedDocumentStatus}
                  onValueChange={(val) => {
                    setSelectedDocumentStatus(val);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-emerald-500/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Status
                    </SelectItem>
                    <SelectItem value="PENDING" className="rounded-lg">
                      Pending
                    </SelectItem>
                    <SelectItem value="APPROVED" className="rounded-lg">
                      Approved
                    </SelectItem>
                    <SelectItem value="CANCELLED" className="rounded-lg">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedDate ||
                selectedPeriod !== "all" ||
                selectedPaymentStatus !== "all" ||
                selectedDocumentStatus !== "all") && (
                <div className="space-y-2">
                  <div className="h-4" />
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="h-11 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 font-bold px-4 transition-all rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}

              <div className="ml-auto space-y-2 min-w-[140px]">
                <div className="h-4" />
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-100/80">
                  <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    {commercials.length} / {totalCommercials} Records
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
                    Financial Records
                  </CardTitle>
                  <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                    Browse and manage all registered commercial invoices
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <CommercialTable
                data={commercials}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onEdit={handleEditCommercial}
                onView={handleViewCommercial}
                onDelete={handleDeleteCommercial}
              />
            </CardContent>
          </Card>
        </div>

        {/* Modals and Dialogs */}
        {editingCommercial && (
          <EditCommercialForm
            commercial={editingCommercial}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            isOpen={isEditModalOpen}
          />
        )}

        {viewCommercial && (
          <ViewCommercialModal
            commercial={viewCommercial}
            onClose={handleCloseViewModal}
            isOpen={isViewModalOpen}
          />
        )}
      </div>
    </div>
  );
}
