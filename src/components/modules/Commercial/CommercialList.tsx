"use client";

import { Commercial, Pagination } from "@/types";
import { useEffect, useState } from "react";
import { CommercialTable } from "./CommercialTable";
import { EditCommercialForm } from "./EditCommercialForm";
import { ViewCommercialModal } from "./ViewCommercialModal";
import { Users, Database, Filter, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [allCommercialsCache, setAllCommercialsCache] = useState<Commercial[]>(
    [],
  );
  const [allCommercialsPagination, setAllCommercialsPagination] =
    useState<Pagination | null>(null);

  // Edit modal state
  const [editingCommercial, setEditingCommercial] = useState<Commercial | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // View modal state
  const [viewCommercial, setViewCommercial] = useState<Commercial | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    selectedDate,
    selectedPeriod,
    selectedPaymentStatus,
    selectedDocumentStatus,
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

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedPeriod("all");
    setSelectedPaymentStatus("all");
    setSelectedDocumentStatus("all");
    setCurrentPage(1);

    // Immediately show cached all commercials data if available
    if (allCommercialsCache.length > 0) {
      setCommercials(allCommercialsCache);
      setTotalPages(allCommercialsPagination?.totalPages || 1);
      setTotalCommercials(allCommercialsPagination?.total || 0);
      setLoading(false);
    } else {
      // Fallback to triggering refetch if no cache
      setLoading(true);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-3">
              <Database className="w-4 h-4 text-white animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading your commercials...</p>
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
            <Users className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            My Commercials
          </h1>
          <p className="text-gray-500 text-xs">
            Manage your commercial records ({totalCommercials} total)
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <Filter className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-xs font-medium text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Date Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Booking Date
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    handleFilterChange();
                  }}
                  className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* Period Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Period
                </Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={(value) => {
                    setSelectedPeriod(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  Payment Status
                </Label>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={(value) => {
                    setSelectedPaymentStatus(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Document Status Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  Document Status
                </Label>
                <Select
                  value={selectedDocumentStatus}
                  onValueChange={(value) => {
                    setSelectedDocumentStatus(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="REVISED">Revised</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-1.5 md:col-span-4">
                <Label className="text-xs font-medium text-gray-700 opacity-0">
                  Clear
                </Label>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="h-7 w-full text-xs border-gray-200 hover:border-red-500 hover:text-red-600"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <CommercialTable
              data={commercials}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditCommercial}
              onView={handleViewCommercial}
              onDelete={handleDeleteCommercial}
            />
            <ViewCommercialModal
              commercial={viewCommercial}
              isOpen={isViewModalOpen}
              onClose={handleCloseViewModal}
            />
          </div>
        </div>

        {/* Edit Commercial Modal */}
        <EditCommercialForm
          commercial={editingCommercial}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
}
