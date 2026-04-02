"use client";

import { Parcel, Courier } from "@/types";
import { useEffect, useState, useCallback } from "react";

import { Package, Truck, Plus, ChevronLeft, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ParcelTable } from "./ParcelTable";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

import { toast } from "sonner";
import { ViewParcelModal } from "./ViewParcelModal";
import { EditParcelModal } from "./EditParcelModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ParcelList() {
  // Demo data for development
  const demoParcels: Parcel[] = [];

  const [parcels, setParcels] = useState<Parcel[]>(demoParcels);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParcels, setTotalParcels] = useState(demoParcels.length);
  const limit = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Access User from session for API calls
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";
  const { authFetch } = useAuthFetch();
  const router = useRouter();

  // Modal states
  const [viewParcel, setViewParcel] = useState<Parcel | null>(null);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch couriers for filter dropdown
  useEffect(() => {
    const fetchCouriers = async () => {
      if (!userId || !userRole) return;
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies?page=1&limit=100`,
          {
            cache: "no-store",
          },
        );
        const responseData = await res.json();
        const courierData = responseData.data || [];
        setCouriers(courierData);
      } catch (error) {
        console.error("Failed to fetch couriers:", error);
      }
    };
    fetchCouriers();
  }, [userId, userRole, authFetch]);

  // Extract fetchParcels as a separate function
  const fetchParcels = useCallback(async () => {
    if (!userId || !userRole) return;
    setLoading(true);
    try {
      // Format dates to ISO string if provided
      const formattedDateFrom = dateFrom
        ? new Date(dateFrom + "T00:00:00").toISOString()
        : "";
      const formattedDateTo = dateTo
        ? new Date(dateTo + "T23:59:59").toISOString()
        : "";

      // Convert month filter to date range
      let monthStartDate = "";
      let monthEndDate = "";
      if (selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(
          parseInt(year),
          parseInt(month),
          0,
          23,
          59,
          59,
        );
        monthStartDate = startDate.toISOString();
        monthEndDate = endDate.toISOString();
      }

      // Use month dates if month is selected, otherwise use manual date range
      const finalStartDate = monthStartDate || formattedDateFrom;
      const finalEndDate = monthEndDate || formattedDateTo;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(finalStartDate && { startDate: finalStartDate }),
        ...(finalEndDate && { endDate: finalEndDate }),
        ...(selectedCourier && { courierCompanyId: selectedCourier }),
      });

      console.log("Fetching parcels with params:", {
        page: currentPage,
        limit: limit,
        searchTerm,
        selectedMonth,
        monthStartDate,
        monthEndDate,
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
        selectedCourier,
      });

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies?page=1&limit=100`,
        {
          cache: "no-store",
        },
      );
      const responseData = await res.json();
      console.log("API response data:", responseData);

      // Response structure: { success, data: { data: [...], meta: { ... } } }
      const data = responseData.data?.data || [];
      const pagination = responseData.data?.meta;

      console.log("Number of parcels returned:", data?.length || 0);

      setParcels(data);
      setTotalPages(pagination?.totalPages || 1);
      setTotalParcels(pagination?.total || data.length);
    } catch (error) {
      console.error("Failed to fetch parcels:", error);
    } finally {
      setLoading(false);
    }
  }, [
    authFetch,
    userId,
    userRole,
    currentPage,
    limit,
    searchTerm,
    selectedMonth,
    dateFrom,
    dateTo,
    selectedCourier,
  ]);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels, authFetch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedMonth("");
    setDateFrom("");
    setDateTo("");
    setSelectedCourier("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedMonth || dateFrom || dateTo || selectedCourier;

  const handleCreateParcel = () => {
    router.push("/dashboard/parcel/create-parcel");
  };

  const handleEditParcel = (parcel: Parcel) => {
    setEditingParcel(parcel);
    setIsEditModalOpen(true);
  };

  const handleViewParcel = (parcel: Parcel) => {
    setViewParcel(parcel);
    setIsViewModalOpen(true);
  };

  const handleDeleteParcel = async (parcel: Parcel) => {
    if (
      window.confirm(
        `Are you sure you want to delete parcel ${parcel.trackingNumber}?`,
      )
    ) {
      try {
        const result = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/parcels/${parcel.id}`,
          {
            method: "DELETE",
          },
        );

        const responseData = await result.json();

        if (result.ok && (responseData?.data || responseData?.success)) {
          toast.success("Parcel deleted successfully!");
          // Refresh the list
          fetchParcels();
        } else {
          toast.error("Failed to delete parcel");
        }
      } catch (error) {
        console.error("Failed to delete parcel:", error);
        toast.error("An error occurred while deleting the parcel");
      }
    }
  };

  const handleEditSuccess = () => {
    // Refetch the parcels list instead of reloading the page
    fetchParcels();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingParcel(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewParcel(null);
  };

  if (loading && parcels.length === 0) {
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
            <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Parcel List
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400">
                Manage and track all logistics parcels across {totalParcels}{" "}
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
              onClick={handleCreateParcel}
              className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95 group rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Parcel
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
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl transition-all"
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
              <div className="w-64 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Courier Company
                </Label>
                <Select
                  value={selectedCourier}
                  onValueChange={setSelectedCourier}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-orange-500/20">
                    <SelectValue placeholder="Select Courier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Couriers
                    </SelectItem>
                    {couriers.map((courier) => (
                      <SelectItem
                        key={courier.id}
                        value={courier.id.toString()}
                        className="rounded-lg"
                      >
                        {courier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-48 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Inward Month
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Months
                    </SelectItem>
                    {Array.from({ length: 12 }, (_, i) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - i);
                      let label = "";
                      try {
                        label = d.toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        });
                      } catch (error) {
                        label = `${d.getFullYear()} ${d.toLocaleString("default", { month: "long" })}`;
                      }
                      const value = `${d.getFullYear()}-${(d.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}`;
                      return (
                        <SelectItem
                          key={value}
                          value={value}
                          className="rounded-lg"
                        >
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
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
                    {parcels.length} / {totalParcels} Records
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
                    Parcel Logistics
                  </CardTitle>
                  <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                    Browse and manage all registered logistics information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <ParcelTable
                data={parcels}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onEdit={handleEditParcel}
                onView={handleViewParcel}
                onDelete={handleDeleteParcel}
              />
            </CardContent>
          </Card>
        </div>

        {/* Modals handled by state in ParcelTable or similar, but adding Dialogs here for consistency */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                Edit Parcel: {editingParcel?.trackingNumber}
              </DialogTitle>
            </DialogHeader>
            {editingParcel && (
              <EditParcelModal
                parcel={editingParcel}
                onClose={handleCloseEditModal}
                isOpen={isEditModalOpen}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
            <DialogHeader className="pb-4 border-b border-zinc-100">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                Parcel Tracking: {viewParcel?.trackingNumber}
              </DialogTitle>
            </DialogHeader>
            {viewParcel && (
              <ViewParcelModal
                parcel={viewParcel}
                onClose={handleCloseViewModal}
                isOpen={isViewModalOpen}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
