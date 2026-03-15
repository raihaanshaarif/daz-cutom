"use client";

import { Buyer } from "@/types";
import { useEffect, useState } from "react";
import { BuyerTable } from "./BuyerTable";
import { Database, Filter, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";

export default function BuyerList() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBuyers, setTotalBuyers] = useState(0);
  const limit = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Access User from session for API calls
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";
  console.log(userId, userRole);

  useEffect(() => {
    if (!userId || !userRole) return; // Wait for session to load
    const fetchBuyers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`,
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

        // Check if response is an array or object with data
        let data = [];
        let pagination = null;

        if (Array.isArray(responseData)) {
          data = responseData;
          // For array response, assume all data is returned, no pagination
          pagination = {
            totalPages: 1,
            total: responseData.length,
          };
        } else {
          data = responseData.data || [];
          pagination = responseData.pagination;
        }

        console.log("Number of buyers returned:", data?.length || 0);

        setBuyers(data);
        setTotalPages(pagination?.totalPages || 1);
        setTotalBuyers(pagination?.total || data.length);
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, [userId, userRole]);

  // Filter buyers based on search term
  const filteredBuyers = buyers.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
    setLoading(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setLoading(true);
  };

  const handleEditBuyer = (buyer: Buyer) => {
    // TODO: Implement edit functionality
    console.log("Edit buyer:", buyer);
  };

  const handleViewBuyer = (buyer: Buyer) => {
    // TODO: Implement view functionality
    console.log("View buyer:", buyer);
  };

  const handleDeleteBuyer = (buyer: Buyer) => {
    // TODO: Implement delete functionality
    console.log("Delete buyer:", buyer);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-3">
              <Database className="w-4 h-4 text-white animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading buyers...</p>
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
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            Buyers
          </h1>
          <p className="text-gray-500 text-xs">
            Manage buyers ({totalBuyers} total)
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                • Showing {filteredBuyers.length} filtered results
              </span>
            )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Search Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Search Buyers
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search by name or brand..."
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

        {/* Buyer Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <BuyerTable
              data={filteredBuyers}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditBuyer}
              onView={handleViewBuyer}
              onDelete={handleDeleteBuyer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
