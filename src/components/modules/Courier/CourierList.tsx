"use client";

import { Courier } from "@/types";
import { useEffect, useState } from "react";

import { Database, Filter, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CourierTable } from "./CourierTable";
import { ViewCourierModal, EditCourierModal } from "./index";
import { toast } from "sonner";

export default function CourierList() {
  // Demo data for development
  const demoCouriers: Courier[] = [];

  const [couriers, setCouriers] = useState<Courier[]>(demoCouriers);
  const [loading, setLoading] = useState(false); // Start with demo data
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCouriers, setTotalCouriers] = useState(demoCouriers.length);
  const limit = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Access User from session for API calls
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";
  const router = useRouter();

  // Modal states
  const [viewCourier, setViewCourier] = useState<Courier | null>(null);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Extract fetchCouriers as a separate function
  const fetchCouriers = async () => {
    if (!userId || !userRole) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies?${params}`,
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

      // Assuming response has data and pagination
      const data = responseData.data || [];
      const pagination = responseData.pagination;

      console.log("Number of couriers returned:", data?.length || 0);

      setCouriers(data);
      setTotalPages(pagination?.totalPages || 1);
      setTotalCouriers(pagination?.total || data.length);
    } catch (error) {
      console.error("Failed to fetch couriers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, [userId, userRole, currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleCreateCourier = () => {
    router.push("/dashboard/courier/create");
  };

  const handleEditCourier = (courier: Courier) => {
    setEditingCourier(courier);
    setIsEditModalOpen(true);
  };

  const handleViewCourier = (courier: Courier) => {
    setViewCourier(courier);
    setIsViewModalOpen(true);
  };

  const handleDeleteCourier = async (courier: Courier) => {
    if (window.confirm(`Are you sure you want to delete ${courier.name}?`)) {
      try {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies/${courier.id}`,
          {
            method: "DELETE",
            headers: {
              "user-id": userId,
              "user-role": userRole,
            },
          },
        );

        const responseData = await result.json();

        if (result.ok && (responseData?.success || responseData?.data)) {
          toast.success("Courier deleted successfully!");
          // Refresh the list
          fetchCouriers();
        } else {
          toast.error("Failed to delete courier");
        }
      } catch (error) {
        console.error("Failed to delete courier:", error);
        toast.error("An error occurred while deleting the courier");
      }
    }
  };

  const handleEditSuccess = () => {
    // Refetch the couriers list instead of reloading the page
    fetchCouriers();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCourier(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewCourier(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-3">
              <Database className="w-4 h-4 text-white animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading couriers...</p>
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
            <Truck className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            Courier Companies
          </h1>
          <p className="text-gray-500 text-xs">
            Manage courier companies ({totalCouriers} total)
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                • Showing {couriers.length} filtered results
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
              </div>
              <Button
                onClick={handleCreateCourier}
                className="h-7 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs"
              >
                <Truck className="w-3 h-3 mr-1" />
                Add Courier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Search Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  Search Couriers
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  {searchTerm && (
                    <Button
                      onClick={clearSearch}
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
          </div>
        </div>

        {/* Courier Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <CourierTable
              data={couriers}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditCourier}
              onView={handleViewCourier}
              onDelete={handleDeleteCourier}
            />
          </div>
        </div>

        {/* View Courier Modal */}
        <ViewCourierModal
          courier={viewCourier}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
        />

        {/* Edit Courier Modal */}
        <EditCourierModal
          courier={editingCourier}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
}
