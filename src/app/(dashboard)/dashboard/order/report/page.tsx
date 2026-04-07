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
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  DollarSign,
  Package,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Users,
  Building2,
  ShipWheel,
} from "lucide-react";
import { useState, useEffect } from "react";
import { OrderTable } from "@/components/modules/Order/OrderTable";
import { Order, OrderItem, Buyer, Factory } from "@/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export default function OrderReportPage() {
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedFactory, setSelectedFactory] = useState<string>("all");
  const [selectedShippedStatus, setSelectedShippedStatus] =
    useState<string>("all");

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalValue: 0,
    totalCommission: 0,
  });

  const { authFetch } = useAuthFetch();

  // Fetch buyers and factories for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [buyersRes, factoriesRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`),
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
  }, [authFetch]);

  // Fetch orders based on filters
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedBuyer !== "all") params.append("buyerId", selectedBuyer);
        if (selectedFactory !== "all")
          params.append("factoryId", selectedFactory);
        if (selectedShippedStatus !== "all") {
          params.append(
            "isShipped",
            selectedShippedStatus === "shipped" ? "true" : "false",
          );
        }

        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/orders?${params.toString()}`,
        );
        const { data } = await res.json();
        const ordersData = data || [];

        // Map to OrderItem format for table
        const mappedItems: OrderItem[] = ordersData.map((order: Order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          shipDate: order.shipDate,
          productName: order.style || order.orderNumber || `Order #${order.id}`,
          department: order.dept,
          style: order.style,
          color: order.color,
          lot: order.lot,
          quantity: order.quantity,
          unitPrice: order.price,
          totalPrice: order.totalPrice,
          factoryPrice: order.factoryUnitPrice,
          totalFactoryPrice: order.totalFactoryPrice,
          dazCommission: order.dazCommission,
          finalDazCommission: order.finalDazCommission,
          paymentTerm: order.paymentTerm,
          buyerName: order.buyer?.name,
          factoryName: order.factory?.name,
          yarnBooking: order.yarnBooking ?? null,
          labYarn: order.labdipYarndip ?? null,
          printStrikeoff: order.printStrikeOff ?? null,
          pp: order.ppSample ?? null,
          bulkFab: order.bulkFabric ?? null,
          cutting: order.cutting ?? null,
          printing: order.printing ?? null,
          swing: order.swing ?? null,
          finishing: order.finishing ?? null,
          shipmentSample: order.shipmentSample ?? null,
          inspection: order.inspection ?? null,
          exfactory: order.exFactory ?? null,
          overallRemarks: order.overallRemarks,
          isShipped: order.isShipped,
        }));
        setOrderItems(mappedItems);

        // Calculate metrics
        const totalOrders = ordersData.length;
        const totalValue = ordersData.reduce(
          (sum: number, order: Order) => sum + (order.totalPrice || 0),
          0,
        );
        const totalCommission = ordersData.reduce(
          (sum: number, order: Order) => sum + (order.dazCommission || 0),
          0,
        );

        setMetrics({
          totalOrders,
          totalValue,
          totalCommission,
        });
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedBuyer, selectedFactory, selectedShippedStatus, authFetch]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Order Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Performance overview for procurement operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />
            View Insights
          </Button>
          <Button className="h-10 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 shadow-md transition-all hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mr-2">
              <Filter className="h-4 w-4" />
              Quick Filters:
            </div>

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-none h-11 focus:ring-1 focus:ring-blue-500 transition-all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Buyer" />
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

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Select
                value={selectedFactory}
                onValueChange={setSelectedFactory}
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-none h-11 focus:ring-1 focus:ring-blue-500 transition-all">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Factory" />
                  </div>
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
            </div>

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Select
                value={selectedShippedStatus}
                onValueChange={setSelectedShippedStatus}
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-none h-11 focus:ring-1 focus:ring-blue-500 transition-all">
                  <div className="flex items-center gap-2">
                    <ShipWheel className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Shipping status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shipping Status</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              className="ml-auto text-slate-500 hover:text-red-500"
              onClick={() => {
                setSelectedBuyer("all");
                setSelectedFactory("all");
                setSelectedShippedStatus("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
              Order Volume
              <Package className="h-5 w-5 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {metrics.totalOrders}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none font-medium text-[10px]"
                >
                  Active Shipments
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
              Gross Value
              <DollarSign className="h-5 w-5 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                $
                {metrics.totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-medium text-[10px]"
                >
                  +4.2% from last month
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
              Net Commission
              <TrendingUp className="h-5 w-5 text-purple-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                $
                {metrics.totalCommission.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none font-medium text-[10px]"
                >
                  Proj. Revenue
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-950/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <CardTitle className="text-lg">Detailed Order List</CardTitle>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-tight font-medium">
              Synchronized with inventory system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter"
            >
              {orderItems.length} Records Found
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-sm font-medium text-slate-400 animate-pulse">
                Filtering relevant data...
              </p>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-600">
                No matches found
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting your filters to broaden the search
              </p>
              <Button
                variant="link"
                className="mt-4 text-blue-500"
                onClick={() => {
                  setSelectedBuyer("all");
                  setSelectedFactory("all");
                  setSelectedShippedStatus("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <OrderTable data={orderItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
