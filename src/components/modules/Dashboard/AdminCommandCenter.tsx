/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Package,
  Users,
  Truck,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  CheckCircle2,
  MoreVertical,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Loading from "@/components/ui/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrderDetails from "../Order/OrderDetails";
import { useRouter } from "next/navigation";

// Types mapping to your attached folder structures
import { Order, Commercial, Contact, User, Task } from "@/types";

/**
 * HELPER FUNCTIONS FOR SHIPMENT LOGIC
 * These functions factor out common shipment filtering patterns
 * to reduce code duplication and improve maintainability
 */

/**
 * Helper function to normalize dates to UTC midnight for accurate date-only comparison
 * @param date - Date to normalize
 * @returns Date object set to UTC midnight
 */
const getNormalizedDateUTC = (date: Date | string): Date => {
  const d = new Date(date);
  // Convert to UTC and set time to midnight
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

/**
 * Calculate failed (overdue) shipments
 * Returns orders whose shipDate has passed, not shipped yet, and haven't been handed over
 * @param allOrders - Array of all orders
 * @param now - Current date reference
 * @returns Array of failed shipments sorted by date
 */
const calculateFailedShipments = (
  allOrders: ExtendedOrder[],
  now: Date,
): ExtendedOrder[] => {
  // Normalize current date to UTC midnight for proper comparison
  const todayUTC = getNormalizedDateUTC(now);

  return allOrders
    .filter((o) => {
      // Must have a shipDate to be considered overdue
      if (!o.shipDate) return false;

      // Normalize shipDate to UTC midnight for accurate comparison
      const shipDateUTC = getNormalizedDateUTC(o.shipDate);

      // Check if shipment date has passed (shipDate < today)
      const isLate = shipDateUTC < todayUTC;
      // Check if order has NOT been shipped yet
      const isNotShipped = !o.isShipped;
      // Check if order has been handed over: any commercialOrder with a handoverDate exists
      const isHandedOver =
        o.commercialOrders &&
        o.commercialOrders.some(
          (co) => co.commercial && co.commercial.handoverDate,
        );

      // Include only orders that are: late, not shipped, and NOT handed over
      return isLate && isNotShipped && !isHandedOver;
    })
    .sort(
      (a, b) =>
        new Date(a.shipDate!).getTime() - new Date(b.shipDate!).getTime(),
    );
};

/**
 * Calculate upcoming shipments for forecasting
 * Returns orders whose shipDate is within the next 30 days, not shipped yet, and not handed over
 * @param allOrders - Array of all orders
 * @param now - Current date reference
 * @returns Array of upcoming shipments sorted by date
 */
const calculateUpcomingShipments = (
  allOrders: ExtendedOrder[],
  now: Date,
): ExtendedOrder[] => {
  // Normalize current date to UTC midnight
  const todayUTC = getNormalizedDateUTC(now);

  // Calculate 30 days from now - defines the forecasting window
  const thirtyDaysFromNowUTC = new Date(
    todayUTC.getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  return allOrders
    .filter((o) => {
      // Must have a shipDate to be scheduled for shipment
      if (!o.shipDate) return false;

      // Normalize shipDate to UTC midnight for accurate comparison
      const shipDateUTC = getNormalizedDateUTC(o.shipDate);

      // Check if shipment date is today or in the future (shipDate >= today)
      const isFuture = shipDateUTC >= todayUTC;
      // Check if shipment date is within 30 days window
      const withinWindow = shipDateUTC <= thirtyDaysFromNowUTC;
      // Check if order has NOT been shipped yet
      const isNotShipped = !o.isShipped;
      // Check if order has been handed over: any commercialOrder with a handoverDate exists
      const isHandedOver =
        o.commercialOrders &&
        o.commercialOrders.some(
          (co) => co.commercial && co.commercial.handoverDate,
        );

      // Include orders scheduled for upcoming period that are: in 30-day window, not shipped and NOT handed over
      return isFuture && withinWindow && isNotShipped && !isHandedOver;
    })
    .sort(
      (a, b) =>
        new Date(a.shipDate!).getTime() - new Date(b.shipDate!).getTime(),
    );
};

interface ExtendedOrder extends Order {
  commercialOrders?: any[];
}

interface UserWithTasks extends User {
  tasks?: Task[];
}

interface DashboardStats {
  orders: {
    totalQuantity: number;
    totalValue: number;
    avgOrderValue: number;
    monthlyTrend: number; // percentage
    failedShipments: ExtendedOrder[];
    upcomingShipments: ExtendedOrder[];
    receivedThisMonth: number;
  };
  commercial: {
    invoicesThisMonth: number;
    totalLAC: number;
    pendingLAC: number;
    receivedLAC: number;
    upcomingCommissions: Commercial[];
    shippedInvoiceCount: number;
  };
  pipeline: {
    totalLeads: number;
    conversionRate: number;
    hotLeads: Contact[];
    todayLeads: number;
    wonLeads: number;
  };
  users: {
    activeCount: number;
    userPerformance: {
      user: UserWithTasks;
      totalContacts: number;
      todayContacts: number;
      closedWon: number;
      activeTasks: number;
    }[];
  };
}

import { useAuthFetch } from "@/hooks/use-auth-fetch";

const AdminCommandCenter = () => {
  // --- Initialization & State ---
  const { authFetch, isLoading: isAuthLoading } = useAuthFetch();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeframe, setTimeframe] = useState("month");
  const router = useRouter();

  // Modal states
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    // Wait for authentication to complete before fetching data
    if (isAuthLoading) {
      return;
    }

    /**
     * MAIN DATA AGGREGATION ENGINE
     * Fetches raw data from all core modules and transforms them into
     * strategic dashboard intelligence.
     */
    const fetchFullIntelligence = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
        const now = new Date();
        const todayStr = now.toDateString();

        // 1. Calculate Date Ranges (Start/End) based on selected timeframe
        let startDate: Date;
        const endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
        );

        if (timeframe === "week") {
          startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (timeframe === "year") {
          startDate = new Date(now.getFullYear(), 0, 1);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // 2. Fetch all required datasets in parallel
        const [ordersRes, commercialRes, contactsRes, usersRes] =
          await Promise.all([
            authFetch(`${baseUrl}/order/orders?limit=2000`).then((r) =>
              r.json(),
            ),
            authFetch(
              `${baseUrl}/commercial?limit=2000&include=orders.order.buyer,orders.order.factory`,
            ).then((r) => r.json()),
            authFetch(`${baseUrl}/contact?limit=2000`).then((r) => r.json()),
            authFetch(`${baseUrl}/user`).then((r) => r.json()),
          ]);

        const allOrders: ExtendedOrder[] = ordersRes.data || [];
        const allCommercials: Commercial[] = commercialRes.data || [];
        const allContacts: Contact[] = contactsRes.data || [];
        const userList: UserWithTasks[] = usersRes?.data || [];

        // Apply role-based filtering for orders
        // ADMIN, SUPER_ADMIN, and COMMERCIAL can see all orders
        // MERCHANDISER and USER can only see orders for their assigned buyers
        let filteredOrders = allOrders;
        const userRole = session?.user?.role;
        if (
          userRole !== "ADMIN" &&
          userRole !== "SUPER_ADMIN" &&
          userRole !== "COMMERCIAL"
        ) {
          const assignedBuyerIds =
            session?.user?.assignedBuyers?.map((buyer: any) => buyer.id) || [];
          if (assignedBuyerIds.length === 0) {
            filteredOrders = [];
          } else {
            filteredOrders = allOrders.filter(
              (order: ExtendedOrder) =>
                order.buyerId && assignedBuyerIds.includes(order.buyerId),
            );
          }
        }

        // Apply role-based filtering for commercials
        // ADMIN, SUPER_ADMIN, and COMMERCIAL can see all commercials
        // MERCHANDISER and USER can only see commercials for their assigned buyers' orders
        let filteredCommercials = allCommercials;
        if (
          userRole !== "ADMIN" &&
          userRole !== "SUPER_ADMIN" &&
          userRole !== "COMMERCIAL"
        ) {
          const assignedBuyerIds =
            session?.user?.assignedBuyers?.map((buyer: any) => buyer.id) || [];
          if (assignedBuyerIds.length === 0) {
            filteredCommercials = [];
          } else {
            filteredCommercials = allCommercials.filter(
              (commercial: Commercial) => {
                const orders = commercial.orders;
                const buyerId = orders?.find((o: any) => o.order?.buyer?.id)
                  ?.order?.buyer?.id;
                return buyerId && assignedBuyerIds.includes(buyerId);
              },
            );
          }
        }

        // 3. Enrich Users with Tasks for Performance Tracking (single batch call)
        const userIds = userList.map((u) => u.id).join(",");
        if (!userIds) {
          userList.forEach((u) => (u.tasks = []));
        } else {
          const batchTaskRes = await authFetch(
            `${baseUrl}/task/batch?userIds=${userIds}`,
          ).then((r) => r.json());
          userList.forEach((u) => {
            const userTasks = batchTaskRes[u.id];
            u.tasks = userTasks || [];
          });
        }

        // 4. Calculate User Performance Metrics (Leads & Tasks)
        const userPerformance = userList.map((u) => {
          const uContacts = allContacts.filter((c) => c.authorId === u.id);
          return {
            user: u,
            totalContacts: uContacts.length,
            todayContacts: uContacts.filter(
              (c) => new Date(c.createdAt).toDateString() === todayStr,
            ).length,
            closedWon: uContacts.filter((c) => c.status === "CLOSED_WON")
              .length,
            activeTasks: (u.tasks || []).filter((t) => t.isActive).length,
          };
        });

        // 5. Order Logic: Filter for current timeframe
        const timeframeOrders = filteredOrders.filter((o) => {
          const d = new Date(o.createdAt);
          return d >= startDate && d <= endDate;
        });

        // Calculate failed shipments (overdue) and upcoming shipments using factored helper functions
        // This reduces code duplication and makes shipment calculations reusable
        const failedShipments = calculateFailedShipments(filteredOrders, now);
        const upcomingShipments = calculateUpcomingShipments(
          filteredOrders,
          now,
        );

        // 6. Commercial Logic: Calculate LAC (Commission) & Shipped Status
        const timeframeInvoices = filteredCommercials.filter((c) => {
          const d = new Date(c.createdAt || (c as any).etd);
          return d >= startDate && d <= endDate;
        });

        const shippedInvoices = filteredCommercials.filter((c) => {
          if (!c.etd) return false;
          const etdDate = new Date(c.etd);
          return etdDate >= startDate && etdDate <= endDate;
        });

        // 7. Commission Forecasting Logic
        const upcomingCommissions = allCommercials.filter(
          (c) =>
            c.paymentStatus === "PENDING" ||
            (c.paymentStatus === "PARTIALLY_PAID" &&
              c.approximatePaymentDate &&
              new Date(c.approximatePaymentDate as any) >= now),
        );

        const combinedForecast = upcomingCommissions
          .sort((a, b) => {
            const dateA = a.approximatePaymentDate
              ? new Date(a.approximatePaymentDate).getTime()
              : a.etd
                ? new Date(a.etd as any).getTime()
                : Infinity; // Put items without dates at the end
            const dateB = b.approximatePaymentDate
              ? new Date(b.approximatePaymentDate).getTime()
              : b.etd
                ? new Date(b.etd as any).getTime()
                : Infinity;
            return dateA - dateB;
          })
          .slice(0, 15);

        const totalPendingLAC = timeframeInvoices
          .filter(
            (c) =>
              c.paymentStatus === "PENDING" ||
              c.paymentStatus === "PARTIALLY_PAID",
          )
          .reduce((s, c) => s + (c.lacAmount || 0), 0);

        const totalPaidLAC = timeframeInvoices
          .filter((c) => c.paymentStatus === "PAID")
          .reduce((s, c) => s + (c.lacAmount || 0), 0);

        // 7. Pipeline Logic: Filter Hot Leads & Conversion Status
        const timeframeContacts = allContacts.filter((c) => {
          const d = new Date(c.createdAt);
          return d >= startDate && d <= endDate;
        });

        // 8. Commit to State
        const totalVal = timeframeOrders.reduce(
          (s, o) => s + (o.totalPrice || 0),
          0,
        );

        setStats({
          orders: {
            totalQuantity: timeframeOrders.reduce(
              (s, o) => s + (o.quantity || 0),
              0,
            ),
            totalValue: totalVal,
            avgOrderValue:
              timeframeOrders.length > 0
                ? totalVal / timeframeOrders.length
                : 0,
            monthlyTrend: 12.5,
            failedShipments: failedShipments.slice(0, 10),
            upcomingShipments: upcomingShipments.slice(0, 10),
            receivedThisMonth: timeframeOrders.length,
          },
          commercial: {
            invoicesThisMonth: timeframeInvoices.filter(
              (c) => c.paymentStatus !== "PAID",
            ).length,
            totalLAC: totalPendingLAC,
            pendingLAC: totalPendingLAC,
            receivedLAC: totalPaidLAC,
            shippedInvoiceCount: shippedInvoices.length,
            upcomingCommissions: combinedForecast, // Updated forecasting logic
          },
          pipeline: {
            totalLeads: timeframeContacts.length,
            conversionRate:
              timeframeContacts.length > 0
                ? (timeframeContacts.filter((c) => c.status === "CLOSED_WON")
                    .length /
                    timeframeContacts.length) *
                  100
                : 0,
            hotLeads: allContacts
              .filter(
                (c) =>
                  (c.status as string) === "PRICE_NEGOTIATION" ||
                  (c.status as string) === "QUALIFIED",
              )
              .slice(0, 5),
            todayLeads: allContacts.filter(
              (c) => new Date(c.createdAt).toDateString() === todayStr,
            ).length,
            wonLeads: allContacts.filter((c) => c.status === "CLOSED_WON")
              .length,
          },
          users: {
            activeCount: userList.filter((u) => u.status === "ACTIVE").length,
            userPerformance: userPerformance.sort(
              (a, b) => b.totalContacts - a.totalContacts,
            ),
          },
        });
      } catch (error) {
        console.error("Dashboard Intelligence fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullIntelligence();
  }, [
    timeframe,
    authFetch,
    isAuthLoading,
    session?.user?.role,
    session?.user?.assignedBuyers,
  ]);

  if (loading || !stats) return <Loading />;

  const formatUSD = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 bg-[#f8fafc]/50 min-h-screen">
      {/* GLOBAL HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-600" />
            Central Admin Dashboard
          </h1>
          <p className="text-slate-500 font-medium">
            Enterprise Intelligence System •{" "}
            {formatDate(new Date().toISOString())}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
          <button
            onClick={() => router.push("/dashboard/admin-expression-dashboard")}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:bg-slate-50 transition-all border-r pr-4 mr-2"
          >
            Detailed Analytics
          </button>
          {["week", "month", "year"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                timeframe === t
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* PRIMARY KPI LAYER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard
          label="Order Intake"
          value={formatUSD(stats.orders.totalValue)}
          subValue={`${stats.orders.totalQuantity.toLocaleString()} Units`}
          icon={<Package className="text-blue-600" />}
          trend={12}
          color="blue"
        />
        <KpiCard
          label="Shipment Completed"
          value={stats.commercial.shippedInvoiceCount.toLocaleString()}
          subValue="Invoices Shipped by ETD"
          icon={<Truck className="text-purple-600" />}
          trend={15}
          color="purple"
        />
        <KpiCard
          label="LAC Pipeline"
          value={formatUSD(stats.commercial.totalLAC)}
          subValue={`${stats.commercial.invoicesThisMonth} Invoices`}
          icon={<DollarSign className="text-emerald-600" />}
          trend={8}
          color="emerald"
        />
        <KpiCard
          label="LAC Received"
          value={formatUSD(stats.commercial.receivedLAC)}
          subValue={`${stats.commercial.invoicesThisMonth} Invoices`}
          icon={<CheckCircle2 className="text-emerald-600" />}
          trend={10}
          color="emerald"
        />
        <KpiCard
          label="Contact Created"
          value={stats.pipeline.totalLeads.toLocaleString()}
          subValue={`${stats.pipeline.conversionRate.toFixed(1)}% Conv. Rate`}
          icon={<Users className="text-orange-600" />}
          trend={5}
          color="orange"
        />
      </div>

      {/* INTELLIGENCE GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CRITICAL ALERTS & FAILED SHIPMENTS */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  Overdue Shipment
                </CardTitle>
                <CardDescription>
                  Orders that missed their target shipment date
                </CardDescription>
              </div>
              <Badge variant="destructive" className="animate-pulse">
                {stats.orders.failedShipments.length} Critical
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-xs">ORDER #</TableHead>
                    <TableHead className="font-bold text-xs">BUYER</TableHead>
                    <TableHead className="font-bold text-xs">
                      TARGET DATE
                    </TableHead>
                    <TableHead className="font-bold text-xs text-right">
                      VALUE
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.orders.failedShipments.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-rose-50/30 transition-colors group"
                    >
                      <TableCell className="font-mono text-xs font-bold">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {order.buyer?.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-rose-600 font-bold">
                          {formatDate(order.shipDate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs">
                        {formatUSD(order.totalPrice || 0)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setViewingOrder(order);
                                setIsViewModalOpen(true);
                              }}
                            >
                              View Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* UPCOMING SHIPMENT FORECAST - Next 30 Days */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-500" />
                  Upcoming Shipment
                </CardTitle>
                <CardDescription>
                  Orders scheduled for shipment in the next 30 days
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {stats.orders.upcomingShipments.length} Forecast
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {/* Empty state message when no upcoming shipments */}
              {stats.orders.upcomingShipments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium">No upcoming shipments</p>
                  <p className="text-xs text-slate-400">
                    All scheduled orders are either completed or beyond 30 days
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-xs">
                        ORDER #
                      </TableHead>
                      <TableHead className="font-bold text-xs">BUYER</TableHead>
                      <TableHead className="font-bold text-xs">
                        SHIP DATE
                      </TableHead>
                      <TableHead className="font-bold text-xs">
                        DAYS TO SHIP
                      </TableHead>
                      <TableHead className="font-bold text-xs text-right">
                        VALUE
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.orders.upcomingShipments.map((order) => {
                      // Calculate days until shipment for better forecasting visibility
                      const daysToShip = order.shipDate
                        ? Math.ceil(
                            (new Date(order.shipDate).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24),
                          )
                        : 0;

                      return (
                        <TableRow
                          key={order.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <TableCell className="font-mono text-xs font-bold">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {order.buyer?.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="text-blue-600 font-bold">
                              {formatDate(order.shipDate)}
                            </span>
                          </TableCell>
                          {/* Days to ship badge with color coding for prioritization */}
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className={
                                daysToShip <= 7
                                  ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                                  : daysToShip <= 14
                                    ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                              }
                            >
                              {daysToShip}d
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs">
                            {formatUSD(order.totalPrice || 0)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setViewingOrder(order);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  View Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* COMMISSION FORECAST */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-900">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  LAC Commission Forecast
                </CardTitle>
                <CardDescription>
                  Estimated payouts based on commercial handover
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Expected Inflow
                </p>
                <p className="text-xl font-black text-indigo-600">
                  {formatUSD(stats.commercial.pendingLAC)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-6 space-y-6">
                  {stats.commercial.upcomingCommissions.map((comm, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden group hover:border-indigo-200 hover:bg-white transition-all"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-8 -mt-8 group-hover:bg-indigo-100/50 transition-colors" />
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border font-black text-indigo-600 text-[10px] text-center leading-tight">
                        {formatDate(
                          (comm.approximatePaymentDate || comm.etd) as any,
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              {comm.invoiceNo}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {comm.orders?.[0]?.order?.buyer?.name ||
                                (comm as any).order?.buyer?.name ||
                                "Multiple Buyers"}{" "}
                              •{" "}
                              {comm.orders?.[0]?.order?.factory?.name ||
                                (comm as any).order?.factory?.name ||
                                "Direct Factory"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-600 block">
                              {formatUSD(comm.lacAmount || 0)}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 h-4 border-none ${
                                comm.paymentStatus === "PARTIALLY_PAID"
                                  ? "bg-blue-100 text-blue-700 font-bold"
                                  : comm.paymentStatus === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700 font-bold"
                                    : comm.paymentStatus === "PAID"
                                      ? "bg-green-100 text-green-700 font-bold"
                                      : comm.paymentStatus === "SURRENDERED"
                                        ? "bg-gray-100 text-gray-700 font-bold"
                                        : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {comm.paymentStatus
                                .replace("_", " ")
                                .toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-400" />{" "}
                            ETD:{" "}
                            {comm.etd
                              ? new Date(comm.etd as any).toLocaleDateString()
                              : "TBD"}
                          </span>
                          {(comm.approximatePaymentDate || comm.etd) && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-400" /> Pay
                              Date:{" "}
                              {new Date(
                                (comm.approximatePaymentDate ||
                                  comm.etd) as any,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: CONTACT PIPELINE INTELLIGENCE */}
        <div className="space-y-8">
          <Card className="bg-slate-900 border-none text-white overflow-hidden relative min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Pipeline Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Conversion Goal</span>
                  <span>{stats.pipeline.conversionRate.toFixed(1)}%</span>
                </div>
                <Progress
                  value={stats.pipeline.conversionRate}
                  className="h-2 bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Today&apos;s Leads
                  </p>
                  <p className="text-lg font-black text-orange-400">
                    {stats.pipeline.todayLeads}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Total Won
                  </p>
                  <p className="text-lg font-black text-emerald-400">
                    {stats.pipeline.wonLeads}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <h5 className="text-xs font-bold text-slate-400 uppercase mb-4">
                  Top Team Members (leads)
                </h5>
                <div className="space-y-4">
                  {stats.users.userPerformance.slice(0, 5).map((perf, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] uppercase">
                            {perf.user.name.charAt(0)}
                          </div>
                          <span className="font-bold">{perf.user.name}</span>
                        </div>
                        <span className="text-slate-500">
                          {perf.totalContacts} Total
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {perf.closedWon} Won
                        </div>
                        <div className="flex items-center gap-1 text-orange-400">
                          <TrendingUp className="w-3 h-3" />
                          {perf.todayContacts} Today
                        </div>
                      </div>
                      <Progress
                        value={
                          (perf.closedWon / (perf.totalContacts || 1)) * 100
                        }
                        className="h-1 bg-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h5 className="text-xs font-bold text-slate-400 uppercase mb-4">
                  High-Value Targets (Hot)
                </h5>
                <div className="space-y-3">
                  {stats.pipeline.hotLeads.map((contact, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold truncate max-w-[120px]">
                            {contact.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {contact.company || "Private Entity"}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-600/20 text-blue-400 border-none hover:bg-blue-600/30 text-[9px]">
                        NEGOTIATING
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LOGISTICS SNAPSHOT */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" /> Logistics Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold">
                      Shipped This Month
                    </span>
                  </div>
                  <span className="text-xs font-black">
                    {stats.commercial.invoicesThisMonth}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold">Delivery Backlog</span>
                  </div>
                  <span className="text-xs font-black">
                    {stats.orders.failedShipments.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <OrderDetails
              order={viewingOrder}
              onClose={() => {
                setIsViewModalOpen(false);
                setViewingOrder(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// HELPER COMPONENTS

const KpiCard = ({ label, value, subValue, icon, trend, color }: any) => {
  const isPositive = trend > 0;

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden relative group transition-all hover:-translate-y-1">
      <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-600`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors border">
            {icon}
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {value}
          </h3>
          <p className="text-xs font-medium text-slate-500 pt-2 flex items-center gap-1">
            {subValue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCommandCenter;
