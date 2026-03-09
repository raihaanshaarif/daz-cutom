"use client";

import { Order, Buyer, Factory, OrderItem } from "@/types";
import { useEffect, useState, useRef } from "react";
import { OrderTable } from "./OrderTable";
import EditOrderForm from "./EditOrderForm";
import OrderDetails from "./OrderDetails";
import { Package, Filter, User, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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

  // Modal states
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Data for filters
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);

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
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/order/orders?${params.toString()}`,
            { cache: "no-store" },
          ),
          buyers.length === 0
            ? fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`)
            : null,
          factories.length === 0
            ? fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`)
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
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-3 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-1 shadow-md">
            <Package className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            Orders
          </h1>
          <p className="text-gray-500 text-xs">
            Manage orders ({totalOrders} total)
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                • Filtered by: &quot;{searchTerm}&quot;
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        {/* <div className="mb-4">
          <OrderStats />
        </div> */}

        {/* Filters */}
        <div className="mb-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <Filter className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-xs font-medium text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Search Orders
                </Label>
                <Input
                  type="text"
                  placeholder="Search by order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* Commission Status Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Commission Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="h-7 text-xs border-gray-200">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buyer Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Buyer
                </Label>
                <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                  <SelectTrigger className="h-7 text-xs border-gray-200">
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

              {/* Factory Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Factory
                </Label>
                <Select
                  value={selectedFactory}
                  onValueChange={setSelectedFactory}
                >
                  <SelectTrigger className="h-7 text-xs border-gray-200">
                    <SelectValue placeholder="All Factories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Factories</SelectItem>
                    {factories.map((factory) => (
                      <SelectItem
                        key={factory.id}
                        value={factory.id.toString()}
                      >
                        {factory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Order Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <OrderTable
              data={orderItems}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditOrder}
              onView={handleViewOrder}
              onDelete={handleDeleteOrder}
            />
          </div>
        </div>

        {/* Edit Order Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
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
