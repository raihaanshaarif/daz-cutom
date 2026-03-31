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
import { BarChart3, DollarSign, Package, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { OrderTable } from "@/components/modules/Order/OrderTable";
import { Order, OrderItem, Buyer, Factory } from "@/types";

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

        const res = await fetch(
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
  }, [selectedBuyer, selectedFactory, selectedShippedStatus]);

  return (
    <div className="space-y-6 mx-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Report</h1>
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
          value={selectedShippedStatus}
          onValueChange={setSelectedShippedStatus}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Shipping status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.totalOrders}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              $
              {metrics.totalValue.toLocaleString(undefined, {
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
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              $
              {metrics.totalCommission.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading orders...
            </div>
          ) : orderItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <OrderTable data={orderItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
