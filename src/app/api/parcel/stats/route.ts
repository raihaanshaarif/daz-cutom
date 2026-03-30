import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/parcel/stats`);
    if (!res.ok) {
      throw new Error("Failed to fetch parcel stats");
    }
    const response = await res.json();
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching parcel stats:", error);
    return NextResponse.json(
      {
        totalParcels: 0,
        totalWeight: 0,
        averageWeight: 0,
        parcelsByCompany: [],
        parcelsByBuyer: [],
        lastWeekParcels: 0,
        lastMonthParcels: 0,
        topCompanies: [],
        topBuyers: [],
      },
      { status: 500 },
    );
  }
}
