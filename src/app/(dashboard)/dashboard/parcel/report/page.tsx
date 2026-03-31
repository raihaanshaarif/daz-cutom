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
import { BarChart3, Package, Weight, TrendingUp, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ParcelTable } from "@/components/modules/Parcel/ParcelTable";
import { Parcel, Buyer, Courier } from "@/types";

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

  // Fetch buyers and couriers for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [buyersRes, couriersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies`),
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
  }, []);

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

        const res = await fetch(
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
  }, [selectedBuyer, selectedCourier, startDate, endDate]);

  const clearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6 mx-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Parcel Report</h1>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="buyer-select" className="mb-2 block text-sm">
                Buyer
              </Label>
              <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                <SelectTrigger id="buyer-select">
                  <SelectValue placeholder="All Buyers" />
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
            <div>
              <Label htmlFor="courier-select" className="mb-2 block text-sm">
                Courier Company
              </Label>
              <Select
                value={selectedCourier}
                onValueChange={setSelectedCourier}
              >
                <SelectTrigger id="courier-select">
                  <SelectValue placeholder="All Couriers" />
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
            <div>
              <Label htmlFor="start-date" className="mb-2 block text-sm">
                From Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="end-date" className="text-sm">
                  To Date
                </Label>
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateRange}
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Total Parcels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.totalParcels}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Weight className="h-4 w-4 text-green-600" />
              Total Weight (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.totalWeight.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Monthly Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {metrics.monthlyAverage}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parcels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parcels</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading parcels...
            </div>
          ) : (
            <ParcelTable data={parcels} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
