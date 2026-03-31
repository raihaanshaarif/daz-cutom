"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign, FileText, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { CommercialTable } from "@/components/modules/Commercial/CommercialTable";
import { Commercial, Buyer, Factory } from "@/types";

export default function CommercialReportPage() {
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedFactory, setSelectedFactory] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("all");

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalInvoices: 0,
    totalInvoiceValue: 0,
    agentCommission: 0,
  });

  // Fetch buyers and factories for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [buyersRes, factoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`),
        ]);
        const buyersData = await buyersRes.json();
        const factoriesData = await factoriesRes.json();
        setBuyers(Array.isArray(buyersData) ? buyersData : []);
        setFactories(Array.isArray(factoriesData) ? factoriesData : []);
      } catch (err) {
        console.error("Failed to fetch filter data:", err);
      }
    };
    fetchFilterData();
  }, []);

  // Fetch commercials based on filters
  useEffect(() => {
    const fetchCommercials = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("limit", "1000"); // Get all for report
        if (selectedBuyer !== "all") params.append("buyerId", selectedBuyer);
        if (selectedFactory !== "all")
          params.append("factoryId", selectedFactory);
        if (selectedPaymentStatus !== "all") {
          params.append("paymentStatus", selectedPaymentStatus);
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/commercial?${params.toString()}`,
        );
        const response = await res.json();
        const commercialsData = response.data || [];
        setCommercials(commercialsData);

        // Calculate metrics
        const totalInvoices = commercialsData.length;
        const totalInvoiceValue = commercialsData.reduce(
          (sum: number, commercial: Commercial) =>
            sum + (commercial.totalPrice || 0),
          0,
        );
        const agentCommission = commercialsData.reduce(
          (sum: number, commercial: Commercial) =>
            sum + (commercial.lacAmount || 0),
          0,
        );

        setMetrics({
          totalInvoices,
          totalInvoiceValue,
          agentCommission,
        });
      } catch (err) {
        console.error("Failed to fetch commercials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommercials();
  }, [selectedBuyer, selectedFactory, selectedPaymentStatus]);

  return (
    <div className="space-y-6 mx-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commercial Report</h1>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select buyer" />
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
        <Select value={selectedFactory} onValueChange={setSelectedFactory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select factory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Factories</SelectItem>
            {factories.map((factory) => (
              <SelectItem key={factory.id} value={factory.id.toString()}>
                {factory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedPaymentStatus}
          onValueChange={setSelectedPaymentStatus}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.totalInvoices}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Invoice Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              $
              {metrics.totalInvoiceValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Agent Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              $
              {metrics.agentCommission.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commercials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading commercials...
            </div>
          ) : (
            <CommercialTable data={commercials} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
