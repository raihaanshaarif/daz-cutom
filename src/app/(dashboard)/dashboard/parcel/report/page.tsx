"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Package,
  Weight,
  TrendingUp,
  X,
  Calendar,
  Filter,
  Download,
  Users,
  Truck,
  Box,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ParcelTable } from "@/components/modules/Parcel/ParcelTable";
import { Parcel, Buyer, Courier } from "@/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export default function ParcelReportPage() {
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedCourier, setSelectedCourier] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalParcels: 0,
    totalWeight: 0,
    monthlyAverage: 0,
  });

  const { authFetch } = useAuthFetch();

  // Fetch buyers and couriers for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [buyersRes, couriersRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          authFetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies`,
          ),
        ]);
        const buyersData = await buyersRes.json();
        const couriersData = await couriersRes.json();
        setBuyers(
          Array.isArray(buyersData) ? buyersData : buyersData.data || [],
        );
        setCouriers(
          Array.isArray(couriersData) ? couriersData : couriersData.data || [],
        );
      } catch (err) {
        console.error("Failed to fetch filter data:", err);
      }
    };
    fetchFilterData();
  }, [authFetch]);

  // Fetch parcels based on filters
  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("limit", "1000"); // Get all for report
        if (selectedBuyer !== "all") params.append("buyerId", selectedBuyer);
        if (selectedCourier !== "all")
          params.append("courierCompanyId", selectedCourier);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/parcels?${params.toString()}`,
        );
        const response = await res.json();
        const parcelsData = response.data?.data || response.data || [];
        setParcels(parcelsData);

        // Calculate metrics
        const totalParcels = parcelsData.length;
        const totalWeight = parcelsData.reduce(
          (sum: number, parcel: Parcel) => sum + (parcel.weight || 0),
          0,
        );

        // Calculate monthly average based on date range or all-time
        let monthlyAverage = 0;
        if (parcelsData.length > 0) {
          const dates = parcelsData.map((p: Parcel) => new Date(p.createdAt));
          const minDate = new Date(
            Math.min(...dates.map((d: Date) => d.getTime())),
          );
          const maxDate = new Date(
            Math.max(...dates.map((d: Date) => d.getTime())),
          );
          const monthsDiff =
            (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
            (maxDate.getMonth() - minDate.getMonth()) +
            1;
          monthlyAverage = Math.round(totalParcels / Math.max(monthsDiff, 1));
        }

        setMetrics({
          totalParcels,
          totalWeight,
          monthlyAverage,
        });
      } catch (err) {
        console.error("Failed to fetch parcels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, [selectedBuyer, selectedCourier, startDate, endDate, authFetch]);

  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Logistics Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Global parcel distribution and weight management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <BarChart3 className="mr-2 h-4 w-4 text-orange-500" />
            Carrier Performance
          </Button>
          <Button className="h-10 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 shadow-md transition-all hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Export Manifest
          </Button>
        </div>
      </div>

      {/* Advanced Filters Card */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Report Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Client Entity
              </Label>
              <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-none h-11 focus:ring-1 focus:ring-orange-500 transition-all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="All Buyers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyers</SelectItem>
                  {buyers.map((buyer) => (
                    <SelectItem key={buyer.id} value={buyer.id.toString()}>
                      {buyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Courier Service
              </Label>
              <Select
                value={selectedCourier}
                onValueChange={setSelectedCourier}
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-none h-11 focus:ring-1 focus:ring-orange-500 transition-all">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="All Couriers" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Couriers</SelectItem>
                  {couriers.map((courier) => (
                    <SelectItem key={courier.id} value={courier.id.toString()}>
                      {courier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Period From
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-none h-11 pr-10 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Period To
              </Label>
              <div className="relative flex items-center gap-2">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-none h-11 pr-10 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearDateRange}
                    className="h-11 w-11 text-slate-400 hover:text-red-500 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
              Dispatch Count
              <Box className="h-5 w-5 text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {metrics.totalParcels} Pieces
              </span>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-none font-medium text-[10px]"
                >
                  Registered Shipments
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
              Net Weight
              <Weight className="h-5 w-5 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {(metrics.totalWeight / 1000).toFixed(2)} KG
              </span>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none font-medium text-[10px]"
                >
                  {metrics.totalWeight.toLocaleString()} Total Grams
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
              Frequency
              <TrendingUp className="h-5 w-5 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                ~{metrics.monthlyAverage} / mo
              </span>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-medium text-[10px]"
                >
                  Average Parcel Velocity
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parcels Table */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-950/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <CardTitle className="text-lg">Shipment Manifest</CardTitle>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-tight font-medium">
              Logistics chain synchronization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {parcels.length} Records
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              <p className="text-sm font-medium text-slate-400 animate-pulse">
                Syncing tracking data...
              </p>
            </div>
          ) : parcels.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-600">
                No parcels found
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Adjust your parameters or check active courier links
              </p>
              <Button
                variant="link"
                className="mt-4 text-orange-500"
                onClick={() => {
                  setSelectedBuyer("all");
                  setSelectedCourier("all");
                  clearDateRange();
                }}
              >
                Clear parameters
              </Button>
            </div>
          ) : (
            <ParcelTable data={parcels} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
