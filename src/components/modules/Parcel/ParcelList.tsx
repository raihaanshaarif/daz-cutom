"use client";

import { Parcel, Courier } from "@/types";
import { useEffect, useState, useCallback } from "react";

import { Database, Filter, Package, X, Calendar, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { toast } from "sonner";
import { ViewParcelModal } from "./ViewParcelModal";
import { EditParcelModal } from "./EditParcelModal";

export default function ParcelList() {
  // Demo data for development
  const demoParcels: Parcel[] = [];

  const [parcels, setParcels] = useState<Parcel[]>(demoParcels);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParcels, setTotalParcels] = useState(demoParcels.length);
  const [limit, setLimit] = useState(10);

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies?page=1&limit=100`,
          {
            cache: "no-store",
            headers: {
              "user-id": userId,
              "user-role": userRole,
            },
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
  }, [userId, userRole]);

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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/parcel/parcels?${params}`,
        {
          cache: "no-store",
          headers: {
            "user-id": userId,
            "user-role": userRole,
          },
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
  }, [fetchParcels]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedMonth("");
    setDateFrom("");
    setDateTo("");
    setSelectedCourier("");
    setLimit(10);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedMonth ||
    dateFrom ||
    dateTo ||
    selectedCourier ||
    limit !== 10;

  const handleCreateParcel = () => {
    router.push("/dashboard/parcel/create");
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
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/parcels/${parcel.id}`,
          {
            method: "DELETE",
            headers: {
              "user-id": userId,
              "user-role": userRole,
            },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-3">
              <Database className="w-4 h-4 text-white animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading parcels...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-3 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-1 shadow-md">
            <Package className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            Parcels
          </h1>
          <p className="text-gray-500 text-xs">
            Manage parcels ({totalParcels} total)
            {hasActiveFilters && (
              <span className="ml-2 text-blue-600 font-medium">
                • Showing {parcels.length} filtered results
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <Filter className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-xs font-medium text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
                <Button
                  onClick={handleCreateParcel}
                  className="h-7 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Add Parcel
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {/* Items Per Page Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Items Per Page
                  </Label>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      setLimit(parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5" className="text-xs">
                        5 items
                      </SelectItem>
                      <SelectItem value="10" className="text-xs">
                        10 items
                      </SelectItem>
                      <SelectItem value="25" className="text-xs">
                        25 items
                      </SelectItem>
                      <SelectItem value="50" className="text-xs">
                        50 items
                      </SelectItem>
                      <SelectItem value="100" className="text-xs">
                        100 items
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Search Parcels
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search by tracking number..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    {searchTerm && (
                      <Button
                        onClick={() => setSearchTerm("")}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-gray-200 hover:border-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Month Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Month
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        // Clear date range when month is selected
                        if (e.target.value) {
                          setDateFrom("");
                          setDateTo("");
                        }
                        setCurrentPage(1);
                      }}
                      className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    {selectedMonth && (
                      <Button
                        onClick={() => setSelectedMonth("")}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-gray-200 hover:border-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Courier Company Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Courier Company
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCourier}
                      onValueChange={(value) => {
                        setSelectedCourier(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select courier..." />
                      </SelectTrigger>
                      <SelectContent>
                        {couriers.map((courier) => (
                          <SelectItem
                            key={courier.id}
                            value={courier.id.toString()}
                            className="text-xs"
                          >
                            {courier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCourier && (
                      <Button
                        onClick={() => setSelectedCourier("")}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-gray-200 hover:border-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Date From Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Date From
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        // Clear month filter when date range is used
                        if (e.target.value) {
                          setSelectedMonth("");
                        }
                        setCurrentPage(1);
                      }}
                      className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={!!selectedMonth}
                    />
                    {dateFrom && (
                      <Button
                        onClick={() => setDateFrom("")}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-gray-200 hover:border-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Date To Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Date To
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        // Clear month filter when date range is used
                        if (e.target.value) {
                          setSelectedMonth("");
                        }
                        setCurrentPage(1);
                      }}
                      className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={!!selectedMonth}
                    />
                    {dateTo && (
                      <Button
                        onClick={() => setDateTo("")}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-gray-200 hover:border-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parcel Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <ParcelTable
              data={parcels}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditParcel}
              onView={handleViewParcel}
              onDelete={handleDeleteParcel}
            />
          </div>
        </div>

        {/* View Parcel Modal */}
        <ViewParcelModal
          parcel={viewParcel}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
        />

        {/* Edit Parcel Modal */}
        <EditParcelModal
          parcel={editingParcel}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
}
