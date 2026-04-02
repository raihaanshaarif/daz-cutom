"use client";

import { Order, Buyer, Factory, OrderItem } from "@/types";
import { useEffect, useState, useRef } from "react";
import { OrderTable } from "./OrderTable";
import EditOrderForm from "./EditOrderForm";
import OrderDetails from "./OrderDetails";
import {
  Package,
  Plus,
  ShoppingCart,
  ChevronLeft,
  Filter,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteOrder } from "@/actions/create";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedFactory, setSelectedFactory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  // Modal states
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Data for filters
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);

  const handleCreateOrder = () => {
    router.push("/dashboard/order/create-order");
  };

  const clearAllFilters = () => {
    setSelectedStatus("all");
    setSelectedBuyer("all");
    setSelectedFactory("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Debounce search — only fire fetch after 400 ms of no typing
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchTerm]);

  // Access User from session for API calls
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";
  const { authFetch } = useAuthFetch();
  console.log(userId, userRole);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });
        if (selectedStatus && selectedStatus !== "all")
          params.append("commissionStatus", selectedStatus);
        if (selectedBuyer && selectedBuyer !== "all")
          params.append("buyerId", selectedBuyer);
        if (selectedFactory && selectedFactory !== "all")
          params.append("factoryId", selectedFactory);
        if (debouncedSearch) params.append("search", debouncedSearch);

        // Fetch orders + filter data in parallel
        const [ordersRes, buyersRes, factoriesRes] = await Promise.all([
          authFetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/order/orders?${params.toString()}`,
            {
              cache: "no-store",
            },
          ),
          buyers.length === 0
            ? authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`)
            : null,
          factories.length === 0
            ? authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`)
            : null,
        ]);

        const { data, pagination } = await ordersRes.json();
        if (buyersRes) {
          const b = await buyersRes.json();
          setBuyers(Array.isArray(b) ? b : []);
        }
        if (factoriesRes) {
          const f = await factoriesRes.json();
          setFactories(Array.isArray(f) ? f : []);
        }

        setOrders(data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedItems: OrderItem[] = (data || []).map((order: any) => ({
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
        setTotalPages(pagination?.totalPages || 1);
        setTotalOrders(pagination?.total || 0);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authFetch,
    currentPage,
    selectedStatus,
    selectedBuyer,
    selectedFactory,
    debouncedSearch,
    refreshTrigger,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleEditOrder = (item: OrderItem) => {
    const order = orders.find((o) => o.id === item.id);
    if (order) {
      setEditingOrder(order);
      setIsEditModalOpen(true);
    }
  };

  const handleViewOrder = (item: OrderItem) => {
    const order = orders.find((o) => o.id === item.id);
    if (order) {
      setViewingOrder(order);
      setIsViewModalOpen(true);
    }
  };

  const handleDeleteOrder = async (item: OrderItem) => {
    const order = orders.find((o) => o.id === item.id);
    if (!order) return;
    if (
      confirm(`Are you sure you want to delete order ${order.orderNumber}?`)
    ) {
      try {
        const result = await deleteOrder(order.id);
        if (result?.success || result?.message) {
          toast.success("Order deleted successfully!");
          setRefreshTrigger((prev) => prev + 1);
        } else {
          toast.error("Failed to delete order");
        }
      } catch {
        toast.error("An error occurred while deleting the order");
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrder(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
        <div className="w-full mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-7 flex-1 rounded-lg" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Order List
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage and track order fulfillment across {totalOrders} records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-10 px-4 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Add Order
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Header for Filter Section */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Search
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
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

          {/* Enhanced Filter Bar */}
          {showFilters && (
            <div className="flex flex-wrap items-end gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-48 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-blue-500/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Status
                    </SelectItem>
                    <SelectItem value="PENDING" className="rounded-lg">
                      Not Shipped
                    </SelectItem>
                    <SelectItem value="PAID" className="rounded-lg">
                      Shipped
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-56 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Buyer
                </Label>
                <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all">
                    <SelectValue placeholder="Buyer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Buyers
                    </SelectItem>
                    {buyers.map((buyer) => (
                      <SelectItem
                        key={buyer.id}
                        value={buyer.id.toString()}
                        className="rounded-lg"
                      >
                        {buyer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-56 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Factory
                </Label>
                <Select
                  value={selectedFactory}
                  onValueChange={setSelectedFactory}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all">
                    <SelectValue placeholder="Factory" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Factories
                    </SelectItem>
                    {factories.map((factory) => (
                      <SelectItem
                        key={factory.id}
                        value={factory.id.toString()}
                        className="rounded-lg"
                      >
                        {factory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedStatus !== "all" ||
                selectedBuyer !== "all" ||
                selectedFactory !== "all") && (
                <div className="space-y-2">
                  <div className="h-4" /> {/* Spacer to align with labels */}
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="h-11 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 font-bold px-4 transition-all rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}

              <div className="ml-auto space-y-2 min-w-[140px]">
                <div className="h-4" /> {/* Spacer to align with labels */}
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-100/80">
                  <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    {orders.length} / {totalOrders} Records
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="w-full">
            {/* Main Table Content */}
            <div className="w-full">
              <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/60 dark:shadow-none rounded-[32px] bg-white dark:bg-zinc-900 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
                <CardHeader className="pb-4 pt-8 px-8 border-b border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Order Listings
                      </CardTitle>
                      <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                        Browse and manage all registered procurement records
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-6">
                  <OrderTable
                    data={orderItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onEdit={handleEditOrder}
                    onView={handleViewOrder}
                    onDelete={handleDeleteOrder}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Edit Order Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                Edit Order: {editingOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            {editingOrder && (
              <EditOrderForm
                order={editingOrder}
                onClose={handleCloseEditModal}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* View Order Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
            <DialogHeader className="pb-4 border-b border-zinc-100">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                Order Summary: {viewingOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            {viewingOrder && (
              <OrderDetails
                order={viewingOrder}
                onClose={handleCloseViewModal}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
