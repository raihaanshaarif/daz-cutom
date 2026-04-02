"use client";

import { Country } from "@/types";
import { useEffect, useState } from "react";
import { CountryTable } from "./CountryTable";
import { Database, Filter, Globe, X, Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CountryList() {
  const { authFetch } = useAuthFetch();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCountries, setTotalCountries] = useState(0);
  const limit = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

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

        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/country?${queryString}`,
          {
            cache: "no-store",
          },
        );
        const { data, pagination } = await res.json();

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
  }, [currentPage, searchTerm, authFetch]);

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

  if (loading && countries.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-8 px-4">
        <div className="max-w-[1200px] mx-auto space-y-6">
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
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Countries
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400">
                Manage countries · {totalCountries} records
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
              onClick={() => router.push("/dashboard/country/create-country")}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Country
            </Button>
          </div>
        </div>

        <div className="space-y-8">
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

          {showFilters && (
            <div className="flex flex-wrap items-end gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-72 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Search
                </Label>
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name or code"
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm"
                />
              </div>

              <div className="ml-auto space-y-2 min-w-[140px]">
                <div className="h-4" />
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-100/80">
                  <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    {countries.length} / {totalCountries} Records
                  </span>
                </div>
              </div>
            </div>
          )}

          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/60 dark:shadow-none rounded-[32px] bg-white dark:bg-zinc-900 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
            <CardHeader className="pb-4 pt-8 px-8 border-b border-zinc-50 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Country Directory
                  </CardTitle>
                  <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                    Browse and manage countries
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <CountryTable
                data={countries}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onEdit={handleEditCountry}
                onView={handleViewCountry}
                onDelete={handleDeleteCountry}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
