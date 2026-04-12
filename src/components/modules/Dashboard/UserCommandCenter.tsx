"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Package,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  BarChart3,
  User as UserIcon,
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Types
import { Order, Commercial, Contact, Task, Buyer } from "@/types";

interface UserDashboardStats {
  orders: {
    myOrders: Order[];
    totalValue: number;
    pendingOrders: number;
    shippedOrders: number;
    recentOrders: Order[];
    overdueShipments: Order[];
    upcomingShipments: Order[];
  };
  commercial: {
    myCommercials: Commercial[];
    pendingInvoices: number;
    totalCommission: number;
    recentCommercials: Commercial[];
  };
  contacts: {
    myContacts: Contact[];
    todayContacts: number;
    weekContacts: number;
    wonContacts: number;
    conversionRate: number;
  };
  tasks: {
    activeTasks: Task[];
    completedToday: number;
    totalTasks: number;
    upcomingDeadlines: Task[];
  };
  buyers: {
    assignedBuyers: Buyer[];
    totalBuyers: number;
  };
}

import { useAuthFetch } from "@/hooks/use-auth-fetch";

const UserCommandCenter = () => {
  const { authFetch, isLoading: isAuthLoading } = useAuthFetch();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const router = useRouter();
  const userId = session?.user?.id;

  useEffect(() => {
    if (isAuthLoading || !userId) return;

    const fetchUserIntelligence = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
        const now = new Date();
        const todayStr = now.toDateString();

        // Calculate date ranges
        const weekStart = new Date(now.setDate(now.getDate() - 7));

        // Fetch all user-specific data in parallel
        const [ordersRes, commercialsRes, contactsRes, tasksRes, userRes] =
          await Promise.all([
            authFetch(`${baseUrl}/order/orders?limit=1000`).then((r) =>
              r.json(),
            ),
            authFetch(`${baseUrl}/commercial?limit=1000`).then((r) => r.json()),
            authFetch(`${baseUrl}/contact?limit=1000`).then((r) => r.json()),
            authFetch(`${baseUrl}/task/my?userId=${userId}&limit=100`).then(
              (r) => r.json(),
            ),
            authFetch(`${baseUrl}/user/${userId}`).then((r) => r.json()),
          ]);

        // Process orders - filter by user and apply buyer assignment logic
        const allOrders = ordersRes?.data || [];

        // Apply buyer assignment filtering for non-admin users
        const user = userRes;
        const assignedBuyerIds =
          user?.assignedBuyers?.map((buyer: Buyer) => buyer.id) || [];
        const isAdminOrSuperAdmin =
          user?.role === "admin" || user?.role === "super_admin";

        // For admin/super admin: show all orders
        // For regular users: show only orders where buyer is assigned to them
        const filteredOrders = isAdminOrSuperAdmin
          ? allOrders
          : allOrders.filter(
              (order: Order) =>
                assignedBuyerIds.length > 0 &&
                assignedBuyerIds.includes(order.buyerId),
            );

        // Process commercials - filter by user buyer assignments
        const allCommercials = commercialsRes?.data || [];
        let userCommercials = allCommercials;

        // Apply buyer assignment filtering for non-admin users
        if (!isAdminOrSuperAdmin && assignedBuyerIds.length > 0) {
          userCommercials = allCommercials.filter((commercial: Commercial) => {
            const orders = commercial.orders;
            const buyerId = orders?.find((o) => o.order?.buyer?.id)?.order
              ?.buyer?.id;
            return buyerId && assignedBuyerIds.includes(buyerId);
          });
        } else if (!isAdminOrSuperAdmin && assignedBuyerIds.length === 0) {
          userCommercials = [];
        }

        // Process contacts - filter by user
        const allContacts = contactsRes?.data || [];
        const userContacts = allContacts.filter(
          (contact: Contact) => contact.authorId === parseInt(userId),
        );

        // Process tasks
        const userTasks = tasksRes?.data || [];

        // Calculate stats
        const totalOrderValue = filteredOrders.reduce(
          (sum: number, order: Order) => sum + (order.totalPrice || 0),
          0,
        );
        const pendingOrders = filteredOrders.filter(
          (order: Order) => order.isShipped === false,
        ).length;
        const shippedOrders = filteredOrders.filter(
          (order: Order) => order.isShipped === true,
        ).length;
        const recentOrders = filteredOrders
          .sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        // Calculate overdue shipments (past ship dates, not shipped)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueShipments = filteredOrders
          .filter((order: Order) => {
            if (order.isShipped || !order.shipDate) return false;
            const shipDate = new Date(order.shipDate);
            shipDate.setHours(0, 0, 0, 0);
            return shipDate < today;
          })
          .sort(
            (a: Order, b: Order) =>
              new Date(a.shipDate!).getTime() - new Date(b.shipDate!).getTime(),
          )
          .slice(0, 5);

        // Calculate upcoming shipments (next 30 days, not shipped)
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        const upcomingShipments = filteredOrders
          .filter((order: Order) => {
            if (order.isShipped || !order.shipDate) return false;
            const shipDate = new Date(order.shipDate);
            shipDate.setHours(0, 0, 0, 0);
            return shipDate >= today && shipDate <= thirtyDaysFromNow;
          })
          .sort(
            (a: Order, b: Order) =>
              new Date(a.shipDate!).getTime() - new Date(b.shipDate!).getTime(),
          )
          .slice(0, 5);

        const pendingInvoices = userCommercials.filter(
          (commercial: Commercial) => commercial.paymentStatus === "PENDING",
        ).length;
        const totalCommission = userCommercials.reduce(
          (sum: number, commercial: Commercial) =>
            sum + (commercial.lacAmount || 0),
          0,
        );
        const recentCommercials = userCommercials
          .sort(
            (a: Commercial, b: Commercial) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        const todayContacts = userContacts.filter(
          (contact: Contact) =>
            new Date(contact.createdAt).toDateString() === todayStr,
        ).length;
        const weekContacts = userContacts.filter(
          (contact: Contact) => new Date(contact.createdAt) >= weekStart,
        ).length;
        const wonContacts = userContacts.filter(
          (contact: Contact) => contact.status === "CLOSED_WON",
        ).length;
        const conversionRate =
          userContacts.length > 0
            ? Math.round((wonContacts / userContacts.length) * 100)
            : 0;

        const activeTasks = userTasks.filter((task: Task) => task.isActive);
        const completedToday = userTasks.filter((task: Task) => {
          const todayLogs =
            task.dailyLogs?.filter(
              (log) => new Date(log.date).toDateString() === todayStr,
            ) || [];
          return todayLogs.some(
            (log) => log.achieved >= (log.targetValue || task.targetValue),
          );
        }).length;

        const upcomingDeadlines = activeTasks.slice(0, 3);

        const assignedBuyers = user?.assignedBuyers || [];

        setStats({
          orders: {
            myOrders: filteredOrders,
            totalValue: totalOrderValue,
            pendingOrders,
            shippedOrders,
            recentOrders,
            overdueShipments,
            upcomingShipments,
          },
          commercial: {
            myCommercials: userCommercials,
            pendingInvoices,
            totalCommission,
            recentCommercials,
          },
          contacts: {
            myContacts: userContacts,
            todayContacts,
            weekContacts,
            wonContacts,
            conversionRate,
          },
          tasks: {
            activeTasks,
            completedToday,
            totalTasks: userTasks.length,
            upcomingDeadlines,
          },
          buyers: {
            assignedBuyers,
            totalBuyers: assignedBuyers.length,
          },
        });
      } catch (error) {
        console.error("Failed to fetch user dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserIntelligence();
  }, [authFetch, isAuthLoading, userId]);

  if (loading) return <Loading />;
  if (!stats) return <div>Failed to load dashboard data</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {session?.user?.name}s Command Center
            </h1>
            <p className="text-slate-600 mt-1">
              Your personal operations dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/user-dashboard")}
              className="mr-2"
            >
              Lead Dashboard
            </Button>
            <Badge variant="outline" className="px-3 py-1">
              <UserIcon className="w-4 h-4 mr-2" />
              {session?.user?.name}
            </Badge>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Assigned Orders
              </CardTitle>
              <Package className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.orders.myOrders.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.orders.pendingOrders} pending •{" "}
                {stats.orders.shippedOrders} shipped
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Order Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.orders.totalValue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total value this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.contacts.myContacts.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.contacts.todayContacts} today •{" "}
                {stats.contacts.conversionRate}% conversion
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Active Tasks
              </CardTitle>
              <Target className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.tasks.activeTasks.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.tasks.completedToday} completed today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recently Received Orders
              </CardTitle>
              <CardDescription>Orders for your assigned buyers</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ship Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.orders.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.buyer?.name || "N/A"}</TableCell>
                        <TableCell>
                          {formatCurrency(order.totalPrice || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={order.isShipped ? "default" : "secondary"}
                          >
                            {order.isShipped ? "Shipped" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(order.shipDate || order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.orders.recentOrders.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-slate-500 py-8"
                        >
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Overdue Shipments */}
          <Card className="bg-white border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-red-600" />
                Overdue Shipments
              </CardTitle>
              <CardDescription className="text-red-600">
                Orders past their ship date that haven&apos;t been shipped yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Ship Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.orders.overdueShipments.map((order) => {
                      const shipDate = new Date(order.shipDate!);
                      const today = new Date();
                      const daysOverdue = Math.floor(
                        (today.getTime() - shipDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>{order.buyer?.name || "N/A"}</TableCell>
                          <TableCell>
                            {formatCurrency(order.totalPrice || 0)}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {formatDate(order.shipDate)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {daysOverdue} days
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {stats.orders.overdueShipments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-green-600 py-8"
                        >
                          No overdue shipments! 🎉
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Upcoming Shipments */}
          <Card className="bg-white border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Upcoming Shipments
              </CardTitle>
              <CardDescription className="text-blue-600">
                Orders scheduled to ship in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Ship Date</TableHead>
                      <TableHead>Days Until Ship</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.orders.upcomingShipments.map((order) => {
                      const shipDate = new Date(order.shipDate!);
                      const today = new Date();
                      const daysUntilShip = Math.ceil(
                        (shipDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>{order.buyer?.name || "N/A"}</TableCell>
                          <TableCell>
                            {formatCurrency(order.totalPrice || 0)}
                          </TableCell>
                          <TableCell className="text-blue-600">
                            {formatDate(order.shipDate)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-blue-600">
                              {daysUntilShip === 0
                                ? "Today"
                                : `${daysUntilShip} days`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {stats.orders.upcomingShipments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-slate-500 py-8"
                        >
                          No upcoming shipments in the next 30 days
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tasks & Deadlines */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tasks & Deadlines
              </CardTitle>
              <CardDescription>
                Your active tasks and upcoming deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.tasks.upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      Target: {task.targetValue}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.targetValue} target
                  </Badge>
                </div>
              ))}
              {stats.tasks.upcomingDeadlines.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  No upcoming deadlines
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/my-task")}
              >
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Contact Performance
              </CardTitle>
              <CardDescription>Your contact management metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Today&apos;s Contacts</span>
                  <span className="font-medium">
                    {stats.contacts.todayContacts}
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    (stats.contacts.todayContacts / 10) * 100,
                    100,
                  )}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Weekly Contacts</span>
                  <span className="font-medium">
                    {stats.contacts.weekContacts}
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    (stats.contacts.weekContacts / 50) * 100,
                    100,
                  )}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conversion Rate</span>
                  <span className="font-medium">
                    {stats.contacts.conversionRate}%
                  </span>
                </div>
                <Progress
                  value={stats.contacts.conversionRate}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Overview
              </CardTitle>
              <CardDescription>
                Your business performance summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.commercial.pendingInvoices}
                  </div>
                  <div className="text-xs text-slate-500">Pending Invoices</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(stats.commercial.totalCommission)}
                  </div>
                  <div className="text-xs text-slate-500">Total Commission</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.buyers.totalBuyers}
                  </div>
                  <div className="text-xs text-slate-500">Assigned Buyers</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.contacts.wonContacts}
                  </div>
                  <div className="text-xs text-slate-500">Won Contacts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {/* <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => router.push("/dashboard/contact/create-contact")}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">New Contact</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => router.push("/dashboard/order/create-order")}
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">New Order</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() =>
                  router.push("/dashboard/commercial/create-invoice")
                }
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">New Invoice</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => router.push("/dashboard/my-task")}
              >
                <Target className="h-6 w-6" />
                <span className="text-sm">My Tasks</span>
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default UserCommandCenter;
