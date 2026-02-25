"use client";

import { Country } from "@/types";
import { useEffect, useState } from "react";
import { CountryTable } from "./CountryTable";
import { Database, Filter, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CountryList() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCountries, setTotalCountries] = useState(0);
  const limit = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  // const [refreshTrigger, setRefreshTrigger] = useState(0); // For future edit functionality

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const queryString = params.toString();
        console.log("API call with params:", queryString);

        const res = await fetch(
          `http://localhost:5001/api/v1/country?${queryString}`,
          {
            cache: "no-store",
          },
        );
        const { data, pagination } = await res.json();
        console.log("API response data:", data);
        console.log("Number of countries returned:", data?.length || 0);

        setCountries(data || []);
        setTotalPages(pagination?.totalPages || 1);
        setTotalCountries(pagination?.total || 0);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [currentPage, searchTerm]);

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

  const handleEditCountry = (country: Country) => {
    // TODO: Implement edit functionality
    console.log("Edit country:", country);
  };

  const handleViewCountry = (country: Country) => {
    // TODO: Implement view functionality
    console.log("View country:", country);
  };

  const handleDeleteCountry = (country: Country) => {
    // TODO: Implement delete functionality
    console.log("Delete country:", country);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-3">
              <Database className="w-4 h-4 text-white animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading countries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-3 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-1 shadow-md">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            Countries
          </h1>
          <p className="text-gray-500 text-xs">
            Manage countries ({totalCountries} total)
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                • Filtered by: &quot;{searchTerm}&quot;
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
                  <Globe className="w-3.5 h-3.5" />
                  Search Countries
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search by name or code..."
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

        {/* Country Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <CountryTable
              data={countries}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditCountry}
              onView={handleViewCountry}
              onDelete={handleDeleteCountry}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
