import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/commercial/stats`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch commercial stats");
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching commercial stats:", error);
    return NextResponse.json(
      {
        totalCommercials: 0,
        totalValue: 0,
        totalLacAmount: 0,
        totalReceived: 0,
        totalOutstanding: 0,
        averageCommercialValue: 0,
        documentStatusBreakdown: [],
        paymentStatusBreakdown: [],
        lastWeekCommercials: 0,
        lastMonthCommercials: 0,
        pendingPaymentAmount: 0,
        topCommercialsByValue: [],
      },
      { status: 500 },
    );
  }
}
