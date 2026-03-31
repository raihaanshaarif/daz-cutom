import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/order/orders/stats`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch order stats");
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      {
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        averageOrderValue: 0,
        commissionStatusBreakdown: [],
        lastWeekOrders: 0,
        lastMonthOrders: 0,
        pendingCommissionAmount: 0,
        topBuyers: [],
        topFactories: [],
      },
      { status: 500 },
    );
  }
}
